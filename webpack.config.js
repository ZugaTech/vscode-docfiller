const path = require('path');

module.exports = {
    mode: 'none', // Leave as 'none' for dev, override to 'production' via npm script
    target: 'node', // extensions run in a Node.js context
    entry: {
        extension: './src/extension.ts',
    },
    output: {
        filename: '[name].js',
        path: path.join(__dirname, 'dist'),
        libraryTarget: 'commonjs',
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'ts-loader',
                    },
                ],
            },
        ],
    },
    externals: {
        vscode: 'commonjs vscode', // the vscode API is provided by VS Code
    },
    devtool: 'nosources-source-map',
};
