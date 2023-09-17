import { SuggestModal, Command, Notice, App, TFile } from "obsidian";
import { migrateDailyNotesSettings } from "./MigrateSettings";
import { getExpandedTemplate } from "./Utils";
import * as path from "path"
import BlaBlaPlugin from "main";

export class DailyNotesSuggestModal extends SuggestModal<Command> {
	commands: Command[];

	constructor(app: App, commands: Command[]) {
		super(app);
		this.commands = commands;
	}
	getSuggestions(query: string): Command[] {
		return this.commands.filter((it) =>
			it.name.toLowerCase().includes(query.toLowerCase())
		);
	}

	renderSuggestion(command: Command, el: HTMLElement) {
		el.createEl("div", { text: command.name });
	}

	onChooseSuggestion(command: Command, _evt: MouseEvent | KeyboardEvent) {
		command.callback ? command.callback() : console.error("Daily notes callback was not found");

	}
}

export async function openOrCreateNote(plugin: BlaBlaPlugin, daysShift: number = 0) {
    const dailyNotesSettings = migrateDailyNotesSettings(plugin);
    const moment = window.moment;

    if (!dailyNotesSettings) {
        new Notice("`Daily notes` plugin is not available")
        return;
    }

    let dailyNotesFolder = plugin.app.vault.getAbstractFileByPath(dailyNotesSettings.newFileLocation);
    if (!dailyNotesFolder) {
        new Notice("Daily notes folder was created")
        dailyNotesFolder = await plugin.app.vault.createFolder(dailyNotesSettings.newFileLocation);
    }

    const noteName = moment().add(daysShift, "days").format(dailyNotesSettings.dateFormat);
    const notePath = path.join(dailyNotesSettings.newFileLocation, `${noteName}.md`);
    let file = plugin.app.vault.getAbstractFileByPath(notePath) as TFile;

    if (!file) {
        const templateFile = plugin.app.vault.getAbstractFileByPath(`${dailyNotesSettings.templateFileLocation}.md`) as TFile;
        if (!templateFile)
            return;
        const templateText = await getExpandedTemplate(templateFile, plugin);
        file = await plugin.app.vault.create(notePath, templateText);
    }

    await plugin.app.workspace.openLinkText(file.path, '', true, { active: true });
}