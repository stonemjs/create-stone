const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')
const { DotenvWebpack } = require('@stone-js/dotenv-webpack-plugin')

module.exports = (env) => {
  return {
    mode: env.dev ? 'development' : 'production',
    entry: path.resolve(__dirname, './index.mjs'),
    devtool: env.dev && 'inline-source-map',
    plugins: [
      new CleanWebpackPlugin(),
      new NodePolyfillPlugin(),
      new DotenvWebpack({
        expand: true,
        path: './.env.pub',
        prefix: 'process.__env__',
      }),
    ],
    output: {
      libraryTarget: 'umd',
      filename: 'index.js',
      globalObject: 'this',
      library: 'StoneJS',
      path: path.resolve(__dirname, 'dist'),
    },
    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /node_modules/,
          use: 'babel-loader',
        },
        {
          test: /\.m?js$/,
          exclude: /node_modules/,
          use: 'webpack-import-glob'
        },
      ]
    },
    devServer: {
      port: 3300,
      static: path.resolve(__dirname, './public'),
    }
  }
}
