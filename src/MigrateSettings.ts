import BlaBlaPlugin from "../main";

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
            dateFormat: dailyNotesPluginSettings.format,
            newFileLocation: dailyNotesPluginSettings.folder?.trim(),
            templateFileLocation: dailyNotesPluginSettings.template?.trim(),
        };

    } catch (error) {
    }

    return undefined;
}