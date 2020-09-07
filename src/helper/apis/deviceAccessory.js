/*
 * @Author: jiapeng.Zheng
 * @Date: 2018-07-23 15:18:05
 * @Last Modified by: jiapeng.Zheng
 * @Last Modified time: 2019-01-22 16:52:29
 * @description: 设备配件api
 */
import $ajax from '@helper/ajax'
import $utils from '@helper/utils'
// import store from '@store'

const serverUrl = $utils.serverUrl

export default {
  /**
   * 获取设备的所有配件
   * @param {string} deviceSn   设备序列号
   */
  getAllDeviceAccessory(deviceSn) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, deviceSn }
    return $ajax.get(serverUrl('DeviceAccessory/GetAllDeviceAccessory'), data)
  },
  /**
   * 添加设备配件信息
   * @param {string} deviceSn   设备序列号
   * @param {string} Name       配件名称
   * @param {string} ICON       配件图标
   */
  deviceAccessoryAdd({ DeviceSn, Name, ICON }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, DeviceSn, Name, ICON }
    return $ajax.post(serverUrl('DeviceAccessory/DeviceAccessoryAdd'), data)
  },
  /**
   * 删除设备配件
   * @param {string} Id        配件编号
   * @param {string} deviceSn  设备序列号
   */
  removeDeviceAccessory(Id, DeviceSn) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, DeviceSn, Id }
    return $ajax.post(serverUrl('DeviceAccessory/RemoveDeviceAccessory'), data)
  },
  /**
   * 修改设备配件名称
   * @param {string} deviceSn   设备序列号
   * @param {string} ICON       配件图标
   * @param {string} Name       配件名称
   * @param {string} Id         配件编号
   */
  saveDeviceAccessory({ DeviceSn, Name, ICON, Id }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, DeviceSn, Name, ICON, Id }
    return $ajax.put(serverUrl('DeviceAccessory/SaveDeviceAccessory'), data)
  }
}
