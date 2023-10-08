const _ = require('lodash')
const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')

module.exports = (env) => {
  return {
    mode: env.dev ? 'development' : 'production',
    entry: path.resolve(__dirname, './index.mjs'),
    devtool: env.dev && 'inline-source-map',
    plugins: [
      new CleanWebpackPlugin(),
      new NodePolyfillPlugin(),
    ],
    output: {
      libraryTarget: 'umd',
      filename: 'index.js',
      globalObject: 'this',
      path: path.resolve(__dirname, 'dist'),
      library: _.upperFirst(_.camelCase(require('./package.json').name)),
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
    }
  }
}
