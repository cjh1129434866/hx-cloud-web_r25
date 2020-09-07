/*
 * @Author       : jiapeng.Zheng
 * @Date         : 2020-03-17 09:37:40
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-31 17:00:59
 * @Description  :
 */
import Vue from 'vue'
import _ from '@helper/lodash.js'
import Router from 'vue-router'
import beforeEachHooks from '@router/beforeEachHooks'
import commonRoutesMap from '@router/commonRoutes'
import { Loading } from 'element-ui'
let loadingInstance

Vue.use(Router)

const routerInstance = new Router({
  mode: 'history',
  linkActiveClass: 'active',
  scrollBehavior: () => ({ y: 0 }), // 当切换到新路由时，页面滚到顶部
  routes: commonRoutesMap // RoutesMapConfig.concat(commonRoutesMap)
})

_.values(beforeEachHooks).forEach(hook => {
  routerInstance.beforeEach(hook)
})
// 全局加载loading
routerInstance.beforeEach(function appLoading(to, from, next) {
  loadingInstance = Loading.service({ target: '#page-module' }) // 为右侧内容页添加loading
  next()
})
// 取消loading
routerInstance.afterEach(function appLoading(/** to, from */) {
  // 延时下
  setTimeout(() => {
    loadingInstance.close() // 取消右侧内容页添加的loading
  })
})

export default routerInstance
