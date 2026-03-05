import * as assert from 'assert';
import * as vscode from 'vscode';
import { extractFromCursor } from '../../utils/functionExtractor';

suite('JavaScript/TypeScript Extractor Test Suite', () => {
    test('Extract arrow function', async () => {
        const doc = await vscode.workspace.openTextDocument({
            language: 'javascript',
            content: `\nexport const myArrowFunc = async (x, y) => {\n    const z = x + y;\n    return z;\n}\n`
        });

        const editor = await vscode.window.showTextDocument(doc);

        // Move cursor inside the function
        editor.selection = new vscode.Selection(new vscode.Position(1, 20), new vscode.Position(1, 20));

        const func = extractFromCursor(editor);

        assert.ok(func, "Function should be extracted");
        if (func) {
            assert.strictEqual(func.name, 'myArrowFunc');
            assert.strictEqual(func.startLine, 1);
            assert.strictEqual(func.endLine, 4);
            assert.strictEqual(func.isAsync, true);
        }
    });
});
