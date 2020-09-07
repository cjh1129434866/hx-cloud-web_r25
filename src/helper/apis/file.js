/*
 * @Author: jiapeng.Zheng
 * @Date: 2018-06-14 14:37:42
 * @Last Modified by: jiapeng.Zheng
 * @Last Modified time: 2019-01-24 15:49:05
 * @description: 文件api
 */

import $ajax from '@helper/ajax'
import $utils from '@helper/utils'
// import { UPLOAD_CONFIG } from '@constants/index'

const serverUrl = $utils.serverUrl

export default {
  /**
   * 添加客户信息
   * @param {FormData} param      参数
   */
  uploadImage(url, param) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    param.append('account', account)
    param.append('token', token)
    // let data = { account, token }
    return $ajax.uploadFile(url, param)
  },

  /**
   * 获取升级文件（分页）
   */
  getAppFilePageList({ pageNo, pageSize, order, search, orderType, type }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, pageNo, pageSize, order, search, orderType, type }
    return $ajax.get(serverUrl('AppVersion/GetPage'), data)
  },
  /**
   * 获取最新app版本
   * @param {number} type 文件类型，默认为0(表示为android版本)
   */
  getAppFile(type = 0) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, type }
    return $ajax.get(serverUrl('AppVersion/get'), data)
  },
  /**
   * 修改版本信息（只能修改版本描述和是否强制升级）
   */
  editAppFile({ Id, Description, State }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, Id, Description, State }
    return $ajax.put(serverUrl('AppVersion/Modify'), data)
  },
  /**
   * 删除版本信息
   * @param {number} id 版本标识
   */
  delAppFile(id) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, id }
    return $ajax.delete(serverUrl('AppVersion/delete'), data)
  }
}