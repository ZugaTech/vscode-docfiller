import * as vscode from 'vscode';

export interface ExtractedFunction {
    name: string;
    language: string;
    source: string;
    startLine: number;
    endLine: number;
    indentLevel: number;
    args: { name: string; existingType: string | null }[];
    returnType: string | null;
    isAsync: boolean;
    isMethod: boolean;
    className: string | null;
}

export interface TypeHint {
    argName: string;
    inferredType: string;
    confidence: number;
}

export interface GeneratedDoc {
    docstring: string;
    typeHints: TypeHint[] | null;
    format: string;
}

export interface InsertionPlan {
    docstringLine: number;
    docstringText: string;
    typeHintEdits: vscode.TextEdit[];
}
