import { $utils } from '@helper'

export default {
  id: 'user',
  title: $utils.titleLang('用户管理', 'User Manager'),
  icon: 'menu/usermanger',
  children: [
    {
      id: 'user-list',
      title: $utils.titleLang('用户', 'User'),
      icon: 'menu/user',
      path: '/user/list',
      children: []
    },
    {
      id: 'client-list',
      title: $utils.titleLang('客户', 'Client'),
      icon: 'menu/client',
      path: '/user/clientList',
      children: []
    }
  ]
}
