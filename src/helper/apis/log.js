/*
 * @Author: jiapeng.Zheng
 * @Date: 2018-10-23 21:44:34
 * @Last Modified by: jiapeng.Zheng
 * @Last Modified time: 2018-10-23 23:55:07
 * @description: 巡检记录、维修记录api
 */
import $ajax from '@helper/ajax'
import $utils from '@helper/utils'
const serverUrl = $utils.serverUrl
export default {
  // ------------------------- Repair ------------------------------
  /**
   * 添加设备维修记录（用户需控制设备权限）
   * @param {String}  deviceSn        设备编号
   * @param {String}  RepairTitle     维修项目
   * @param {String}  RepairContent   维修内容
   */
  repairAdd({ deviceSn, RepairTitle, RepairContent }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, deviceSn, RepairTitle, RepairContent }
    return $ajax.post(serverUrl('Repair/RepairAdd'), data)
  },
  /**
   * 获取设备的维修记录（不分页）
   * @param {String} deviceSn 设备编号
   */
  getRepairList(deviceSn) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, deviceSn }
    return $ajax.get(serverUrl('Repair/GetRepairList'), data)
  },
  /**
   * 获取设备的维修记录（分页）
   * @param {String}  deviceSn     设备编号
   * @param {Number}  pageNo       当前页
   * @param {Number}  pageSize     页大小
   * @param {String}  sortData     排序的字段
   * @param {String}  sortType     排序类型(asc或者desc)
   */
  getRepairPageList({ deviceSn, pageNo, pageSize, sortData, sortType }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, deviceSn, pageNo, pageSize, sortData, sortType }
    return $ajax.get(serverUrl('Repair/GetRepairPageList'), data)
  },
  // ------------------------- Poll ------------------------------
  /**
   * 添加设备巡检记录
   * @param {String}  deviceSn      设备编号
   * @param {String}  PollTitle     巡检项目
   * @param {String}  PollContent   巡检内容
   */
  pollAdd({ deviceSn, PollTitle, PollContent }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, deviceSn, PollTitle, PollContent }
    return $ajax.post(serverUrl('Poll/PollAdd'), data)
  },
  /**
   * 获取设备巡检记录(不分页)
   * @param {String} deviceSn 设备编号
   */
  getPollList(deviceSn) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, deviceSn }
    return $ajax.get(serverUrl('Poll/GetPollList'), data)
  },
  /**
   * 获取设备的巡检记录（分页）
   * @param {String}  deviceSn     设备编号
   * @param {Number}  pageNo       当前页
   * @param {Number}  pageSize     页大小
   * @param {String}  sortData     排序的字段
   * @param {String}  sortType     排序类型(asc或者desc)
   */
  getPollPageList({ deviceSn, pageNo, pageSize, sortData, sortType }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, deviceSn, pageNo, pageSize, sortData, sortType }
    return $ajax.get(serverUrl('Poll/GetPollPageList'), data)
  }
}
