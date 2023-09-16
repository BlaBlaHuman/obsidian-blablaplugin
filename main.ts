import { App, Editor, SuggestModal, Plugin, Notice, TFile } from 'obsidian';
import { BlaBlaSettingTab, PluginSettings, DEFAULT_SETTINGS } from "src/Settings"
import { getVaultPath } from 'src/Utils';
import { getExpandedTemplate } from 'src/Utils';
import * as path from "path"
import { migrateTemplatesFolder, IDailyNotesSettings, migrateDailyNotesSettings } from 'src/MigrateSettings';
import * as fs from 'fs';

export interface ITemplate {
	templatePath: string;
	templateName: string;
}

export default class BlaBlaPlugin extends Plugin {
	settings: PluginSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: 'expand-template',
			name: 'Expand template',
			hotkeys: [{ modifiers: ["Mod"], key: "y" }],
			editorCallback: (editor: any) => this.expandTemplate(editor)
		});

		this.addCommand({
			id: 'copy-plain-markdown',
			name: 'Copy plain markdown',
			hotkeys: [{ modifiers: ["Mod", "Shift"], key: "c" }],
			callback: () => this.copyPlainMarkdown()
		});

		this.addCommand({
			id: 'copy-structural-formatting',
			name: 'Copy structural formatting only',
			hotkeys: [{ modifiers: ["Mod", "Shift"], key: "x" }],
			callback: () => this.copyStructuralFormatting()
		});

		this.addCommand({
			id: 'open-tomorrow-note',
			name: 'Open tomorrow note',
			callback: () => {
				this.openOrCreateNote(1)
			}
		});

		this.addCommand({
			id: 'open-yesterday-note',
			name: 'Open yesterday note',
			callback: () => {
				this.openOrCreateNote(-1)
			}
		});

		this.addSettingTab(new BlaBlaSettingTab(this.app, this));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async openOrCreateNote(daysShift: number) {
		const dailyNotesSettings = migrateDailyNotesSettings(this);
		const moment = (<any>window).moment;

		if (!dailyNotesSettings) {
			new Notice("`Daily notes` plugin is not available")
			return;
		}

		const vaultPath = getVaultPath(this.app);
		if (!vaultPath)
			return;

		let dailyNotesFolder = this.app.vault.getAbstractFileByPath(dailyNotesSettings.newFileLocation);
		if (!dailyNotesFolder) {
			dailyNotesFolder = await this.app.vault.createFolder(dailyNotesSettings.newFileLocation);
		}

		const noteName = moment().add(daysShift, "days").format(dailyNotesSettings.dateFormat);
		const notePath = path.join(dailyNotesSettings.newFileLocation, noteName + ".md");
		let file: TFile | null = this.app.vault.getAbstractFileByPath(notePath) as TFile;

		if (!file) {
			const templateFile = this.app.vault.getAbstractFileByPath(dailyNotesSettings.templateFileLocation + ".md") as TFile;
			if (!templateFile)
				return;
			const templateText = await getExpandedTemplate(templateFile, this);
			file = await this.app.vault.create(notePath, templateText);
		}

		await this.app.workspace.openLinkText(file.path, '', true, { active: true });
	}

	async copyPlainMarkdown() {
		const noteFile = this.app.workspace.getActiveFile();
		if (!noteFile?.name) return;

		let text = await this.app.vault.read(noteFile);
		text = text.replace(/\[\[.*?\]\]/g, '');
		text = text.replace(/---.*?---/g, '');

		text = text.replace(/==/g, '');
		text = text.replace(/\^\w+/g, '');
		if (this.settings.removeBrackets) {
			text = text.replace(/\[\[(.*?)\]\]/g, '$1');
		}

		if (this.settings.removeEmphasis) {
			text = text.replace(/[*~]+(\w+)[*~]+/g, '$1');
		}

		if (this.settings.removeTags) {
			text = text.replace(/#\w+/g, '');
		}

		if (this.settings.removeComments) {
			text = text.replace(/%%.+%%/g, '');
		}

		var blob = new Blob([text], { type: 'text/plain' });
		const data = [new ClipboardItem({
			["text/plain"]: blob,
		})];
		navigator.clipboard.write(data);
	}

	async copyStructuralFormatting() {
		const noteFile = this.app.workspace.getActiveFile();
		if (!noteFile?.name) return;

		let text = await this.app.vault.read(noteFile);
		text = text.replace(/\[\[.*?\]\]/g, '');
		text = text.replace(/---.*?---/g, '');
		var blob = new Blob([text], { type: 'text/plain' });
		const data = [new ClipboardItem({
			["text/plain"]: blob,
		})];
		navigator.clipboard.write(data);
	}

	expandTemplate(editor: Editor) {
		let templateFolderPath: string;

		if (this.settings.migrateSettingsFromBuildinTemplates) {
			let internalTemplateFolder = migrateTemplatesFolder(this);
			if (internalTemplateFolder == undefined) {
				new Notice("Builtin plugin `Templates` is not available")
				return;
			}

			templateFolderPath = internalTemplateFolder;
		}

		else {
			let localTemplateFolder = this.settings.templateFolder;
			if (localTemplateFolder == undefined) {
				new Notice("Templates folder is not specified")
				return;
			}

			templateFolderPath = localTemplateFolder;
		}

		const templateName = editor.getSelection();

		const files = this.app.vault.getMarkdownFiles().filter((file) =>
			file.path.startsWith(templateFolderPath)
		)

		const vaultPath = getVaultPath(this.app);
		if (!vaultPath)
			return;

		let templatesCollection = files.filter(it => it.basename === templateName);

		if (!templatesCollection.length) {
			new Notice(`Template ${templateName} was not found`)
			return;
		}

		const insertTemplate = async (template: TFile) => {
			const templateText = await getExpandedTemplate(template, this);
			editor.replaceSelection(templateText);
		}

		if (templatesCollection.length == 1) {
			let template = templatesCollection.first();
			if (!template)
				return;
			insertTemplate(template);
		}
		else {
			const modal = new TemplatesModal(this.app, templatesCollection, insertTemplate);
			modal.open();
		}
	}

}



export class TemplatesModal extends SuggestModal<TFile> {
	suggestions: TFile[];
	callback: Function;

	constructor(app: App, suggestions: TFile[], callback: Function) {
		super(app);
		this.suggestions = suggestions;
		this.callback = callback;
	}
	getSuggestions(query: string): TFile[] {
		return this.suggestions.filter((it) =>
			it.path.toLowerCase().includes(query.toLowerCase())
		);
	}

	renderSuggestion(template: TFile, el: HTMLElement) {
		el.createEl("div", { text: template.basename });
		el.createEl("small", { text: template.path });
	}

	onChooseSuggestion(template: TFile, evt: MouseEvent | KeyboardEvent) {
		this.callback(template);
	}
}

