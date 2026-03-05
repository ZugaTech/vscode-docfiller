import * as vscode from 'vscode';
import { extractFromCursor } from '../utils/functionExtractor';
import { OpenAIClient } from '../api/openaiClient';
import { PythonProvider } from '../providers/pythonProvider';

export async function generateTypeHintsCommand() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    if (editor.document.languageId !== 'python') {
        vscode.window.showWarningMessage('DocFiller: Type Hint generation is currently only supported for Python.');
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
    const provider = new PythonProvider(client, config);

    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "DocFiller: Inferring type hints...",
        cancellable: false
    }, async () => {
        try {
            const hints = await provider.generateTypeHints(func);

            // Reconstruct the signature (very naive implementation)
            // A real implementation requires AST parsing to not break default args etc.
            let newSig = func.source.split('\n')[0];

            for (const hint of hints) {
                if (hint.argName === "RETURN_TYPE") {
                    newSig = newSig.replace(/:$/, ` -> ${hint.inferredType}:`);
                } else if (!newSig.includes(`${hint.argName}:`)) {
                    // Prevent replacement if typing already exists or regex is weak
                    const regex = new RegExp(`\\b${hint.argName}\\b(?=[\\s,)])`);
                    newSig = newSig.replace(regex, `${hint.argName}: ${hint.inferredType}`);
                }
            }

            const workspaceEdit = new vscode.WorkspaceEdit();
            const range = new vscode.Range(func.startLine, 0, func.startLine, editor.document.lineAt(func.startLine).text.length);
            workspaceEdit.replace(editor.document.uri, range, newSig);

            await vscode.workspace.applyEdit(workspaceEdit);
            vscode.window.showInformationMessage(`Type hints added to ${func.name}`);

        } catch (error) {
            console.error(error);
        }
    });
}
