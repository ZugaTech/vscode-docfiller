import OpenAI from 'openai';
import * as vscode from 'vscode';
import { ExtractedFunction, TypeHint } from '../types';

export class OpenAIClient {
    private openai: OpenAI;
    private model: string;

    constructor(apiKey: string, model: string) {
        this.openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
        this.model = model;
    }

    async generateDocstring(func: ExtractedFunction, format: string, language: string): Promise<string> {
        try {
            const prompt = `You are an expert ${language} developer. Generate a complete, high-quality docstring for the following function.
Format required: ${format}

Function Signature and Body:
\`\`\`${language}
${func.source}
\`\`\`

Rules:
1. Provide the docstring content ONLY. Do not wrap it in triple quotes.
2. Ensure parameters and return types (if inferable) are documented.
3. Output MUST be valid JSON matching this schema:
{
    "docstring": "The continuous string content of the docstring/JSDoc block."
}`;

            const response = await this.openai.chat.completions.create({
                model: this.model,
                messages: [{ role: 'system', content: prompt }],
                response_format: { type: 'json_object' },
                temperature: 0.1,
            });

            const content = response.choices[0].message.content;
            if (!content) throw new Error("Empty response from OpenAI");

            const data = JSON.parse(content);
            return data.docstring;

        } catch (error: any) {
            vscode.window.showErrorMessage(`DocFiller API Error: ${error.message}`);
            throw error;
        }
    }

    async generateTypeHints(func: ExtractedFunction): Promise<TypeHint[]> {
        try {
            const prompt = `Analyze the following Python function and infer the static types for its arguments and return value.
Return value type should be assigned to the argument name "RETURN_TYPE".

Function Signature and Body:
\`\`\`python
${func.source}
\`\`\`

Output MUST be valid JSON matching this schema:
{
    "hints": [
        {"argName": "param_name", "inferredType": "str", "confidence": 0.9}
    ]
}`;

            const response = await this.openai.chat.completions.create({
                model: this.model,
                messages: [{ role: 'system', content: prompt }],
                response_format: { type: 'json_object' },
                temperature: 0.1,
            });

            const content = response.choices[0].message.content;
            if (!content) throw new Error("Empty response from OpenAI");

            const data = JSON.parse(content);
            return data.hints as TypeHint[];

        } catch (error: any) {
            vscode.window.showErrorMessage(`DocFiller Type API Error: ${error.message}`);
            throw error;
        }
    }
}
