/*
 * @Author: jiapeng.Zheng
 * @Date: 2018-08-13 13:55:11
 * @LastEditors: jiapeng.Zheng
 * @LastEditTime: 2019-07-29 13:55:35
 * @Description:
 */
import { $utils } from '@helper'

export default {
  id: 'jurisdiction',
  title: $utils.titleLang('权限管理', 'Jurisdiction Manager'),
  icon: 'menu/keyset',
  children: [
    {
      id: 'role-manager',
      title: $utils.titleLang('角色', 'Role'),
      icon: 'menu/userkey',
      path: '/jurisdiction/role',
      children: []
    }
  ]
}
