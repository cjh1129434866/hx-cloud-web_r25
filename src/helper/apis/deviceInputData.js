/*
 * @Author: jiapeng.Zheng
 * @Date: 2018-07-26 13:41:39
 * @Last Modified by: jiapeng.Zheng
 * @Last Modified time: 2019-01-10 14:32:58
 * @description: 设备手工录入数据 api
 */

import $ajax from '@helper/ajax'
import $utils from '@helper/utils'
// import store from '@store'

const serverUrl = $utils.serverUrl

export default {
  /**
   * 获取录入的数据（projectid和devicesn至少录入一项，如果projectid存在则忽略devicesn）
   * @param {String} projectId  项目ID
   * @param {String} devicesn   设备编号
   * @param {String} begin      开始时间
   * @param {String} end        结束时间
   */
  getDeviceInputDataList({ projectId, devicesn, begin, end }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, projectId, devicesn, begin, end }
    return $ajax.get(serverUrl('DeviceInputData/GetDeviceInputDataList'), data)
  },
  /**
   * 添加数据
   * @param {String} projectId  项目ID
   * @param {String} devicesn   设备编号
   * @param {String} begin      开始时间
   * @param {String} end        结束时间
   */
  deviceInputDataAdd({
    DeviceSn,
    WaterInflow,
    Dt,
    COD_In,
    COD_Out,
    COD_Unit,
    NH3_N_In,
    NH3_N_Out,
    NH3_N_Unit,
    TN_In,
    TN_Out,
    TN_Unit,
    TP_In,
    TP_Out,
    TP_Unit,
    SS_In,
    SS_Out,
    SS_Unit,
    PH_In,
    PH_Out,
    PH_Unit
  }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = {
      account,
      token,
      DeviceSn,
      WaterInflow,
      Dt,
      COD_In,
      COD_Out,
      COD_Unit,
      NH3_N_In,
      NH3_N_Out,
      NH3_N_Unit,
      TN_In,
      TN_Out,
      TN_Unit,
      TP_In,
      TP_Out,
      TP_Unit,
      SS_In,
      SS_Out,
      SS_Unit,
      PH_In,
      PH_Out,
      PH_Unit
    }
    return $ajax.post(serverUrl('DeviceInputData/DeviceInputDataAdd'), data)
  },
  /**
   * 删除录入的数据
   * @param {String} deviceSn   设备编号
   * @param {String} beginTime  开始时间
   * @param {String} endTime    结束时间
   * @param {String} type       采样类型（Y:按年采样，M:按月采样，D:按天采样）
   */
  deviceInputDataRemove(Id) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, Id }
    return $ajax.post(serverUrl('DeviceInputData/DeviceInputDataRemove'), data)
  }
}
