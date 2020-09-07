/*
 * @Author: jiapeng.Zheng
 * @Date: 2018-06-27 16:41:33
 * @Last Modified by: jiapeng.Zheng
 * @Last Modified time: 2019-07-08 09:55:37
 * @description: 统计api
 */

import $ajax from '@helper/ajax'
import $utils from '@helper/utils'
// import store from '@store'

const serverUrl = $utils.serverUrl

export default {
  // /**
  //  * 获取设备类型的设备统计信息(已经删除了的接口)
  //  */
  // getDeviceGroupData() {
  //   let account = $utils.getCookie('account')
  //   let token = $utils.getCookie('token')
  //   let data = { account, token }
  //   return $ajax.get(serverUrl('DeviceType/GetDeviceGroupData'), data)
  // },
  /**
   * 获取区域设备的统计信息
   * @param {Number} regionId      区域标示（默认为101）
   * @param {Number} deviceTypeId  设备类型标示
   */
  getRegionStatisticsDevice({ regionId, deviceTypeId }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, deviceTypeId, regionId }
    return $ajax.get(serverUrl('Device/GetRegionStatisticsDevice'), data)
  },
  /**
   * 获取我的报警信息统计
   * @param   {String}  state     报警状态，0表示全部，1表示未处理，2表示已处理
   * @param   {Number}  projectId 项目/站场ID
   */
  getWarnByWarnTypeStatics(state, projectId = 0) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, state, projectId }
    return $ajax.get(serverUrl('Warn/WarnByWarnTypeStatics'), data)
  },
  /**
   * 获取报警分类统计的个数（一个设备未处理只记录一次）
   * @param   {number|undefined}  projectId 项目/站场ID
   */
  getWarnStatistics(projectId) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, projectId }
    return $ajax.get(serverUrl('Warn/GetWarnStatistics'), data)
  },
  /**
   * 获取设备统计数据
   * 项目编号为空为获取设备的数据，
   * 项目编号不为空，则获取项目下的所有设备的数据（注：每个设备一天一条统计数据）
   * 注：DeviceSn 和 ProjectId 不能同时为空
   * @param   {String}  DeviceSn    设备序列号
   * @param   {String}  ProjectId   项目编号
   * @param   {String}  TypeId      项目类型代码
   * @param   {String}  Begin       开始时间
   * @param   {String}  End         结束时间
   */
  getDeviceStatisticsDataList({ DeviceSn = '0', ProjectId, TypeId, Begin, End }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, TypeId, Begin, End }
    if (DeviceSn === '0') {
      data.ProjectId = ProjectId
    } else {
      data.DeviceSn = DeviceSn
    }
    return $ajax.get(serverUrl('DeviceStatisticsData/GetDeviceStatisticsDataList'), data, { enableCache: true })
  },

  /**
   *  根据项目/站场ID 获取设备最新一条的在线数据
   * @param {string} projectId 项目或者场站编号，可空，如果不输入代表获取用户有权限看到的设备
   * @param {array} keys 要统计的数据定义
   */
  getDeviceOnline(projectId, keys = []) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, projectId, keys }
    return $ajax.get(serverUrl('DeviceOnline/GetDeviceOnline'), data, { enableCache: true })
  }
}
