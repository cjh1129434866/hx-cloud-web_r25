/*
 * @Author: jiapeng.Zheng
 * @Date: 2018-07-26 13:41:39
 * @Last Modified by: jiapeng.Zheng
 * @Last Modified time: 2018-11-19 17:10:13
 * @description: 设备历史数据 api
 */

import $ajax from '@helper/ajax'
import $utils from '@helper/utils'
// import store from '@store'

const serverUrl = $utils.serverUrl

export default {
  /**
   * 获取设备的最新一条历史数据
   * @param {String} devicesn 设备编号
   */
  getLatestDeviceHis(devicesn) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, devicesn }
    return $ajax.get(serverUrl('DeviceHis/GetLatestDeviceHis'), data)
  },
  /**
   * 获取某一时间段内设备的控制数据
   * @param {String} deviceSn   设备编号
   * @param {String} beginTime  开始时间
   * @param {String} endTime    结束时间
   * @param {String} type       采样类型（Y:按年采样，M:按月采样，D:按天采样）
   */
  getDeviceHisDataStatics({ deviceSn, beginTime, endTime, type }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, deviceSn, beginTime, endTime, type }
    return $ajax.get(serverUrl('DeviceHis/GetDeviceHisDataStatics'), data)
  }
}
