const merge = require('webpack-merge')
const webpack = require('webpack')
const speedMeasurePlugin = require('speed-measure-webpack-plugin')
const baseConfig = require('./webpack.config.base.js')

const smp = new speedMeasurePlugin()
const prodConfig = merge(baseConfig, {
  mode: 'production'
})
module.exports = smp.wrap(prodConfig)
