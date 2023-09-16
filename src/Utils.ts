import { App, FileSystemAdapter, Plugin, TFile} from "obsidian"
import BlaBlaPlugin, { ITemplate } from '../main'


export async function getExpandedTemplate(template: TFile, plugin: BlaBlaPlugin) {
    const moment = (<any>window).moment;
    const text = (await plugin.app.vault.read(template))
				.replace(/{{date}}/gi, moment().format(plugin.settings.dateFormat))
                .replace(/{{date\s*\:\s*(.+)}}/gi, (match, format) => {
                    return moment().format(format);
                })
				.replace(/{{date\s*\+\s*(\d+)}}/gi, (match, number) => {
					const daysToAdd = parseInt(number, 10);
					const newDate = moment().add(daysToAdd, "days").format(plugin.settings.dateFormat);
					return newDate;
                })
				.replace(/{{date\s*-\s*(\d+)}}/gi, (match, number) => {
					const daysToAdd = parseInt(number, 10);
					const newDate = moment().add(-daysToAdd, "days").format(plugin.settings.dateFormat);
					return newDate;
                })
				.replace(/{{time}}/gi, moment().format(plugin.settings.timeFormat))
				.replace(/{{title}}/gi, template.basename);
    return text;
}