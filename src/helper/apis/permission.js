/*
 * @Author: jiapeng.Zheng
 * @Date: 2018-05-25 09:52:54
 * @Last Modified by: jiapeng.Zheng
 * @Last Modified time: 2019-07-10 16:30:48
 * @description:
 */

import $ajax from '@helper/ajax'
import $utils from '@helper/utils'
// import store from '@store'

const serverUrl = $utils.serverUrl

export default {
  /**
   * 获取角色的菜单（用于给角色分配菜单，只有管理员权限才能操作）
   * @param {string} roleId 角色标示
   */
  getRoleMenu(roleId) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, roleId }
    return $ajax.get(serverUrl('RoleSysMenu/Get'), data)
  },
  /**
   * 保存角色菜单信息（给角色分配菜单，需要管理员权限）
   * @param {string} roleId   角色标示
   * @param {string} menu     菜单标示列表，以逗号分割
   * @param {string} type     菜单操作标示列表，以逗号分割，0表示查看，1为编辑，2为添加或者删除
   */
  addOrUpdateRoleMenu({ roleId, menu, type }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, roleId, menu, type }
    return $ajax.put(serverUrl('RoleSysMenu/AddOrUpdate'), data)
  },
  /**
   * 获取角色关联的项目编号（用于给角色分配项目，只有管理员权限才能操作）
   * @param {string} roleId 角色标示
   */
  getRoleProject(roleId) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, roleId }
    return $ajax.get(serverUrl('RoleProject/Get'), data)
  },
  /**
   * 更新角色管理的项目（给角色分配项目，需要管理员权限）
   * @param {string} roleId     角色标示
   * @param {string} projectId  项目标示（用逗号分割）
   * @param {string} typeid     操作标示（用逗号分割）0表示查看，1为编辑，2为添加或者删除，3表示控制
   */
  addOrUpdateRoleProject({ roleId, projectId, typeid }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, roleId, projectId, typeid }
    return $ajax.post(serverUrl('RoleProject/AddOrUpdate'), data)
  },
  /**
   * 验证设备是否有权限进行控制
   * @param {string} deviceSn   设备序列号
   * @returns {permissionVO} 权限信息
   */
  checkDeviceControl(deviceSn) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, deviceSn }
    return $ajax.get(serverUrl('device/CheckDeviceControl'), data)
  }
}
