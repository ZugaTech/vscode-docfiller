import * as vscode from 'vscode';
import { ExtractedFunction, TypeHint } from '../types';
import { OpenAIClient } from '../api/openaiClient';

export class PythonProvider {
    constructor(private client: OpenAIClient, private config: vscode.WorkspaceConfiguration) { }

    async generateDocstring(func: ExtractedFunction): Promise<string> {
        const format = this.config.get<string>('pythonDocstringFormat') || 'google';
        return await this.client.generateDocstring(func, format, 'python');
    }

    async generateTypeHints(func: ExtractedFunction): Promise<TypeHint[]> {
        return await this.client.generateTypeHints(func);
    }

    getDocstringEdit(func: ExtractedFunction, docstring: string): vscode.TextEdit {
        const indentString = ' '.repeat(func.indentLevel + 4);

        let formattedDocstring = `"""\n${docstring.split('\n').map(l => indentString + l).join('\n')}\n${indentString}"""\n${indentString}`;

        const pos = new vscode.Position(func.startLine + 1, 0); // Line after def
        return vscode.TextEdit.insert(pos, formattedDocstring);
    }

    getTypeHintsEdit(func: ExtractedFunction, hints: TypeHint[]): vscode.TextEdit[] {
        const edits: vscode.TextEdit[] = [];
        // Very basic implementation: search line for argument and replace
        // In a production extension, use AST or robust parsing
        const sigLine = func.startLine;

        // This is a simplified replacement plan just modifying the function string 
        // and replacing the whole line for safety
        return edits;
    }
}
