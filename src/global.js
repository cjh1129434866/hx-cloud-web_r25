/*
 * @Author: jiapeng.Zheng
 * @Date: 2018-09-13 15:08:47
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-04-10 15:06:49
 * @Description:
 */
import Vue from 'vue'
import Filters from '@/filters'
import ElementUI from 'element-ui'
import EasyScroll from 'easyscroll'
import VueCropper from 'vue-cropper'
import 'element-ui/lib/theme-chalk/index.css'
import 'animate.css/animate.min.css'
import 'echarts/lib/chart/line' // 引入折线图
import 'echarts/lib/chart/pie' // 引入饼图
import 'echarts/lib/component/tooltip' // 引入提示框
import 'echarts/lib/component/title' // 引入标题
import 'echarts/lib/component/legend' // 引入图例
import { globalComponentsRegister } from '@comp'
import vuePrototypeAppend from '@/prototype'

Vue.use(ElementUI)
Vue.use(EasyScroll)
Vue.use(VueCropper)

for (const key in Filters) {
  Vue.filter(key, Filters[key]) // 全局定义过滤器
}

/* 注册一个全局icon组件 */
// Vue.component('icon', Icon)

/* 注册components目录下的所有全局组件 */
globalComponentsRegister()

// Vue.prototype.$_ = _
// Vue.prototype.$apis = $apis
// Vue.prototype.$utils = $utils
// Vue.prototype.$auth = $auth
// Vue.prototype.$document = $document

/* 为 Vue 添加实例方法 */
vuePrototypeAppend()
