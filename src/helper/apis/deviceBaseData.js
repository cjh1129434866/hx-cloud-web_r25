/*
 * @Author: jiapeng.Zheng
 * @Date: 2018-04-24 14:01:57
 * @Last Modified by: jiapeng.Zheng
 * @Last Modified time: 2018-05-31 16:20:52
 * @description: 设备参数api
 */
import $ajax from '@helper/ajax'
import $utils from '@helper/utils'
// import store from '@store'

const serverUrl = $utils.serverUrl

// let testDeviceSn = '20180318010001'

export default {
  /**
   * 获取设备参数
   * @param {string} deviceSn 设备序列号
   * @returns {DataList<DeviceBaseVO>}
   */
  getDeviceBaseData(deviceSn) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, deviceSn }
    return $ajax.get(serverUrl('DeviceBaseData/GetDeviceBaseData'), data)
  },
  /**
   * 新增设备参数
   * @param {DeviceBaseDTO} data
   */
  deviceBaseDataAdd({ DeviceSn, DataName, DataType, DataValue, PanelId }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, DeviceSn, DataName, DataType, DataValue, PanelId }
    return $ajax.post(serverUrl('DeviceBaseData/DeviceBaseDataAdd'), data)
  },
  /**
   * 删除设备参数
   * @param {number} Id        数据标示
   * @param {string} deviceSn  设备序列号
   */
  deleteDeviceBaseData(Id, deviceSn) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, deviceSn, Id }
    return $ajax.post(serverUrl('DeviceBaseData/DeleteDeviceBaseData'), data)
  },
  /**
   * 修改设备参数
   * @param {DeviceBaseDTO} data
   */
  updateDeviceBaseData({ DeviceSn, DataName, DataType, DataValue, PanelId, Id }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, DeviceSn, DataName, DataType, DataValue, PanelId, Id }
    return $ajax.put(serverUrl('DeviceBaseData/UpdateDeviceBaseData'), data)
  }
}
