/*
 * @Author: jiapeng.Zheng
 * @Date: 2018-12-14 17:38:06
 * @LastEditors: jiapeng.Zheng
 * @LastEditTime: 2019-09-06 14:18:58
 * @Description:
 */
import { $utils } from '@helper'
export default {
  id: 'notice',
  title: $utils.titleLang('通知管理', 'Notice Manager'),
  icon: 'bell',
  children: [
    {
      id: 'notice-center',
      title: $utils.titleLang('通知中心', 'Notice Center'),
      icon: 'notice/errorset',
      path: '/notice/list',
      children: []
    }
  ]
}
