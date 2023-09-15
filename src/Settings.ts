import { App, PluginSettingTab, Setting } from "obsidian"
import BlaBlaPlugin from "../main"

export interface PluginSettings {
	removeBrackets: boolean;
	removeEmphasis: boolean;
	removeTags: boolean;
	removeComments: boolean;
	mySetting: string;
}


export const DEFAULT_SETTINGS: PluginSettings = {
	removeBrackets: true,
	removeEmphasis: false,
	removeTags: false,
	removeComments: false,
	mySetting: 'default'
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

		new Setting(containerEl)
			.setName('Path to templates')
			.setDesc('Path to your templates folder')
			.addText(text => text
				.setPlaceholder('Enter your path')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));

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
			.setDesc("If enabled, removes text styling such as bold, italics, and highlights.")
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