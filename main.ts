import { App, Editor, SuggestModal, Plugin, Notice } from 'obsidian';
import { BlaBlaSettingTab, PluginSettings, DEFAULT_SETTINGS } from "src/Settings"
import { getVaultPath } from 'src/Utils';
import { getExpandedTemplate } from 'src/Utils';
import * as path from "path"
import { migrateTemplatesFolder } from 'src/MigrateSettings';

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
			editorCallback: (editor: any) => this.copyPlainMarkdown(editor)
		});

		this.addCommand({
			id: 'copy-structural-formatting',
			name: 'Copy structural formatting only',
			hotkeys: [{ modifiers: ["Mod", "Shift"], key: "x" }],
			editorCallback: (editor: any) => this.copyStructuralFormatting(editor)
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

	async copyPlainMarkdown(editor: Editor) {
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

	async copyStructuralFormatting(editor: Editor) {
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
		let templateFolderPath : string;

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

		const files = this.app.vault.getFiles().filter((file) =>
			file.path.startsWith(templateFolderPath)
		)

		const vaultPath = getVaultPath(this.app);
		if (!vaultPath)
			return;

		let templatesCollection = files.map(it => { return { templatePath: path.join(vaultPath, it.path), templateName: it.basename } as ITemplate }).filter(it => { return it.templatePath.match(/\.md$/) && it.templateName === templateName });

		if (!templatesCollection.length) {
			new Notice(`Template ${templateName} was not found`)
			return;
		}

		const insertTemplate = (template: ITemplate) => {
			const templateText = getExpandedTemplate(template, this);
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

export class TemplatesModal extends SuggestModal<ITemplate> {
	suggestions : ITemplate[];
	callback : Function;

	constructor (app: App, suggestions: ITemplate[], callback: Function) {
		super(app);
		this.suggestions = suggestions;
		this.callback = callback;
	}
	getSuggestions(query: string): ITemplate[] {
	  return this.suggestions.filter((it) =>
		it.templatePath.toLowerCase().includes(query.toLowerCase())
	  );
	}

	renderSuggestion(template: ITemplate, el: HTMLElement) {
	  el.createEl("div", { text: template.templateName });
	  el.createEl("small", { text: template.templatePath });
	}

	onChooseSuggestion(template: ITemplate, evt: MouseEvent | KeyboardEvent) {
		this.callback(template);
	}
  }

