/*
 * @Author: jiapeng.Zheng
 * @Date: 2018-06-07 17:07:59
 * @Last Modified by: jiapeng.Zheng
 * @Last Modified time: 2019-01-09 15:52:43
 * @description: 系统路由
 *    1、路由的全路径 componentUrl 要和 component 的路径匹配，用于动态加载组件
 *       因为动态路由生成器$VueRouterGenerator.generator 是根据'@views/${componentUrl}'加载组件的
 *    2、所有的路由必须属于主框架'@views/Frame'路由下，
 *       因为$VueRouterGenerator.generator生成的路由统一挂载在 '@views/Frame' 组件下
 */
// import Frame from '@views/Frame'
import { $utils } from '@helper'

export default [
  {
    path: '/sys',
    disabled: true, // 不允许在菜单设置中选择
    component: resolve => require.ensure([], () => resolve(require('@views/Frame')), 'frame'),
    // component: resolve => require(['@views/Frame'], resolve),
    ...$utils.titleLang('系统配置', 'SysTem Set'),
    children: [
      {
        path: 'devicetype',
        ...$utils.titleLang('设备类型', 'Device Type'),
        meta: {
          title: $utils.titleLang('设备类型', 'Device Type'),
          ignoreAuth: false
        },
        component: resolve => require.ensure([], () => resolve(require('@views/system/deviceType')), 'deviceType'),
        // component: resolve => require(['@views/system/deviceType'], resolve),
        componentUrl: 'system/deviceType'
      },
      {
        path: 'appfile',
        ...$utils.titleLang('移动app', 'App'),
        meta: {
          title: $utils.titleLang('移动app', 'App'),
          ignoreAuth: false
        },
        component: resolve => require.ensure([], () => resolve(require('@views/system/appFile')), 'deviceType'),
        // component: resolve => require(['@views/system/appFile'], resolve),
        componentUrl: 'system/appFile'
      },
      {
        path: 'warntype',
        ...$utils.titleLang('报警类型', 'Warn Type'),
        meta: {
          title: $utils.titleLang('报警类型', 'Warn Type'),
          ignoreAuth: false
        },
        component: resolve => require.ensure([], () => resolve(require('@views/system/warnType')), 'warnType'),
        // component: resolve => require(['@views/system/warnType'], resolve),
        componentUrl: 'system/warnType'
      },
      {
        path: 'menu',
        ...$utils.titleLang('菜单设置', 'Menu Set'),
        meta: {
          title: $utils.titleLang('菜单设置', 'Menu Set'),
          ignoreAuth: false
        },
        component: resolve => require.ensure([], () => resolve(require('@views/system/menu')), 'menu'),
        // component: resolve => require(['@views/system/menu'], resolve),
        componentUrl: 'system/menu'
      },
      {
        path: 'subMenu/:id',
        ...$utils.titleLang('子菜单设置', 'SubMenu Set'),
        meta: {
          title: $utils.titleLang('子菜单设置', 'SubMenu Set'),
          ignoreAuth: false
        },
        component: resolve => require.ensure([], () => resolve(require('@views/system/subMenu')), 'subMenu'),
        // component: resolve => require(['@views/system/subMenu'], resolve),
        componentUrl: 'system/subMenu'
      },
      {
        path: 'warncode',
        ...$utils.titleLang('报警编码', 'Warn Code'),
        meta: {
          title: $utils.titleLang('报警编码', 'Warn Code'),
          ignoreAuth: false
        },
        component: resolve => require.ensure([], () => resolve(require('@views/system/warnCode')), 'subMenu'),
        // component: resolve => require(['@views/system/warnCode'], resolve),
        componentUrl: 'system/warnCode'
      },
      {
        path: 'areaset',
        ...$utils.titleLang('区域设置', 'Area Set'),
        meta: {
          title: $utils.titleLang('区域设置', 'Area Set'),
          ignoreAuth: false
        },
        component: resolve => require.ensure([], () => resolve(require('@views/system/areaSet')), 'areaSet'),
        // component: resolve => require(['@views/system/areaSet'], resolve),
        componentUrl: 'system/areaSet'
      },
      {
        path: '',
        disabled: true, // 不允许在菜单设置中选择
        redirect: '/notFount'
      }
    ]
  }
]
