/*
 * @Author: jiapeng.Zheng
 * @Date: 2018-04-24 14:02:26
 * @Last Modified by: jiapeng.Zheng
 * @Last Modified time: 2018-09-05 11:45:04
 * @description: 设备面板api
 */
import $ajax from '@helper/ajax'
import $utils from '@helper/utils'
// import store from '@store'

// const $utils.serverUrl = $utils.$utils.serverUrl

// let testDeviceSn = '20180318010001'

export default {
  /**
   * 获取设备面板
   * @param {string} deviceSn 设备序列号
   * @return {DataList<DevicePanelVO>} 设备面板列表
   */
  getDevicePanels(deviceSn) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, deviceSn }
    return $ajax.get($utils.serverUrl('DevicePanel/GetDevicePanels'), data)
  },
  /**
   * 获取设备面板类型
   */
  getDevicePanelType() {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token }
    return $ajax.get($utils.serverUrl('DevicePanelType/Get'), data)
  },

  /**
   * 添加面板
   * @param {number} typeId    面板类型id
   * @param {string} PanelName 面板名称
   * @param {string} deviceSn  设备序列号
   * @return {Promise<DevicePanelVO>}
   */
  addPanel(typeId, PanelName, deviceSn) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, typeId, PanelName, deviceSn }
    return $ajax.post($utils.serverUrl('DevicePanel/AddPanel'), data)
  },
  /**
   * 修改设备面板信息（修改面板名称）
   * @param {string} Id         面板id
   * @param {string} PanelName  面板名称
   * @param {string} deviceSn   设备序列号
   */
  updateDevicePanel(Id, PanelName, deviceSn) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, Id, PanelName, deviceSn }
    return $ajax.put($utils.serverUrl('DevicePanel/UpdateDevicePanel'), data)
  },

  /**
   * 删除设备面板
   * @param {string} Id        面板id
   * @param {string} deviceSn  设备序列号
   */
  deleteDevicePanel(Id, deviceSn) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, Id, deviceSn }
    return $ajax.post($utils.serverUrl('DevicePanel/DeleteDevicePanel'), data)
  }
}
