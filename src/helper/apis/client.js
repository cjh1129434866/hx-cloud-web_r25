/*
 * @Author: jiapeng.Zheng
 * @Date: 2018-06-14 14:37:42
 * @Last Modified by: jiapeng.Zheng
 * @Last Modified time: 2019-05-23 13:53:25
 * @description: 客户信息api
 */

import $ajax from '@helper/ajax'
import $utils from '@helper/utils'
// import store from '@store'

const serverUrl = $utils.serverUrl

export default {
  /**
   * 获取组织内所有客户信息
   * @returns { AllDataListVO<ClientVO> }
   */
  getAll() {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token }
    return $ajax.get(serverUrl('Client/GetAll'), data)
  },
  /**
   * 获取客户信息
   * @param id 客户标识
   */
  get(id) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, id }
    return $ajax.get(serverUrl('Client/Get'), data)
  },
  /**
   * 添加客户信息
   * @param {string} Linkman      联系人
   * @param {string} Telephone    电话
   * @param {string} Mobile       移动电话
   * @param {string} Address      地址
   * @param {string} Description  描述
   * @param {string} ClientName   客户名称
   * @param {string} ClientSn     客户编码
   */
  add({ Linkman, Telephone, Mobile, Address, Description, ClientName, ClientSn }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, Linkman, Telephone, Mobile, Address, Description, ClientName, ClientSn }
    return $ajax.post(serverUrl('Client/Add'), data)
  },
  /**
   * 修改客户信息
   * @param {string} Id           客户标识
   * @param {string} Linkman      联系人
   * @param {string} Telephone    电话
   * @param {string} Mobile       移动电话
   * @param {string} Address      地址
   * @param {string} Description  描述
   * @param {string} ClientName   客户名称
   * @param {string} ClientSn     客户编码
   */
  update({ Id, Linkman, Telephone, Mobile, Address, Description, ClientName, ClientSn }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, Id, Linkman, Telephone, Mobile, Address, Description, ClientName, ClientSn }
    return $ajax.put(serverUrl('Client/Update'), data)
  },
  /**
   * 删除客户信息
   * @param {string} Id 客户标识
   */
  delete(Id) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, Id }
    return $ajax.post(serverUrl('Client/Delete'), data)
  }
}
