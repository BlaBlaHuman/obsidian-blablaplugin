import { SuggestModal, TFile, App, Notice, Editor} from "obsidian";
import { getExpandedTemplate } from "./Utils";
import { migrateTemplatesFolder } from "./MigrateSettings";
import BlaBlaPlugin from "../main"

export class TemplatesSuggestModal extends SuggestModal<TFile> {
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

	onChooseSuggestion(template: TFile, _evt: MouseEvent | KeyboardEvent) {
		this.callback(template);
	}
}

export function expandTemplate(plugin: BlaBlaPlugin, editor: Editor) {
    let templateFolderPath: string;

    if (plugin.settings.migrateSettingsFromBuildinTemplates) {
        let internalTemplateFolder = migrateTemplatesFolder(plugin);
        if (internalTemplateFolder == undefined) {
            new Notice("Builtin plugin `Templates` is not available")
            return;
        }

        templateFolderPath = internalTemplateFolder;
    }

    else {
        let localTemplateFolder = plugin.settings.templateFolder;
        if (localTemplateFolder == undefined) {
            new Notice("Templates folder is not specified")
            return;
        }

        templateFolderPath = localTemplateFolder;
    }

    const templateName = editor.getSelection().trim();

    const files = plugin.app.vault.getMarkdownFiles().filter((file) =>
        file.path.startsWith(templateFolderPath)
    )

    const insertTemplate = async (template: TFile) => {
        const templateText = await getExpandedTemplate(template, plugin);
        editor.replaceSelection(templateText);
    }

    if (templateName == "") {
        const modal = new TemplatesSuggestModal(plugin.app, files, insertTemplate);
        modal.open();
        return;
    }

    let templatesCollection = files.filter(it => it.basename === templateName);

    if (!templatesCollection.length) {
        new Notice(`Template ${templateName} was not found`)
        return;
    }

    if (templatesCollection.length == 1) {
        let template = templatesCollection.first();
        if (!template)
            return;
        insertTemplate(template);
    }
    else {
        const modal = new TemplatesSuggestModal(plugin.app, templatesCollection, insertTemplate);
        modal.open();
    }
}
