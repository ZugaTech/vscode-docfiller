import * as vscode from 'vscode';
import { ExtractedFunction } from '../types';

export function extractFromCursor(editor: vscode.TextEditor): ExtractedFunction | null {
    const document = editor.document;
    const position = editor.selection.active;
    const lang = document.languageId;

    // A simplified scanner: starts from the cursor and looks up for a function definition,
    // then looks down for the corresponding end block based on indentation or braces.

    let startLine = position.line;
    let endLine = position.line;
    let signatureMatch = null;
    let funcName = "unknown";
    let isAsync = false;
    let isMethod = false;

    // 1. Scan upwards to find the definition
    while (startLine >= 0) {
        const lineText = document.lineAt(startLine).text;

        if (lang === 'python') {
            const pyMatch = lineText.match(/^(\s*)(async\s+)?def\s+([a-zA-Z_]\w*)\s*\(/);
            if (pyMatch) {
                signatureMatch = pyMatch;
                isAsync = !!pyMatch[2];
                funcName = pyMatch[3];
                isMethod = pyMatch[1].length > 0; // simplistic method check
                break;
            }
        } else if (lang === 'javascript' || lang === 'typescript' || lang.includes('react')) {
            const jsMatch = lineText.match(/^(\s*)(export\s+)?(async\s+)?(function)\s+([a-zA-Z_]\w*)\s*\(/) ||
                lineText.match(/^(\s*)(export\s+)?(const|let|var)\s+([a-zA-Z_]\w*)\s*=\s*(async\s+)?(?:\([^)]*\)|[a-zA-Z_]\w*)\s*=>/) ||
                lineText.match(/^(\s*)(async\s+)?([a-zA-Z_]\w*)\s*\([^)]*\)\s*\{/); // class method
            if (jsMatch) {
                signatureMatch = jsMatch;
                isAsync = lineText.includes("async");
                funcName = jsMatch[5] || jsMatch[4] || jsMatch[3];
                isMethod = lineText.trim().endsWith("{") && !lineText.includes("function") && !lineText.includes("=>");
                break;
            }
        }
        startLine--;
    }

    if (!signatureMatch) return null;

    // 2. Scan downwards to find the end
    const baseIndent = signatureMatch[1].length;
    let foundBody = false;

    for (let i = startLine + 1; i < document.lineCount; i++) {
        const lineText = document.lineAt(i).text;
        if (lineText.trim() === '') continue;

        if (lang === 'python') {
            const currentIndent = lineText.match(/^\s*/)?.[0].length || 0;
            if (currentIndent > baseIndent) {
                foundBody = true;
            } else if (foundBody && currentIndent <= baseIndent) {
                endLine = i - 1;
                break;
            }
            if (i === document.lineCount - 1) endLine = i; // End of file
        } else {
            // For JS/TS, a more robust parser would balance braces, 
            // but for this implementation we assume standard indentation or simple closing brace.
            const currentIndent = lineText.match(/^\s*/)?.[0].length || 0;
            if (lineText.trim() === '}' && currentIndent === baseIndent) {
                endLine = i;
                break;
            }
            if (i === document.lineCount - 1) endLine = i;
        }
    }

    const source = document.getText(new vscode.Range(startLine, 0, endLine, document.lineAt(endLine).text.length));

    // Very naive argument extraction for prompting purposes
    const argsMatch = source.match(/\(([^)]*)\)/);
    const args = argsMatch ? argsMatch[1].split(',').map(a => a.trim().split(':')[0].trim()).filter(a => a) : [];

    return {
        name: funcName,
        language: lang,
        source: source,
        startLine: startLine,
        endLine: endLine,
        indentLevel: baseIndent,
        args: args.map(name => ({ name, existingType: null })),
        returnType: null,
        isAsync: isAsync,
        isMethod: isMethod,
        className: null
    };
}

export function extractFromSelection(editor: vscode.TextEditor): ExtractedFunction | null {
    // For robust implementation, we reuse extractFromCursor on the active selection
    return extractFromCursor(editor);
}
