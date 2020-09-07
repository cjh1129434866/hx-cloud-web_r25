/*
 * @Author: jiapeng.Zheng
 * @Date: 2019-08-26 13:51:41
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-04-08 16:01:23
 * @Description:    设备子系统api
 */
import $ajax from '@helper/ajax'
import $utils from '@helper/utils'
// import store from '@store'

const serverUrl = $utils.serverUrl

export default {
  // ===================================== DeviceSystem (子系统) =====================================
  /**
   * 获取设备的子系统
   * @param {string} deviceSn   设备序列号
   * @return {Promise<{List:Array<DeviceSysVO>}>}
   */
  getDeviceSystemList(deviceSn) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, deviceSn }
    return $ajax.get(serverUrl('DeviceSystem/GetDeviceSystemList'), data)
  },
  /**
   * 添加设备子系统
   * @param {{ DeviceSn:string, Name:string }}
   * DeviceSn： 设备序列号
   * Name：     子系统名称
   */
  addDeviceSystem({ DeviceSn, Name }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, DeviceSn, Name }
    return $ajax.post(serverUrl('DeviceSystem/AddDeviceSystem'), data)
  },
  /**
   * 更新设备子系统名称
   * @param {{ DeviceSn:string, Name:string, Id:number }}
   * deviceSn   设备序列号
   * Name       配件名称
   * Id         配件编号
   */
  updateDeviceSystem({ DeviceSn, Name, Id }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, DeviceSn, Name, Id }
    return $ajax.put(serverUrl('DeviceSystem/UpdateDeviceSystem'), data)
  },
  /**
   * 删除设备子系统
   * @param {number} Id        子系统标识
   * @param {string} deviceSn  设备序列号
   */
  removeDeviceSystem(Id, DeviceSn) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, DeviceSn, Id }
    return $ajax.delete(serverUrl('DeviceSystem/RemoveDeviceSystem'), data)
  },
  // ===================================== DeviceSystemAccessory (子系统配件) =====================================
  /**
   * 获取子系统配件信息
   * @param {string} DeviceSn   设备序列号
   * @param {number} SystemId   子系统标示
   */
  getSystemAccessory(DeviceSn, SystemId) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, DeviceSn, SystemId }
    return $ajax.get(serverUrl('DeviceSystemAccessory/GetSystemAccessory'), data)
  },
  /**
   * 添加子系统配件信息
   * @param { AccessoriesVO } data
   * @param { string } DeviceSn
   */
  addDeviceSystemAccessory({ Name, ICON, SystemId }, DeviceSn) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, Name, ICON, SystemId, DeviceSn }
    return $ajax.post(serverUrl('DeviceSystemAccessory/AddDeviceSystemAccessory'), data)
  },
  /**
   * 更新设备子系统配件
   * @param { AccessoriesVO } data
   * @param { string } DeviceSn
   */
  updateDeviceSystemAccessory({ Name, ICON, SystemId, Id }, DeviceSn) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, Name, ICON, SystemId, Id, DeviceSn }
    return $ajax.put(serverUrl('DeviceSystemAccessory/UpdateDeviceSystemAccessory'), data)
  },
  /**
   * 删除子系统配件
   * @param {string} Id        配件标识
   * @param {string} DeviceSn  设备序列号
   */
  deleteDeviceSystemAccessory(Id, DeviceSn) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, DeviceSn, Id }
    return $ajax.delete(serverUrl('DeviceSystemAccessory/DeleteDeviceSystemAccessory'), data)
  },
  // ===================================== DeviceSystemCotrolData (子系统配件) =====================================
  /**
   * 获取子系统的配件的控制项
   * @param {string} DeviceSn       设备序列号
   * @param {number} AccessoryId    设备配件标示
   */
  getDeviceSystemAceessoryControlData(DeviceSn, AccessoryId) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, DeviceSn, AccessoryId }
    return $ajax.get(serverUrl('DeviceSystemCotrolData/GetDeviceSystemAceessoryControlData'), data)
  },
  /**
   * 添加子系统的配件的控制数据
   * @param { SystemControlDTO } data
   */
  addDeviceSystemControlData(DeviceSn, { ControlName, DataValue, DataDefineId, AccessoryId, AssociateDefineId, SequenceIn, SequenceOut }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = {
      account,
      token,
      DeviceSn,
      ControlName,
      DataValue,
      DataDefineId,
      AccessoryId,
      AssociateDefineId,
      SequenceIn,
      SequenceOut
    }
    return $ajax.post(serverUrl('DeviceSystemCotrolData/AddDeviceSystemControlData'), data)
  },
  /**
   * 更新子系统的配件的控制数据
   * @param { SystemControlDTO } data
   */
  updateDeviceSystemControlData(DeviceSn, { Id, ControlName, DataValue, DataDefineId, AccessoryId, AssociateDefineId, SequenceIn, SequenceOut }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = {
      account,
      token,
      Id,
      DeviceSn,
      ControlName,
      DataValue,
      DataDefineId,
      AccessoryId,
      AssociateDefineId,
      SequenceIn,
      SequenceOut
    }
    return $ajax.put(serverUrl('DeviceSystemCotrolData/UpdateDeviceSystemControlData'), data)
  },
  /**
   * 删除子系统配件的控制数据
   * @param {string} DeviceSn   设备序列号
   * @param {string} id         设备配件标示
   */
  deleteDeviceSystemControlData(DeviceSn, id) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, DeviceSn, id }
    return $ajax.delete(serverUrl('DeviceSystemCotrolData/DeleteDeviceSystemControlData'), data)
  }
}
