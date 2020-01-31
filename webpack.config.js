const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    mode: 'production',
    devtool: 'source-map',
    entry: {
        'index': './src/index.js'
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: '[name].js',
        //libraryTarget: 'umd',
        //globalObject: 'this',
        // libraryExport: 'default',
        library: 'Griffin'
    },
    module: {
        rules: [{
                test: /\.(js)$/,
                exclude: /(node_modules)/,
                use: 'babel-loader'
            },
            {
                test: /\.scss$/,
                use: [{
                        loader: MiniCssExtractPlugin.loader,
                    },
                    {
                        loader: 'css-loader',
                       /* options: {
                            modules: true,
                            localIdentName: '[local]-[hash:6]',
                            sourceMap: true,
                            importLoaders: 1
                        }*/
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            sourceMap: true,
                            ident: 'postcss',
                        }
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: true
                        }
                    },
                ]
            },
        /*    {
                test: /\.css$/,
                use: [
                    
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                ]
            },*/
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: "css/styles.css",
            chunkFilename: "[id].css",
        })
    ],
};