import { $utils } from '@helper'

export default {
  id: 'sys',
  title: $utils.titleLang('系统配置', 'System Configure'),
  icon: 'menu/sys',
  children: [
    {
      id: 'device-type',
      title: $utils.titleLang('设备类型', 'Device Type'),
      icon: 'menu/device',
      path: '/sys/devicetype',
      children: []
    },
    {
      id: 'app-file',
      title: $utils.titleLang('移动app', 'App'),
      icon: 'qrcode',
      path: '/sys/appfile',
      children: []
    },
    {
      id: 'warn-type',
      title: $utils.titleLang('报警类型', 'Warn Type'),
      icon: 'notice/malfunctionSet',
      path: '/sys/warntype',
      children: []
    },
    {
      id: 'warn-code',
      title: $utils.titleLang('报警编码', 'Warn Code'),
      icon: 'notice/malfunctionSet',
      path: '/sys/warncode',
      children: []
    },
    {
      id: 'menu-manager',
      title: $utils.titleLang('菜单设置', 'Menu Set'),
      icon: 'menu/menu',
      path: '/sys/menu',
      children: []
    },
    {
      id: 'area-set',
      title: $utils.titleLang('区域设置', 'Area Set'),
      icon: 'menu/area',
      path: '/sys/areaset',
      children: []
    }
  ]
}
