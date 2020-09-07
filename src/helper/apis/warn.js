/*
 * @Author: jiapeng.Zheng
 * @Date: 2018-09-06 15:21:19
 * @Last Modified by: jiapeng.Zheng
 * @Last Modified time: 2019-04-08 11:10:27
 * @description: 报警api
 */
import $ajax from '@helper/ajax'
import $utils from '@helper/utils'
const serverUrl = $utils.serverUrl
export default {
  /* ----------------------------- WarnType(报警类型) ------------------------------- */
  /**
   * 获取所有报警类型信息
   */
  getWarnTypeList() {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token }
    return $ajax.get(serverUrl('/WarnType/GetWarnTypeList'), data)
  },

  /**
   * 获取单个报警类型信息
   * @param {String} id 类型标示
   */
  getWarnType(id) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, id }
    return $ajax.get(serverUrl('/WarnType/GetWarnType'), data)
  },

  /**
   * 添加报警类型
   * @param {String}    TypeName        类型名称
   * @param {String}    Color           颜色值，#ffffff
   * @param {String}    Icon            图标名称
   */
  addWarnType({ TypeName, Color, Icon }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, TypeName, Color, Icon }
    return $ajax.post(serverUrl('/WarnType/AddWarnType'), data)
  },
  /**
   * 修改报警类型
   * @param {String} Id         类型标识
   * @param {String} TypeName   类型名称
   */
  saveWarnType({ Id, TypeName, Color, Icon }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, Id, TypeName, Color, Icon }
    return $ajax.put(serverUrl('/WarnType/SaveWarnType'), data)
  },
  /**
   * 删除报警类型
   * @param {String} typeName 类型标识
   */
  removeWarnType(id) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, id }
    return $ajax.post(serverUrl('/WarnType/RemoveWarnType'), data)
  },

  /* ----------------------------- WarnCode(报警编码) ------------------------------- */

  /**
   * 获取分页报警编码信息
   * @param {String} Code           报警编码
   * @param {String} typeId         报警类型编号
   * @param {String} sortData       排序字段
   * @param {String} sortType       排序类型
   * @param {String} pageNo         当前页
   * @param {String} pageSize       页大小
   */
  getPageWarnCode({ Code, typeId, sortData, sortType, pageNo, pageSize }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, Code, typeId, sortData, sortType, pageNo, pageSize }
    return $ajax.get(serverUrl('/WarnCode/GetPageWarnCode'), data)
  },
  /**
   * 获取单个报警编码信息
   * @param {String} code   报警编码
   */
  getWarnCode(code) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, code }
    return $ajax.get(serverUrl('/WarnCode/GetWarnCode'), data)
  },
  /**
   * 添加报警编码
   * @param {String}    Code            报警编码
   * @param {String}    Description     编码描述
   * @param {String}    WarnTypeId      报警类型
   */
  warnCodeAdd({ Code, Description, WarnTypeId }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, Code, Description, WarnTypeId }
    return $ajax.post(serverUrl('/WarnCode/WarnCodeAdd'), data)
  },
  /**
   * 修改报警编码信息
   * @param {String}    Code            报警编码
   * @param {String}    Description     编码描述
   * @param {String}    WarnTypeId      报警类型
   */
  warnCodeSave({ Code, Description, WarnTypeId }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, Code, Description, WarnTypeId }
    return $ajax.put(serverUrl('/WarnCode/WarnCodeSave'), data)
  },
  /**
   * 删除报警编码信息
   * @param {String}    code            报警编码
   */
  warnCodeRemove(code) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, code }
    return $ajax.post(serverUrl('/WarnCode/WarnCodeRemove'), data)
  },

  /* ----------------------------- Warn（报警信息） ------------------------------- */
  /**
   * 获取报警列表
   * @param   {String}  state     报警状态，0表示全部，1表示未处理，2表示已处理
   * @param   {Number}  projectId 项目ID
   */
  getListWarn(state, projectId = 0) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, state, projectId }
    return $ajax.get(serverUrl('/Warn/GetListWarn'), data)
  },
  /**
   * 获取我的报警信息
   * @param {String}    beginTime       开始时间
   * @param {String}    endTime         结束时间
   * @param {String}    Code            报警编码
   * @param {String}    State           报警状态，0表示全部，1表示未处理，2表示已处理
   * @param {String}    typeId          报警类型
   * @param {String}    sortData        排序字段
   * @param {String}    sortType        排序类型
   * @param {String}    pageNo          当前页
   * @param {String}    pageSize        页大小
   */
  getMyPageWarnCode({ beginTime, endTime, Code, State, typeId, sortData, sortType, pageNo, pageSize }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, beginTime, endTime, Code, State, typeId, sortData, sortType, pageNo, pageSize }
    return $ajax.get(serverUrl('/Warn/GetMyPageWarnCode'), data)
  },
  /**
   * 获取设备分页报警信息
   * @param {String}    beginTime       开始时间
   * @param {String}    endTime         结束时间
   * @param {String}    DeviceSn        设备编码
   * @param {String}    Code            报警编码
   * @param {String}    State           报警状态，0表示全部，1表示未处理，2表示已处理
   * @param {String}    sortData        排序字段
   * @param {String}    sortType        排序类型
   * @param {String}    pageNo          当前页
   * @param {String}    pageSize        页大小
   */
  getPageWarnInfo({ beginTime, endTime, deviceSn, Code, State, sortData, sortType, pageNo, pageSize }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, beginTime, endTime, deviceSn, Code, State, sortData, sortType, pageNo, pageSize }
    return $ajax.get(serverUrl('/Warn/GetPageWarnInfo'), data)
  },
  /**
   * 获取单条报警信息
   * @param {String}    id              报警编号
   */
  getWarnInfo(id) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, id }
    return $ajax.get(serverUrl('/Warn/GetWarnInfo'), data)
  },
  /**
   * 处理报警信息
   * @param {String}    Id              报警编号
   * @param {String}    Comments        报警处理意见
   */
  warnSave({ Id, Comments }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, Id, Comments }
    return $ajax.put(serverUrl('/Warn/WarnSave'), data)
  },
  /**
   * 删除报警信息
   * @param {String}    Id              报警编号
   */
  warnDelete(Id) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, Id }
    return $ajax.post(serverUrl('/Warn/WarnDelete'), data)
  },
  /**
   * 添加报警信息（目前由后台添加，前端不需要添加报警信息）
   * @param {String}    Code        报警编码
   * @param {String}    GroupCode   组织代码
   * @param {String}    Dt          报警发生时间
   * @param {String}    DeviceNo    设备编号
   */
  warnAdd({ Code, GroupCode, Dt, DeviceNo }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, Code, GroupCode, Dt, DeviceNo }
    return $ajax.post(serverUrl('/Warn/WarnAdd'), data)
  }
}
