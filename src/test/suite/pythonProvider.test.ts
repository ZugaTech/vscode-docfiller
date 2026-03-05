import * as assert from 'assert';
import * as vscode from 'vscode';
import { extractFromCursor } from '../../utils/functionExtractor';

suite('Python Function Extractor Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('Extract simple python function', async () => {
        const doc = await vscode.workspace.openTextDocument({
            language: 'python',
            content: `def my_func(a, b):\n    print(a)\n    return b\n\ndef other_func():\n    pass`
        });

        const editor = await vscode.window.showTextDocument(doc);

        // Move cursor to first function
        editor.selection = new vscode.Selection(new vscode.Position(0, 5), new vscode.Position(0, 5));

        const func = extractFromCursor(editor);

        assert.ok(func, "Function should be extracted");
        if (func) {
            assert.strictEqual(func.name, 'my_func');
            assert.strictEqual(func.startLine, 0);
            assert.strictEqual(func.endLine, 2);
            assert.deepStrictEqual(func.args, [{ name: "a", existingType: null }, { name: "b", existingType: null }]);
        }
    });
});
