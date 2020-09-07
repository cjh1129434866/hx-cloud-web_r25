import Vue from 'vue'
import _ from '@helper/lodash.js'
import { $apis, $utils, $document, $auth, $vueRouterGenerator } from '@helper'
const files = require.context('.', true, /\.js$/)

files.keys().forEach(key => {
  if (key === './index.js') return
  Vue.prototype[`$${key.replace(/(^\.\/|\.js$)/g, '')}`] = files(key).default
})

function vuePrototypeAppend() {
  Vue.prototype.$_ = _
  Vue.prototype.$apis = $apis
  Vue.prototype.$utils = $utils
  Vue.prototype.$vueRouterGenerator = $vueRouterGenerator
  Vue.prototype.$auth = $auth
  Vue.prototype.$document = $document
}

export default vuePrototypeAppend
