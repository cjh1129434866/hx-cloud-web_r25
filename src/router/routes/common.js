/*
 * @Author: jiapeng.Zheng
 * @Date: 2018-06-06 17:06:40
 * @Last Modified by: jiapeng.Zheng
 * @Last Modified time: 2019-05-27 13:47:15
 * @description: 通用的路由配置，所有用户都拥有该路由，不做用户权限控制;
 *    1、路由的全路径 componentUrl 要和 component 的路径匹配，用于动态加载组件
 *       因为动态路由生成器$VueRouterGenerator.generator 是根据'@views/${componentUrl}'加载组件的
 *    2、所有的路由必须属于主框架'@views/Frame'路由下，
 *       因为$VueRouterGenerator.generator生成的路由统一挂载在 '@views/Frame' 组件下
 */
// import Frame from '@views/Frame'
import { $utils } from '@helper'

export default [
  {
    path: '/common',
    disabled: true, // 不允许在菜单设置中选择
    component: resolve => require.ensure([], () => resolve(require('@views/Frame')), 'frame'),
    // component: resolve => require(['@views/Frame'], resolve),
    // 用于“菜单管理(@views/system/menuEdit.vue)”中选择“链接菜单”后，el-cascader 组件显示名称，
    // 因为 el-cascader 的 props 配置中的 label 属性不能级联设置为 'meta.title'，只能设置为单字符（如：'zh'）
    ...$utils.titleLang('通用模块', 'common'),
    children: [
      {
        path: 'home/:activeTitle?/:activeItemId?',
        // menuEdit.vue 中的级联选择器cascader 用于显示名称
        ...$utils.titleLang('首页', 'Home'),
        disabled: true, // 首页不允许在菜单设置中选择
        meta: {
          title: $utils.titleLang('首页', 'Home'),
          ignoreAuth: false
        },
        componentUrl: 'Home',
        // component: resolve => require(['@views/Home'], resolve)
        component: resolve => require.ensure([], () => resolve(require('@views/Home')), 'home')
      },
      {
        path: 'user/info',
        ...$utils.titleLang('个人信息', 'User Information'),
        disabled: true, // 不允许在菜单设置中选择
        meta: {
          title: $utils.titleLang('个人信息', 'User Information'),
          ignoreAuth: false
        },
        componentUrl: 'user/info',
        component: resolve => require.ensure([], () => resolve(require('@views/user/info')), 'userInfo')
        // component: resolve => require(['@views/user/info'], resolve)
      },
      {
        path: 'app/device',
        ...$utils.titleLang('全部设备', 'All Device'),
        meta: {
          title: $utils.titleLang('全部设备', 'All Device'),
          ignoreAuth: false
        },
        component: resolve => require.ensure([], () => resolve(require('@views/app/device')), 'appDevice'),
        // component: resolve => require(['@views/app/device'], resolve),
        componentUrl: 'app/device'
      },
      {
        path: 'app/station',
        ...$utils.titleLang('全部站场', 'All Sites'),
        meta: {
          title: $utils.titleLang('全部站场', 'All Sites'),
          ignoreAuth: false
        },
        component: resolve => require.ensure([], () => resolve(require('@views/app/sites')), 'appSites'),
        // component: resolve => require(['@views/app/sites'], resolve),
        componentUrl: 'app/sites'
      },
      {
        path: 'app/project',
        ...$utils.titleLang('全部项目', 'All Project'),
        meta: {
          title: $utils.titleLang('全部项目', 'All Project'),
          ignoreAuth: false
        },
        component: resolve => require.ensure([], () => resolve(require('@views/app/project')), 'appProject'),
        // component: resolve => require(['@views/app/project'], resolve),
        componentUrl: 'app/project'
      },
      {
        path: 'notice/list/:id/:status',
        ...$utils.titleLang('通知中心', 'Notice Center'),
        meta: {
          title: $utils.titleLang('通知中心', 'Notice Center'),
          ignoreAuth: false
        },
        component: resolve => require.ensure([], () => resolve(require('@views/notice/list')), 'noticeList'),
        // component: resolve => require(['@views/notice/list'], resolve),
        componentUrl: 'notice/list'
      },
      {
        path: '',
        disabled: true, // 不允许在菜单设置中选择
        redirect: '/common/home'
      }
    ]
  }
]
