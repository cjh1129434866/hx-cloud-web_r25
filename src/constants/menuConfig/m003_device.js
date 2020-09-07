import { $utils } from '@helper'

export default {
  id: 'device',
  title: $utils.titleLang('设备管理', 'Device Manager'),
  icon: 'menu/deviceManager',
  children: [
    {
      id: 'device-recycle-bin',
      title: $utils.titleLang('设备回收站', 'Device RecycleBin'),
      icon: 'menu/trash',
      path: '/device/recyclebin',
      children: []
    }
    // ,
    // {
    //   id: 'device-transfer-log',
    //   title: $utils.titleLang('设备迁移记录', 'Device Transfer Log'),
    //   icon: 'panel/dataDefine',
    //   path: '/device/transferlog',
    //   children: []
    // }
  ]
}
