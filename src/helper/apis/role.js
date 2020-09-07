/*
 * @Author: jiapeng.Zheng
 * @Date: 2018-05-23 09:06:52
 * @Last Modified by: jiapeng.Zheng
 * @Last Modified time: 2018-05-31 16:21:17
 * @description: 角色api
 */
import $ajax from '@helper/ajax'
import $utils from '@helper/utils'
// import store from '@store'

const serverUrl = $utils.serverUrl

export default {
  /**
   * 获取组织的所有角色
   */
  get() {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token }
    return $ajax.get(serverUrl('Role/GetRole'), data)
  },
  /**
   * 获取组织的角色(分页)
   * @param {{ pageSize:number, pageNo:number, RoleName:string, IsAdmin:number }} param
   */
  getPageRoles({ pageSize, pageNo, RoleName, IsAdmin }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, pageSize, pageNo, RoleName, IsAdmin }
    return $ajax.get(serverUrl('Role/GetPageRoles'), data)
  },
  /**
   * 新增角色
   * @param {string} RoleName  角色名称
   * @param {string} IsAdmin   是否管理员
   */
  add({ RoleName, IsAdmin }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, RoleName, IsAdmin }
    return $ajax.post(serverUrl('Role/CreateRole'), data)
  },
  /**
   * 修改角色
   * @param {string} Id        角色标识
   * @param {string} RoleName  角色名称
   * @param {string} IsAdmin   是否管理员
   */
  update({ Id, RoleName, IsAdmin }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, RoleName, IsAdmin, Id }
    return $ajax.put(serverUrl('Role/UpdateRole'), data)
  },
  /**
   * 删除角色
   * @param {string} Id 角色标识
   */
  delete(Id) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, Id }
    return $ajax.post(serverUrl('Role/DeleteRole'), data)
  }
}
