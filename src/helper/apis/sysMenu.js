/*
 * @Author: jiapeng.Zheng
 * @Date: 2018-05-23 09:06:52
 * @Last Modified by: jiapeng.Zheng
 * @Last Modified time: 2018-06-08 10:34:51
 * @description: 角色api
 */
import $ajax from '@helper/ajax'
import $utils from '@helper/utils'
// import store from '@store'

const serverUrl = $utils.serverUrl

export default {
  /**
   * 获取系统的所有一级菜单(用于给角色分配菜单，需要管理员权限)
   */
  getAll() {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token }
    return $ajax.get(serverUrl('SysMenu/GetAllMenu'), data)
  },
  /**
   * 获取用户的一级菜单项目（该用户角色已分配的一级菜单）
   */
  getTopLevelMenu() {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token }
    return $ajax.get(serverUrl('SysMenu/GetTopLevelMenu'), data)
  },
  /**
   * 获取菜单下的所有子菜单
   * @param {string} menuId 菜单标示
   */
  getSub(menuId) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, menuId }
    return $ajax.get(serverUrl('SysMenu/GetSubMenu'), data)
  },
  /**
   * 添加系统菜单，顶级菜单只有管理员权限用户才能添加
   * @param {string} Name       角色名称
   * @param {string} parentId   菜单父标示，顶级菜单时不录入
   * @param {string} Url        菜单地址
   * @param {string} Router     菜单路由
   * @param {string} MenuType   菜单类型，0为导航菜单，1为链接菜单
   * @param {string} Icon       图标地址（该功能暂不开放，可以不加录入）
   * @param {string} Remarks    菜单备注
   */
  add({ Name, parentId, Url, Router, MenuType, Icon, Remarks }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, Name, parentId, Url, Router, MenuType, Icon, Remarks }
    return $ajax.post(serverUrl('SysMenu/AddMenu'), data)
  },
  /**
   * 更新菜单信息
   * @param {string} Id         菜单标示
   * @param {string} Name       角色名称
   * @param {string} ParentId   菜单父标示，顶级菜单时不录入
   * @param {string} Url        菜单地址
   * @param {string} Router     菜单路由
   * @param {string} MenuType   菜单类型，0为导航菜单，1为链接菜单
   * @param {string} Icon       图标地址（该功能暂不开放，可以不加录入）
   * @param {string} Remarks    菜单备注
   */
  update({ Id, Name, ParentId, Url, Router, MenuType, Icon, Remarks }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, Name, ParentId, Url, Router, MenuType, Icon, Remarks, Id }
    return $ajax.put(serverUrl('SysMenu/UpdateSysMenu'), data)
  },
  /**
   * 删除菜单信息（只能删除没有子菜单的菜单）
   * @param {string} Id 菜单标示
   */
  delete(Id) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, Id }
    return $ajax.post(serverUrl('SysMenu/DeleteSysMenu'), data)
  }
}
