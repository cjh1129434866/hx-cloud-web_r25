/*
 * @Author: jiapeng.Zheng
 * @Date: 2018-09-28 10:56:32
 * @Last Modified by: jiapeng.Zheng
 * @Last Modified time: 2019-06-20 11:44:58
 */
import $ajax from '@helper/ajax'
import $utils from '@helper/utils'
// import store from '@store'

const serverUrl = $utils.serverUrl

export default {
  /**
   * 获取单个地域信息
   * @param {string} areaCode  地域标识
   * @return {DataInfo<AreaVO>}
   */
  getArea(areaCode) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, areaCode }
    return $ajax.get(serverUrl('Area/GetArea'), data)
  },
  /**
   * 获取子地域列表（下一级）
   * @param {string} areaCode  父地域标识
   */
  getListArea(Id, GroupId) {
    return $ajax.get(serverUrl(`${GroupId}/Region/Child/${Id}`))
  },
  /**
   * 获取从最顶级地域到 areaCode 的所有地域
   * @param {string} areaCode  地域标识
   */
  getParentArea(areaCode) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, areaCode }
    return $ajax.get(serverUrl('Area/GetParentArea'), data)
  },
  /**
   * 获取以某个区域标示开始的所有区域信息
   * @param {string} Id 区域标识
   * @return {AllDataListVO2<AreaRegionVO>} 区域列表
   */
  findListRegion(Id, GroupId) {
    return $ajax.get(serverUrl(`${GroupId}/Region/${Id}`))
  },
  /**
   * 获取单个区域信息
   * @param {string} Id 区域标识
   */
  findRegion(Id) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, Id }
    return $ajax.get(serverUrl('Region/FindRegion'), data)
  },
  /**
   * 添加区域信息（只有管理员有权限添加）
   * @param  {String}  AreaName     区域名称，同一个父区域下的区域名称不能重复
   * @param  {String}  AreaPathObj  区域路径等信息
   * @param  {String}  parentCode   父区域标示（初次添加中国区域为101）
   * @param  {String}  FullPath     区域的完整路径（父区域和子区域中间以/分割）
   * @param  {String}  AreaCode     地域标示，可以有多个地域标示
   * @param  {String}  RegionCode   区域标示码，中国为101
   */
  regionAdd({ AreaName, AreaPathObj, parentCode, RegionCode, Point }, GroupId) {
    const data = {
      Name: AreaName,
      Radius: AreaPathObj,
      ParentId: parentCode,
      RegionCode,
      Point: Point ? Point : ''
    }
    return $ajax.post(serverUrl(`${GroupId}/Region`), data)
  },
  /**
   * 修改区域信息（只有管理员有权限添加）
   * @param  {String}  Id           区域标示
   * @param  {String}  AreaName     区域名称，同一个父区域下的区域名称不能重复
   * @param  {String}  AreaPathObj  区域路径等信息
   * @param  {String}  parentCode   父区域标示（初次添加中国区域为101）
   * @param  {String}  FullPath     区域的完整路径（父区域和子区域中间以/分割）
   * @param  {String}  RegionCode   区域标示码，中国为101
   */
  regionSave({ Id, AreaName, AreaPathObj, RegionCode, Point }, GroupId) {
    const data = {Id, Name: AreaName, Radius: AreaPathObj, Point: Point ? Point : '' }
    return $ajax.put(serverUrl(`${GroupId}/Region`), data)
  },
  /**
   * 删除区域信息（只有管理员有权限）
   * @param {string} Id 区域标识
   */
  regionRemove(Id, GroupId) {
    return $ajax.delete(serverUrl(`${GroupId}/Region/${Id}`))
  }
}
