/*
 * @Author: jiapeng.Zheng
 * @Date: 2018-04-24 14:02:07
 * @Last Modified by: jiapeng.Zheng
 * @Last Modified time: 2018-10-25 10:23:47
 * @description: 工艺流程图api
 */
import $ajax from '@helper/ajax'
import $utils from '@helper/utils'
// import store from '@store'

const serverUrl = $utils.serverUrl

// let testDeviceSn = '20180318010001'

export default {
  // ---------------------------- Device Image --------------------------------------
  /**
   * 获取设备图片
   * @param {string} deviceSn 设备序列号
   */
  getDeviceImage(deviceSn) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, deviceSn }
    return $ajax.get(serverUrl('DeviceImage/GetDeviceImage'), data)
  },
  /**
   * 删除设备图片
   * @param {string} id         图片编号
   * @param {string} deviceSn   设备序列号
   */
  deleteDeviceImage({ id, deviceSn }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, id, deviceSn }
    return $ajax.post(serverUrl('DeviceImage/DeleteDeviceImage'), data)
  },
  /**
   * 更新设备图片名称
   * @param {string} Id         图片编号
   * @param {string} ImageName  图片名称
   * @param {string} DeviceSn   设备序列号
   */
  updateDeviceImage({ Id, ImageName, DeviceSn }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, Id, ImageName, DeviceSn }
    return $ajax.put(serverUrl('DeviceImage/UpdateDeviceImage'), data)
  },
  // ---------------------------- Device Type Image --------------------------------------
  /**
   * 获取设备类型图片
   * @param   {number}  typeId   设备类型ID
   */
  getTypeImageList(typeId) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, typeId }
    return $ajax.get(serverUrl('TypeImages/GetTypeImageList'), data)
  },
  /**
   * 删除设备类型图片
   * @param   {string}    id      图片编号
   */
  typeImageDelete(id) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, id }
    return $ajax.post(serverUrl('TypeImages/TypeImageDelete'), data)
  },
  /**
   * 更新设备图片名称、序号
   * @param {string}  Id          图片编号
   * @param {string}  ImageName   图片名称
   * @param {string}  Sn          序号
   */
  typeImageSave({ Id, ImageName, Sn }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, Id, ImageName, Sn }
    return $ajax.put(serverUrl('TypeImages/TypeImageSave'), data)
  }
}
