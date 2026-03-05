# DocFiller AI (VS Code Extension)

Auto-generate high-quality docstrings and type hints for Python, JavaScript, and TypeScript using OpenAI's GPT-4o.

## Features

- **Generate Docstrings**: Instantly generate context-aware docstrings/JSDoc blocks.
  - Python: Supports `google`, `sphinx`, and `numpy` formats.
  - JS/TS: Supports `jsdoc` and `tsdoc` formats.
- **Auto-Infer Type Hints (Python)**: Uses AI to guess the static types of arguments and return values and injects them directly into your function signature.
- **Generate Both**: One command to add both typing and docstrings.
- **Preview Mode**: Review changes before they are applied.

## Commands

Press `Command/Ctrl + Shift + P` and type:
- `DocFiller: Generate Docstring` (Default Shortcut: `Ctrl+Shift+D`)
- `DocFiller: Add Type Hints` (Python only)
- `DocFiller: Generate Docstring + Type Hints` (Python only)

You can also right-click inside a function definition to access these commands from the context menu.

## Configuration

Set your API key in VS Code Settings (`Ctrl+,`):
- `docfiller.openaiApiKey`: Your OpenAI API key.
- `docfiller.model`: The OpenAI model to use (default: `gpt-4o`).
- `docfiller.pythonDocstringFormat`: Choose your preferred Python format.
- `docfiller.jsDocFormat`: Choose `jsdoc` or `tsdoc`.

## Local Development
1. Run `npm install`
2. Open in VS Code
3. Press `F5` to open the Extension Development Host.

## License
MIT
