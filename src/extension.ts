import * as vscode from 'vscode';
import { generateDocstringCommand } from './commands/generateDocstring';
import { generateTypeHintsCommand } from './commands/generateTypeHints';

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "docfiller-ai" is now active!');

    let disposableDocstring = vscode.commands.registerCommand('docfiller.generateDocstring', async () => {
        await generateDocstringCommand();
    });

    let disposableTypeHints = vscode.commands.registerCommand('docfiller.generateTypeHints', async () => {
        await generateTypeHintsCommand();
    });

    let disposableBoth = vscode.commands.registerCommand('docfiller.generateBoth', async () => {
        await generateTypeHintsCommand();
        // Wait briefly for edits to apply
        setTimeout(async () => {
            await generateDocstringCommand();
        }, 500);
    });

    context.subscriptions.push(disposableDocstring);
    context.subscriptions.push(disposableTypeHints);
    context.subscriptions.push(disposableBoth);
}

export function deactivate() { }
