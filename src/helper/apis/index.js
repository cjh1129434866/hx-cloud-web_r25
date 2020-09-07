/*
 * @Author: jiapeng.Zheng
 * @Date: 2018-04-24 14:05:12
 * @Last Modified by:   jiapeng.Zheng
 * @Last Modified time: 2018-04-24 14:05:12
 * @description: api去中心化操作
 */
const files = require.context('.', true, /\.js/)
const modules = {}

files.keys().forEach(key => {
  if (key === './index.js') {
    return
  }
  modules[key.replace(/(^\.\/|\.js$)/g, '')] = files(key).default
})

export default modules
