/*
 * @Author: jiapeng.Zheng
 * @Date: 2019-10-30 14:50:17
 * @LastEditors: jiapeng.Zheng
 * @LastEditTime: 2019-11-04 10:08:55
 * @Description:
 */
'use strict'
// This is the webpack config used for unit tests.

const utils = require('./utils')
const webpack = require('webpack')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')

const webpackConfig = merge(baseWebpackConfig, {
  // use inline sourcemap for karma-sourcemap-loader
  module: {
    rules: utils.styleLoaders()
  },
  devtool: '#inline-source-map',
  resolveLoader: {
    alias: {
      // necessary to to make lang="scss" work in test when using vue-loader's ?inject option
      // see discussion at https://github.com/vuejs/vue-loader/issues/724
      'scss-loader': 'sass-loader'
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': require('../config/test.env')
    })
  ]
})

// no need for app entry during tests
delete webpackConfig.entry

module.exports = webpackConfig
