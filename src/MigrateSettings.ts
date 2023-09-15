import BlaBlaPlugin from "../main";

export function migrateTemplatesFolder(plugin: BlaBlaPlugin): string | undefined {
    try {
        const obsidianTemplatesPlugin =
            (plugin.app as any).internalPlugins.plugins["templates"];

        if (!obsidianTemplatesPlugin) {
            return undefined;
        }

        const obsidianTemplatesSettings =
            obsidianTemplatesPlugin.instance.options;
        if (obsidianTemplatesSettings["folder"]) {
            return obsidianTemplatesSettings["folder"];
        }

    } catch (error) {
    }

    return undefined;
}