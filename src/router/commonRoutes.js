/*
 * @Author: jiapeng.Zheng
 * @Date: 2018-09-30 09:39:44
 * @LastEditors: jiapeng.Zheng
 * @LastEditTime: 2019-07-19 14:19:59
 * @Description: 通用路由配置，需要放在配置项数组的末端，不用进行路由权限控制
 */

// import NotFound from '@views/exception/NotFound'
import { $utils } from '@helper'

export default [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    meta: {
      title: $utils.titleLang('登录', 'Login'),
      ignoreAuth: true
    },
    component: resolve => require.ensure([], () => resolve(require('@views/Login')), 'login')
    // component: resolve => require(['../views/Login'], resolve)
    // 以下是自定义chunk名称的写法
    // resolve => require.ensure([],()=>resolve(require('../views/Login')),'login')
    // webpack2.0 引用 syntax-dynamic-import,也可以使用
    // .babelrc 配置文件的comments属性必须为true，否则无法正常输出ChunkName
    // 因为comments为false时会删除所有的注释，comments默认值是true
    // () => import(/* webpackChunkName: "login" */ '../views/Login')
  }
  // {
  //   path: '/register',
  //   name: 'register',
  //   meta: {
  //     title: $utils.titleLang('注册', 'Register'),
  //     ignoreAuth: true
  //   },
  //   component: resolve => require.ensure([], () => resolve(require('@views/Register')), 'register')
  //   // component: resolve => require(['@views/Register'], resolve)
  // }
]
