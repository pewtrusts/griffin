const webpack = require('webpack');
const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

module.exports = {
    mode: 'production',
    devtool: false,
    entry: {
        'js/index': './index.js'
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
                exclude: /(node_modules)|HighchartsAPI/,
                use: [{
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                },
                {
                    loader: 'eslint-loader'
                }]
            },
            {
                test: /\.scss$/,
                use: [{
                        loader: MiniCssExtractPlugin.loader,
                    },
                    {
                        loader: 'css-loader',
                        options: {
                          //  modules: true,
                          //  localIdentName: '[local]-[hash:6]',
                            sourceMap: true,
                            importLoaders: 1
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            sourceMap: true,
                            ident: 'postcss',
                            plugins: [
                                require('cssnano'),
                                require('postcss-preset-env')(),
                                require('autoprefixer'),
                            ],
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
        }),
        new webpack.SourceMapDevToolPlugin({
            test: /\.js$/,
            filename: 'js/indexjs.map'
        }),
        new webpack.SourceMapDevToolPlugin({
            test: /\.css$/,
            filename: 'css/stylescss.map'
        }),
       /* new webpack.SourceMapDevToolPlugin({
            test: /\.css$/,
            filename: 'css/[name]css.map', // bc sitecore database renames assets
          //  fileContext: 'css'
        })*/
    ],
};