/*
 * @Author       : jiapeng.Zheng
 * @Date         : 2020-03-17 09:37:40
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-26 14:40:19
 * @Description  :
 */
import Vue from 'vue'

const files = require.context('.', true, /\.js$/)
let omponentArray = []
files.keys().forEach(key => {
  if (key === './index.js') return
  const omponentTag = key.match(/\.\/(.*)\/index.js/)[1]
  omponentArray = omponentArray.concat({ id: omponentTag, compopent: files(key).default })
})

export const globalComponentsRegister = function() {
  omponentArray.forEach(item => {
    Vue.component(item.id, item.compopent)
  })
}
