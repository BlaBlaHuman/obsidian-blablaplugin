import { Editor, Plugin, Command, MarkdownView, } from 'obsidian';
import { BlaBlaSettingTab, PluginSettings, DEFAULT_SETTINGS } from "src/Settings"
import { DailyNotesSuggestModal, openOrCreateNote } from 'src/DailyNotes';
import { expandTemplate } from 'src/Templates';
import { copyPlainMarkdown, copyStructuralFormatting } from 'src/CopyPasteImprovements';

export default class BlaBlaPlugin extends Plugin {
	settings: PluginSettings;
	commands: Command[] = [];

	async onload() {
		await this.loadSettings();

		const expandTemplateCommand = this.addCommand({
			id: 'expand-template',
			name: 'Expand template',
			editorCallback: (editor: any) => expandTemplate(this, editor)
		});
		this.commands.push(expandTemplateCommand);

		const copyPlaiMarkdownCommand = this.addCommand({
			id: 'copy-plain-markdown',
			name: 'Copy plain markdown',
			editorCallback: (editor: any) => copyPlainMarkdown(this, editor)
		});
		this.commands.push(copyPlaiMarkdownCommand)


		const copyStructuralFormattingCommand = this.addCommand({
			id: 'copy-structural-formatting',
			name: 'Copy structural formatting only',
			editorCallback: (editor: any) => copyStructuralFormatting(editor)
		});
		this.commands.push(copyStructuralFormattingCommand)


		const openTomorrowNoteCommand = this.addCommand({
			id: 'open-note-tomorrow',
			name: 'Open tomorrow`s note',
			callback: () => {
				openOrCreateNote(this, 1)
			}
		});
		this.commands.push(openTomorrowNoteCommand)

		const openYesterdayNoteCommand = this.addCommand({
			id: 'open-note-yesterday',
			name: 'Open yesterday`s note',
			callback: () => {
				openOrCreateNote(this, -1)
			}
		});
		this.commands.push(openYesterdayNoteCommand)

		const openTodayNoteCommand = this.addCommand({
			id: 'open-note-today',
			name: 'Open today`s note',
			callback: () => {
				openOrCreateNote(this)
			}
		});
		this.commands.push(openTodayNoteCommand)


		this.addRibbonIcon("calendar", "Open daily note", () => {
			const modal = new DailyNotesSuggestModal(this.app, this.commands.filter(it => {
				return it.id.startsWith(`${this.manifest.id}:open-note`)
			}))
			modal.open()
		});


		const removeTODOsCallback = () => {
			const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (!activeView)
				return;
			const editor = activeView.editor;
			const noteFile = this.app.workspace.getActiveFile();
			if (!noteFile) return;
			let text = editor.getValue();
			let found = false;
			text = text.replace(/\-\s\[\x\]\s([^\n]+)/g, (_match, _cap) => {
				found = true;
				return '';
			});
			if (!found)
				return;

			editor.setValue(text);
		}
		const removeTODOsTimeout = 2000;


		let inputTimeout: NodeJS.Timeout;
		if (this.settings.deleteTODOs)
			inputTimeout = setTimeout(removeTODOsCallback, removeTODOsTimeout);
		this.registerEvent(this.app.workspace.on('editor-change', (_editor, _info) => {
			if (!this.settings.deleteTODOs)
				return;
			clearTimeout(inputTimeout);
			inputTimeout = setTimeout(removeTODOsCallback, removeTODOsTimeout);
		}))

		const removeEmptyLines = this.addCommand({
			id: 'remove-empty-lines',
			name: 'Remove empty lines',
			editorCallback: (editor: Editor) => {
				const noteFile = this.app.workspace.getActiveFile();
				if (!noteFile) return;
				let text = editor.getValue()
				let found = false;
				text = text.replace(/^\s*[\r\n]*/g, (_match, _cap) => {
					found = true;
					return '';
				});
				text = text.replace(/(\r?\n){3,}/g, (_match, _cap) => {
					found = true;
					return '\n\n';
				});

				if (!found)
					return;

				editor.setValue(text);
			}
		});
		this.commands.push(removeEmptyLines)


		this.addSettingTab(new BlaBlaSettingTab(this));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}