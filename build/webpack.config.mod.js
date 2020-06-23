const merge = require('webpack-merge')
const webpack = require('webpack')
const speedMeasurePlugin = require('speed-measure-webpack-plugin')
const baseConfig = require('./webpack.config.base.js')
const isDev = process.env.NODE_ENV == 'development'
const smp = new speedMeasurePlugin()
const path = require('path')

const prodConfig = merge(baseConfig, {
  mode: 'production',
  entry: {//多页面应用打包时配置多个
    index2: './src/components/index.js', // key 为打包后文件名
    // login: './src/login.js',
  },
  output: {
    libraryTarget: 'commonjs2',
    library: 'xxx',
    path: path.resolve(__dirname, '../', 'dist'), // 必须绝对路径
    // filename: "boundle_[hash:5].js", // 单入口
    filename: "[name]_[hash:5].js", // 单，多都可以
    // publicPath 别人引到该资源的路径的前半截
    // publicPath: isDev ? '/' : "./" //build时通常是cdn地址（如不用cdn则用相对路径'./'引用原资源） ,dev 时为 '/'
  },
  optimization: {
    splitChunks: false,
    runtimeChunk: false
  }
})
module.exports = smp.wrap(prodConfig)
