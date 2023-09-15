import { App, FileSystemAdapter } from "obsidian"
import * as fs from 'fs';
import { ITemplate } from '../main'

export function getVaultPath(app: App) {
	let adapter = app.vault.adapter;
	if (adapter instanceof FileSystemAdapter) {
		return adapter.getBasePath();
	}
	return null;
}

export function getExpandedTemplate(template: ITemplate) {
    const moment = (<any>window).moment;
    const text = fs.readFileSync(template.templatePath, "utf-8")
				.replace(/{{date}}/gi, moment().format("YYYY-MM-DD"))
				.replace(/{{date\s*\+\s*(\d+)}}/gi, (match, number) => {
					const daysToAdd = parseInt(number, 10);
					const newDate = moment().add(daysToAdd, "days").format("YYYY-MM-DD");
					return newDate;})
				.replace(/{{date\s*-\s*(\d+)}}/gi, (match, number) => {
					const daysToAdd = parseInt(number, 10);
					const newDate = moment().add(-daysToAdd, "days").format("YYYY-MM-DD");
					return newDate;})
				.replace(/{{time}}/gi, moment().format("HH:mm"))
				.replace(/{{title}}/gi, template.templateName);
    return text;
}