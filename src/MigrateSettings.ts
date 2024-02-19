import BlaBlaPlugin from "../main";
import { DEFAULT_SETTINGS } from "./Settings";

export function migrateTemplatesFolder(plugin: BlaBlaPlugin): string | undefined {
    try {
        const obsidianTemplatesPlugin =
            (plugin.app as any).internalPlugins.getPluginById("templates");

        if (!obsidianTemplatesPlugin) {
            return undefined;
        }

        const obsidianTemplatesSettings =
            obsidianTemplatesPlugin.instance.options;
        if (obsidianTemplatesSettings.folder) {
            return obsidianTemplatesSettings.folder;
        }

    } catch (error) {
        console.log(error.message)
    }

    return undefined;
}

export interface IDailyNotesSettings {
    dateFormat: string,
    newFileLocation: string,
    templateFileLocation: string
}

export function migrateDailyNotesSettings(plugin: BlaBlaPlugin): IDailyNotesSettings | undefined {
    try {
        const dailyNotesPlugin =
            (plugin.app as any).internalPlugins.getPluginById("daily-notes");

        if (!dailyNotesPlugin) {
            return undefined;
        }

        const dailyNotesPluginSettings =
            dailyNotesPlugin.instance.options;

        return {
            dateFormat: dailyNotesPluginSettings.format?.trim() ? dailyNotesPluginSettings.format : DEFAULT_SETTINGS.dateFormat,
            newFileLocation: dailyNotesPluginSettings.folder?.trim() ?  dailyNotesPluginSettings.folder?.trim() : "/",
            templateFileLocation: dailyNotesPluginSettings.template?.trim() ?? DEFAULT_SETTINGS.templateFolder,
        };

    } catch (error) {
        console.log(error.message)
    }

    return undefined;
}