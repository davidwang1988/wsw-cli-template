const merge = require('webpack-merge')
const webpack = require('webpack')
const path = require('path')
const baseConfig = require('./webpack.config.base.js')
const speedMeasurePlugin = require('speed-measure-webpack-plugin')
const smp = new speedMeasurePlugin()

const devConfig = merge.smart(baseConfig, {
  mode: 'development',
  plugins: [
    new webpack.DefinePlugin({ // 定义环境变量
      // （文本替换）一层引号按代码块处理，两层引号或stringify后按字符串
      dev: '`dev`', // dev是String
      flag: 'true', // flag使用时是Boolean
      aa: '(()=> {console.log(`bb`)})' // aa是Function
    })
  ],
  devServer: {
    proxy: { // 针对多个域跨域时, 按域添加前缀便于维护，实际调用时rewrite为空即可
      '/api-login' : { // login域接口跨域
        target: 'http://localhost:4000',
        pathRewrite: {
          '/api-login': ''
        }
      },
      '/api-main' : {  // main域接口跨域
        target: 'http://localhost:5000',
        pathRewrite: {
          '/api-main': ''
        }
      }
    },
    before (app) {
      // 再次mock数据返回

      app.get('/api-login/user', (req, res) => {
        res.json({name: '33'})
      })
    },
    open: true
  },
  module: {
    rules: [

    ]
  }
})
console.log('devconfig', JSON.stringify(devConfig.module))
module.exports = smp.wrap(devConfig)
