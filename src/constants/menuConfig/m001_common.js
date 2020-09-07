/*
 * @Author: jiapeng.Zheng
 * @Date: 2018-08-08 10:07:29
 * @Last Modified by: jiapeng.Zheng
 * @Last Modified time: 2019-04-12 15:58:30
 * @Description: 系统初始化默认的菜单
 */
import { $utils } from '@helper'

export default [
  {
    id: 'home',
    ParentId: null,
    title: $utils.titleLang('首页', 'Home'),
    icon: 'home',
    path: '/common/home'
  },
  {
    id: 'my-project',
    ParentId: null,
    title: $utils.titleLang('全部项目', 'All Project'), // $utils.titleLang('我的项目', 'My Project'),
    icon: 'menu/allproject',
    path: '/common/app/project' // '/common/project/i'
  },
  {
    id: 'my-station',
    ParentId: null,
    title: $utils.titleLang('全部站场', 'All Station'), //  $utils.titleLang('我的站场', 'My Station'),
    icon: 'menu/sites',
    path: '/common/app/station' // '/common/station'
  },
  {
    id: 'my-device',
    ParentId: null,
    title: $utils.titleLang('全部设备', 'All Device'), //  $utils.titleLang('我的设备', 'My Device'),
    icon: 'menu/device',
    path: '/common/app/device', // '/common/device',
    // 判断是否要使用 poppver 组件显示hover时的信息，尽量将该属性设置在菜单的最底层节点，否则会与 el-menu（collapse=true时）展开的子菜单冲突
    popover: { able: true }
  }
]
