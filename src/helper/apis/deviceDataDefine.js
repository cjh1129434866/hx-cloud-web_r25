/*
 * @Author: jiapeng.Zheng
 * @Date: 2018-04-24 14:02:04
 * @Last Modified by: jiapeng.Zheng
 * @Last Modified time: 2018-11-27 09:40:44
 * @description: 设备数据定义api
 */
import $ajax from '@helper/ajax'
import $utils from '@helper/utils'
// import store from '@store'

const serverUrl = $utils.serverUrl

// let testDeviceSn = '20180318010001'

export default {
  /**
   * 获取设备数据定义
   * @param {strnig} deviceSn 设备序列号
   */
  getDeviceDataDefine(deviceSn) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, deviceSn }
    return $ajax.get(serverUrl('DeviceDataDefine/GetDeviceDataDefine'), data)
  },
  /**
   * 新增设备数据定义
   * @param {string} deviceSn       设备序列号
   * @param {string} panelId        面板标示
   * @param {string} DataKey        数据标示(输入)
   * @param {string} DisplayKey     数据标示(输出)
   * @param {string} DataName       数据名称
   * @param {string} Unit           单位
   * @param {string} DataType       数据类型
   * @param {string} DefaultValue   默认值
   * @param {JSONString} Format     数据转换
   * @param {Boolean} AutoControl   用于标识该数据定义受不受手自动的影响
   *
   */
  deviceDataDefineAdd({ DeviceSn, PanelId, DataKey, DisplayKey, DataName, Unit, DataType, DefaultValue, Format, AutoControl = false }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = {
      account,
      token,
      DeviceSn,
      PanelId,
      DataKey,
      DisplayKey,
      DataName,
      Unit,
      DataType,
      DefaultValue,
      Format,
      AutoControl
    }
    return $ajax.post(serverUrl('DeviceDataDefine/DeviceDataDefineAdd'), data)
  },
  /**
   * 更新设备数据定义
   * @param {string} deviceSn     设备序列号
   * @param {string} Id           数据定义编号
   * @param {string} DataKey      数据标示(输入)
   * @param {string} DisplayKey   数据标示(输出)
   * @param {string} DataName     数据名称
   * @param {string} Unit         单位
   * @param {string} DataType     数据类型
   * @param {string} DefaultValue 默认值
   * @param {JSONString} Format   数据转换
   * @param {Boolean} AutoControl 用于标识该数据定义受不受手自动的影响
   *
   */
  updateDeviceDataDefine({ DeviceSn, Id, DataKey, DisplayKey, DataName, Unit, DataType, DefaultValue, Format, AutoControl = false }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = {
      account,
      token,
      DeviceSn,
      Id,
      DataKey,
      DisplayKey,
      DataName,
      Unit,
      DataType,
      DefaultValue,
      Format,
      AutoControl
    }
    return $ajax.put(serverUrl('DeviceDataDefine/UpdateDeviceDataDefine'), data)
  },
  /**
   * 删除设备数据定义
   * @param {strnig} Id       数据定义编号
   * @param {strnig} deviceSn 设备序列号
   */
  deleteDeviceDataDefine(Id, deviceSn) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, deviceSn, Id }
    return $ajax.post(serverUrl('DeviceDataDefine/DeleteDeviceDataDefine'), data)
  }
}
