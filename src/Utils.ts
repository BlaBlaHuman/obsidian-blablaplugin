import { App, FileSystemAdapter, Plugin } from "obsidian"
import * as fs from 'fs';
import BlaBlaPlugin, { ITemplate } from '../main'

export function getVaultPath(app: App) {
	let adapter = app.vault.adapter;
	if (adapter instanceof FileSystemAdapter) {
		return adapter.getBasePath();
	}
	return null;
}

export function getExpandedTemplate(template: ITemplate, plugin: BlaBlaPlugin) {
    const moment = (<any>window).moment;
    const text = fs.readFileSync(template.templatePath, "utf-8")
				.replace(/{{date}}/gi, moment().format(plugin.settings.dateFormat))
				.replace(/{{date\s*\+\s*(\d+)}}/gi, (match, number) => {
					const daysToAdd = parseInt(number, 10);
					const newDate = moment().add(daysToAdd, "days").format(plugin.settings.dateFormat);
					return newDate;})
				.replace(/{{date\s*-\s*(\d+)}}/gi, (match, number) => {
					const daysToAdd = parseInt(number, 10);
					const newDate = moment().add(-daysToAdd, "days").format(plugin.settings.dateFormat);
					return newDate;})
				.replace(/{{time}}/gi, moment().format(plugin.settings.timeFormat))
				.replace(/{{title}}/gi, template.templateName);
    return text;
}