import { App, PluginSettingTab, Setting } from "obsidian"
import BlaBlaPlugin from "../main"

export interface PluginSettings {
	removeBrackets: boolean;
	removeEmphasis: boolean;
	removeTags: boolean;
	removeComments: boolean;
    migrateSettingsFromBuildinTemplates: boolean;
	templateFolder: string | undefined;
    dateFormat: string;
    timeFormat: string;
}


export const DEFAULT_SETTINGS: PluginSettings = {
	removeBrackets: true,
	removeEmphasis: false,
	removeTags: false,
	removeComments: false,
    migrateSettingsFromBuildinTemplates: true,
	templateFolder: undefined,
    dateFormat: "YYYY-MM-DD",
    timeFormat: "HH:mm"
}

export class BlaBlaSettingTab extends PluginSettingTab {
	plugin: BlaBlaPlugin;

	constructor(app: App, plugin: BlaBlaPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();
        this.containerEl.createEl("h1", { text: "Template expanding" });

        new Setting(containerEl)
			.setName('Migrate settings from buildin `Templates` plugin')
			.setDesc('If enabled, template folder is taken from buildin `Templates` settings')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.migrateSettingsFromBuildinTemplates)
				.onChange(async (value) => {
					this.plugin.settings.migrateSettingsFromBuildinTemplates = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Path to templates')
			.setDesc('Path to your templates folder')
			.addText(text => text
				.setPlaceholder('Enter your path')
				.setValue(this.plugin.settings.templateFolder ?? "")
				.onChange(async (value) => {
					this.plugin.settings.templateFolder = value.trim() == "" ? DEFAULT_SETTINGS.templateFolder : value.trim();
					await this.plugin.saveSettings();
				}));

        new Setting(containerEl)
			.setName('Date format')
			.setDesc('{{date}} in the template file will be replaced by this value')
			.addText(text => text
				.setPlaceholder('YYYY-MM-DD')
				.setValue(this.plugin.settings.dateFormat)
				.onChange(async (value) => {
					this.plugin.settings.dateFormat = value == "" ? DEFAULT_SETTINGS.dateFormat : value;
					await this.plugin.saveSettings();
				}));

        new Setting(containerEl)
			.setName('Time format')
			.setDesc('{{time}} in the template file will be replaced by this value')
			.addText(text => text
				.setPlaceholder('HH:mm')
				.setValue(this.plugin.settings.timeFormat)
				.onChange(async (value) => {
					this.plugin.settings.timeFormat = value == "" ? DEFAULT_SETTINGS.timeFormat : value;
					await this.plugin.saveSettings();
				}));

        this.containerEl.createEl("h1", { text: "Copy plain Markdown" });

		new Setting(containerEl)
			.setName("Remove Wikilink brackets")
			.setDesc("If enabled, removes wikilink brackets from copied text.")
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.removeBrackets)
				.onChange(async (value) => {
					this.plugin.settings.removeBrackets = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName("Remove text emphasis")
			.setDesc("If enabled, removes highlights.")
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.removeEmphasis)
				.onChange(async (value) => {
					this.plugin.settings.removeEmphasis = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName("Remove hashtags")
			.setDesc("If enabled, removes text immediately after a hashtag.")
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.removeTags)
				.onChange(async (value) => {
					this.plugin.settings.removeTags = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName("Remove comments")
			.setDesc("If enabled, removes commented text.")
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.removeComments)
				.onChange(async (value) => {
					this.plugin.settings.removeComments = value;
					await this.plugin.saveSettings();
				}));
	}
}