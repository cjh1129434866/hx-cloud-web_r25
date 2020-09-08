/*
 * @Author: jiapeng.Zheng
 * @Date: 2018-05-29 16:37:52
 * @Last Modified by: jiapeng.Zheng
 * @Last Modified time: 2018-06-12 15:52:35
 * @description: 组织api
 */

import $ajax from '@helper/ajax'
import $utils from '@helper/utils'
// import store from '@store'

const serverUrl = $utils.serverUrl
// let account = $utils.getCookie('account')     let token = $utils.getCookie('token')

export default {
  /**
   * 根据组织名称查找组织列表
   * @param { Name, pageNo, pageSize } data
   */
  findByName({ Name, pageNo, pageSize }) {
    const data = { Name, pageNo, pageSize }
    return $ajax.get(serverUrl('Group/FindByName'), data)
  },
  /**
   * 根据组织标示查找组织
   * @param { token:'组织标识' } token
   */
  findByToken(id) {
  /*   const token = $utils.getCookie('token')
    const data = { token } */
    return $ajax.get(serverUrl(`group/${id}`))
  },
  /**
   * 添加组织
   * @param { GroupName:'组织名称，不能重复', Account:'用户名称', Code:'组织代号，用户设置MQTT主题，不能重复', Description:'组织描述'} data
   */
  add({ GroupName, Account, Code, Description }) {
    const data = { GroupName, Account, Code, Description }
    return $ajax.post(serverUrl('Group/Add'), data)
  }
}
