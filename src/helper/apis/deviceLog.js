/*
 * @Author       : jiapeng.Zheng
 * @Date         : 2020-05-15 16:51:21
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-05-19 16:49:22
 * @Description  :
 */

import $ajax from '@helper/ajax'
import $utils from '@helper/utils'
const serverUrl = $utils.serverUrl

export default {
  /**
   * 分页获设备控制日志
   * @param {DeviceControlLogPageDTO} param
   * @returns {Promise<DataPageList<DeviceControlLogVO>>}
   */
  getDeviceLog({ DeviceSn, pageNo, pageSize, begin, end, order, orderType, search }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, DeviceSn, pageNo, pageSize, begin, end, order, orderType, search }
    return $ajax.get(serverUrl('DeviceLog/get'), data)
  },
  /**
   * 新增设备控制日志
   * @param {DeviceControlLogDTO} param
   */
  addDeviceLog({ DeviceSn, Key, KeyName, OldValue, Value, NewValue, SendTime, Time }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, DeviceSn, Key, KeyName, OldValue, Value, NewValue, SendTime, Time }
    return $ajax.post(serverUrl('DeviceLog/add'), data)
  },
  /**
   * 删除设备控制日志
   * @param {number} Id 日志标识
   */
  delDeviceLog(Id) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, Id }
    return $ajax.delete(serverUrl('DeviceLog/remove'), data)
  }
}
