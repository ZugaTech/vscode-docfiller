import * as vscode from 'vscode';
import { ExtractedFunction } from '../types';
import { OpenAIClient } from '../api/openaiClient';

export class JSProvider {
    constructor(private client: OpenAIClient, private config: vscode.WorkspaceConfiguration) { }

    async generateJSDoc(func: ExtractedFunction): Promise<string> {
        const format = this.config.get<string>('jsDocFormat') || 'jsdoc';
        return await this.client.generateDocstring(func, format, func.language);
    }

    getJSDocEdit(func: ExtractedFunction, docstring: string): vscode.TextEdit {
        const indentString = ' '.repeat(func.indentLevel);

        // Format as JSDoc block
        let formattedDocstring = `${indentString}/**\n`;
        const lines = docstring.split('\n');
        for (const line of lines) {
            formattedDocstring += `${indentString} * ${line}\n`;
        }
        formattedDocstring += `${indentString} */\n`;

        const pos = new vscode.Position(func.startLine, 0); // Line before function
        return vscode.TextEdit.insert(pos, formattedDocstring);
    }
}
