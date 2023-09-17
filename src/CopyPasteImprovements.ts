import BlaBlaPlugin from "main";
import { Editor } from "obsidian";

export function copyStructuralFormatting(editor: Editor) {
    let textToCopy = editor.getSelection();
    if (textToCopy == "") {
        textToCopy = editor.getValue();
    }

    textToCopy = textToCopy.replace(/<(.|\n)*?>/g, '');
    var blob = new Blob([textToCopy], { type: 'text/plain' });
    const data = [new ClipboardItem({
        ["text/plain"]: blob,
    })];
    navigator.clipboard.write(data);
}

export async function copyPlainMarkdown(plugin: BlaBlaPlugin, editor: Editor) {
    let text = editor.getSelection();
    if (text == "") {
        text = editor.getValue();
    }

    text = text.replace(/---.*?---/g, ''); // Removes aliases
    text = text.replace(/<(.|\n)*?>/g, ''); // Removes tag formatting
    text = text.replace(/\[\^\w+\]/g, '');

    if (plugin.settings.removeBrackets) {
        text = text.replace(/\[\[(.*?)\]\]/g, '$1');
    }

    if (plugin.settings.removeEmphasis) {
        text = text.replace(/==/g, ''); // Removes highlights
    }

    if (plugin.settings.removeTags) {
        text = text.replace(/#\w+/g, '');
    }

    if (plugin.settings.removeComments) {
        text = text.replace(/%%.+%%/g, '');
    }

    var blob = new Blob([text], { type: 'text/plain' });
    const data = [new ClipboardItem({
        ["text/plain"]: blob,
    })];
    navigator.clipboard.write(data);
}