/*
 * @Author: jiapeng.Zheng
 * @Date: 2019-06-26 14:29:24
 * @LastEditors: jiapeng.Zheng
 * @LastEditTime: 2019-07-22 15:45:41
 * @Description:
 */
var utils = require('./utils')
var config = require('../config')
var isProduction = process.env.NODE_ENV === 'production'

module.exports = {
  loaders: utils.cssLoaders({
    sourceMap: isProduction ? config.build.productionSourceMap : config.dev.cssSourceMap,
    extract: isProduction
  }),
  cssModules: {
    localIdentName: process.env.NODE_ENV === 'production' ? '[hash:base64:7]' : '[path][name]_[local]',
    camelCase: true
  }
}
