/*
 * 路由跳转权限控制
 */
// import Vue from 'vue'
import { $auth } from '@helper'
import $store from '@store'
import { i18n } from '@/locales'

export default {
  setTitle(to, from, next) {
    if (to.meta.title && to.meta.title[i18n.locale]) {
      // 初始化的时候设置激活的路由名称(注：页面上的其他跳转链接的操作会重新设置标题（如：左侧菜单点击的时候）)
      $store.commit('$vuexSetActiveMenu', {
        path: to.path,
        title: {
          ...to.meta.title
        }
      })
    }
    next()
  },

  // Check the login status
  checkLoginAuth(to, from, next) {
    if (to.meta && to.meta.ignoreAuth) {
      next()
    } else {
      if ($auth.checkSession()) {
        next()
      } else {
        alert('登录超时,请重新登录')
        next({
          path: '/login'
        })
      }
    }
  },

  // Check page permissions
  checkPageAuth(to, from, next) {
    if (to.meta && to.meta.ignoreAuth) {
      next()
    } else {
      // check user auth here....
      next()
    }
  }
}
