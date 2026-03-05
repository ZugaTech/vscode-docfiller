import * as vscode from 'vscode';
import { extractFromCursor } from '../utils/functionExtractor';
import { OpenAIClient } from '../api/openaiClient';
import { PythonProvider } from '../providers/pythonProvider';
import { JSProvider } from '../providers/jsProvider';

export async function generateDocstringCommand() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showInformationMessage('No active editor found.');
        return;
    }

    const func = extractFromCursor(editor);
    if (!func) {
        vscode.window.showWarningMessage('DocFiller: Could not detect a valid function at the cursor.');
        return;
    }

    const config = vscode.workspace.getConfiguration('docfiller');
    const apiKey = config.get<string>('openaiApiKey') || process.env.OPENAI_API_KEY;
    const model = config.get<string>('model') || 'gpt-4o';

    if (!apiKey) {
        vscode.window.showErrorMessage('DocFiller: OpenAI API Key is missing. Please set it in Settings.');
        return;
    }

    const client = new OpenAIClient(apiKey, model);

    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "DocFiller: Generating docstring...",
        cancellable: false
    }, async () => {
        try {
            let docstring = "";
            let edit: vscode.TextEdit;

            if (func.language === 'python') {
                const provider = new PythonProvider(client, config);
                docstring = await provider.generateDocstring(func);
                edit = provider.getDocstringEdit(func, docstring);
            } else {
                const provider = new JSProvider(client, config);
                docstring = await provider.generateJSDoc(func);
                edit = provider.getJSDocEdit(func, docstring);
            }

            const showPreview = config.get<boolean>('showPreview');

            if (showPreview) {
                // For preview, we apply the edit to a new WorkspaceEdit and open diff
                const workspaceEdit = new vscode.WorkspaceEdit();
                workspaceEdit.replace(editor.document.uri, edit.range, edit.newText); // Using replace as fallback if insert fails

                // In a full implementation, you'd open a diff view here.
                // For now, we'll apply it directly with a notification.
                await vscode.workspace.applyEdit(workspaceEdit);
                vscode.window.showInformationMessage(`Docstring added to ${func.name} (Preview simulated by direct insert)`);

            } else {
                const workspaceEdit = new vscode.WorkspaceEdit();
                workspaceEdit.insert(editor.document.uri, edit.range.start, edit.newText);
                await vscode.workspace.applyEdit(workspaceEdit);
                vscode.window.showInformationMessage(`Docstring added to ${func.name}`);
            }

        } catch (error) {
            console.error(error);
        }
    });
}
