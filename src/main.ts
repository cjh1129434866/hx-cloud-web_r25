/*
 * @Author: jiapeng.Zheng
 * @Date: 2018-12-26 09:52:16
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-25 13:53:07
 * @Description:
 */
// import 'babel-polyfill'
import Vue from 'vue'
import './global.js'
import '@mixins/globalMixin.js'
import './registerServiceWorker'
import App from './App.vue'
import store from '@store'
import router from '@router'
import { i18n } from '@/locales'
import { $vueRouterGenerator } from '@helper'

Vue.config.productionTip = process.env.NODE_ENV !== 'production'

if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
  // 由于登录时使用了window.location 而不使用this.$router.push('/common/home')跳转链接是为了让整个应用重新生成,清空动态生成路由
  // 故这里要获取用户的信息，也是为了防止用户强制刷新时数据丢失，
  store.dispatch('getUser').then(async (result: any) => {
    // 获取系统常量
    try {
      await store.dispatch('getCommnParam')
    } catch (err) {
      console.error(err)
    }
    let { userInfo, $userMenu, $historyPath } = result
    $userMenu = JSON.parse(JSON.stringify($userMenu))
    // 从 $historyPath 里提取路由信息，动态生成路由
    for (const hisP in $historyPath) {
      if ($historyPath[hisP].routerObj) {
        $userMenu.push($historyPath[hisP].routerObj)
      }
    }
    // 动态生成路由
    $vueRouterGenerator.generator($userMenu, userInfo.isAdmin)
  })
}

/* eslint-disable no-new */
new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')
