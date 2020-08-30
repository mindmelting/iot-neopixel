var path = require('path');

module.exports = {
    entry: './main.ts',
    target: "node",
    mode: 'development',
    devtool: 'inline-source-map',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'main.js'
    },
    resolve: {
        extensions: ['.ts', '.js'] //resolve all the modules other than index.ts
    },
    module: {
        rules: [
            {
                use: 'ts-loader',
                test: /\.ts?$/
            }
        ]
    },
}