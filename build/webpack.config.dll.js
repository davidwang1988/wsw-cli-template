const webpack = require('webpack')
const path = require('path')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
// 抽离三方库为dll，不用每次都编译这些不常改变的三方库
module.exports = {
  entry: {
    vendor: ['vue'] // key为抽取的vendor（公共三方库）的名称，val为具体的包们
  },
  output: {
    filename: "[name]_[hash:5].js",
    path: path.resolve(__dirname, 'dist', 'dll'),
    library: '[name]_dll'
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.DllPlugin({
      name: "[name]_dll", // 和上面library一致
      path: path.resolve(__dirname, 'dist', 'dll', 'manifest.json')//  输出映射表的地址
    }),
  ]
}
