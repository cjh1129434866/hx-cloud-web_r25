/*
 * @Author: jiapeng.Zheng
 * @Date: 2018-04-24 14:00:48
 * @Last Modified by: jiapeng.Zheng
 * @Last Modified time: 2019-07-04 16:18:10
 * @description: 设备api
 */
import $ajax from '@helper/ajax'
import $utils from '@helper/utils'
import { PROJECT_TYPE_PROJECT } from '@constants/dictionaries'

// import store from '@store'

const serverUrl = $utils.serverUrl
const DEVICE_API = {
  /**
   * 获取用户某个站场下所有的设备,站场ID不能为空
   * @param {number} projectId 站场id
   */
  getAllDevice(projectId) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, projectId }
    return $ajax.get(serverUrl('Device/GetAllDevice'), data)
  },
  /**
   * 获取用户某个站场下所有的设备(只包含设备的部分信息),站场ID不能为空（带搜索功能）
   * @param {String} projectId 站场id
   * @param {String} DeviceName  查询字段：设备名称
   * @param {String} TypeId      查询字段：设备类型
   */
  getDeviceDataInfo({ projectId, DeviceName = '', TypeId = '' }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, projectId, DeviceName, DeviceType: TypeId }
    return $ajax.get(serverUrl('Device/GetDeviceDataInfo'), data)
  },

  /**
   * 获取用户某个站场下分页的设备数据, 若projectId为项目ID 则无法获取设备
   * @param {String} projectId   站场ID（无项目的站场编号不用输入即可）
   * @param {Number} pageNo      当前页
   * @param {Number} pageSize    页大小
   * @param {String} sortData    排序的字段
   * @param {String} sortType    排序类型(asc或者desc)
   * @param {String} DeviceNo    查询字段：设备编码
   * @param {String} DeviceName  查询字段：设备名称
   * @param {String} TypeId      查询字段：设备类型
   */
  getPageDevices({ projectId, pageNo, pageSize, sortData, sortType, DeviceNo, DeviceName, TypeId }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, projectId, pageNo, pageSize, sortData, sortType, DeviceNo, DeviceName, TypeId }
    return $ajax.get(serverUrl('Device/GetPageDevices'), data)
  },
  /**
   * 获取用户某个项目下分页的设备数据(只包含设备的部分信息)
   * @param { DevicePageDTO }
   * @description projectId   站场ID（无项目的站场编号不用输入即可）
   * @description pageNo      当前页
   * @description pageSize    页大小
   * @description sortData    排序的字段
   * @description sortType    排序类型(asc或者desc)
   * @description DeviceName  查询字段：设备名称(可为空)
   * @description TypeId      查询字段：设备类型(可为空)
   * @returns { DevicePageDataListVO<DeviceVO> }
   */
  getPageDeviceDataInfo({ projectId, pageNo, pageSize, sortData, sortType, DeviceName, TypeId }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = {
      account,
      token,
      projectId,
      pageNo,
      pageSize,
      Order: sortData,
      sortDirection: sortType,
      DeviceName,
      DeviceType: TypeId
    }
    return $ajax.get(serverUrl('Device/GetPageDeviceDataInfo'), data)
  },

  /**
   * 获取用户所有的设备
   * @param {String} Area         查询字段：设备区域
   * @param {String} TypeId       查询字段：设备类型
   */
  myDevice() {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token }
    return $ajax.get(serverUrl('Device/MyDevice'), data)
  },

  /**
   * 获取用户所有的设备，有分页功能
   * @param {Number} pageNo      当前页
   * @param {Number} pageSize    页大小
   * @param {String} sortData    排序的字段
   * @param {String} sortType    排序类型(asc或者desc)
   * @param {String} DeviceNo    查询字段：设备编码
   * @param {String} DeviceName  查询字段：设备名称
   * @param {String} TypeId      查询字段：设备类型
   *
   */
  myPageDevice({ pageNo, pageSize, sortData, sortType, DeviceNo, DeviceName = '', TypeId }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, pageNo, pageSize, sortData, sortType, DeviceNo, DeviceName, TypeId }
    return $ajax.get(serverUrl('Device/MyPageDevice'), data)
  },

  getDevices(param) {
    return String(param.projectType) === PROJECT_TYPE_PROJECT ? DEVICE_API.getPageDeviceDataInfo(param) : DEVICE_API.getDeviceDataInfo(param)
  },

  /**
   * 获取设备的统计信息（汇总，主要用于用户主页的统计,已经启用了缓存）
   * @param {String}  projectId   项目标示（为0时标示查询统计该用户所有的项目下的设备，不为0零则统计该项目的设备）
   * @return { Data:[{DeviceName: "", DeviceNo: "", DeviceSn: "", Online: null, Token: "", TypeId: 0}], Message:'获取设备信息成功', RegionData:[], Success:true, TypeData:[] }
   * 注：返回的数据中，Data中只包含设备的部分信息
   */
  getDeviceOverView(projectId = 0) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, projectId }
    return $ajax.get(serverUrl('Device/GetDeviceOverView'), data)
  },

  /**
   * 获取用户某个区域下的某种类型的设备
   * @param {String} regionId       查询字段：设备区域ID
   * @param {String} deviceTypeId   查询字段：设备类型ID
   * @param {String} deviceName     查询字段：设备名称
   * @return { Data:[], Message:'获取设备信息成功', RegionData:[], Success:true, TypeData:[] }
   */
  getRegionDevice({ regionId, deviceTypeId, DeviceName = '' }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, regionId, deviceTypeId, DeviceName }
    return $ajax.get(serverUrl('/Device/GetRegionDevice'), data)
  },

  /**
   * 获取无项目的设备
   * @param {String} DeviceNo    查询字段：设备编码
   * @param {String} DeviceName  查询字段：设备名称
   * @param {String} TypeId      查询字段：设备类型
   */
  getNoProjectDevcice({ DeviceNo, DeviceName, TypeId }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, DeviceNo, DeviceName, TypeId }
    return $ajax.get(serverUrl('Device/GetNoProjectDevcice'), data)
  },

  /**
   * 获取设备的迁移记录(只有管理员才能查看)
   * @param {String} deviceSn      设备序列号
   */
  getDeviceMigration(deviceSn) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, deviceSn }
    return $ajax.get(serverUrl('DeviceMigration/Get'), data)
  },

  /**
   * 修改设备的站场信息
   * @param {String} deviceSn   设备序列号
   * @param {String} projectId  项目ID
   */
  changeDeviceProject({ DeviceSn, projectId, FullName, FullId, RegionId, AreaId }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, DeviceSn, projectId, FullName, FullId, RegionId, AreaId }
    return $ajax.put(serverUrl('Device/ChangeDeviceProject'), data)
  },

  /**
   * 获取设备信息
   * @param {string} deviceSn 设备序列号
   * @returns {Promise<DeviceVO>}
   */
  getDeviceInfo(deviceSn) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, deviceSn }
    return $ajax.get(serverUrl('Device/GetDevice'), data)
  },

  /**
   * 新增设备
   * @param { DeviceNo, DeviceName, DeviceDescription, TypeId, ProjectId, FullId, FullName , RegionId, AreaId} param0
   */
  deviceAdd({ DeviceNo, DeviceName, DeviceDescription, TypeId, TempId, ProjectId, FullId, FullName, RegionId, AreaId }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = {
      account,
      token,
      deviceNo: DeviceNo,
      deviceName: DeviceName,
      DeviceDescription,
      TypeId,
      TempId,
      ProjectId,
      FullId,
      FullName,
      RegionId,
      AreaId
    }
    return $ajax.post(serverUrl('Device/DeviceAdd'), data)
  },

  /**
   * 修改设备
   * @param { DeviceSn, DeviceNo, DeviceName, DeviceDescription, TypeId, ProjectId, RegionId, AreaId } param0
   */
  updateDevcie({ DeviceSn, DeviceNo, DeviceName, DeviceDescription, TypeId, ProjectId, RegionId, AreaId }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = {
      account,
      token,
      devicesn: DeviceSn,
      deviceNo: DeviceNo,
      deviceName: DeviceName,
      DeviceDescription,
      typeId: TypeId,
      projectId: ProjectId,
      RegionId,
      AreaId
    }
    return $ajax.put(serverUrl('Device/UpdateDevcie'), data)
  },

  /**
   * 删除设备信息,只能删除回收站中的设备
   * @param {*} devicesn  设备序列号
   */
  deleteDevice(devicesn) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, devicesn }
    return $ajax.post(serverUrl('Device/DeleteDevice'), data)
  },
  /**
   * 移除设备的站场信息，（移除到回收站）
   * @param {*} devicesn  设备序列号
   */
  removeDeviceProject(devicesn) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, devicesn }
    return $ajax.put(serverUrl('Device/RemoveDeviceProject'), data)
  },

  /**
   * 修改设备地址
   * @param {String} devicesn 设备序列号
   * @param {String} Position 位置信息，经纬度
   * @param {String} Address 位置信息
   */
  updateDevicePosition(devicesn, Position, Address) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, devicesn, Position, Address }
    return $ajax.put(serverUrl('Device/UpdateDevicePosition'), data)
  },
  /**
   * 修改设备地址
   * @param {String} devicesn   设备序列号
   * @param {String} UseTime    启用时间
   */
  updateDeviceUseTime(devicesn, UseTime) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, devicesn, UseTime }
    return $ajax.post(serverUrl('Device/UpdateDeviceUseTime'), data)
  },
  // -------------------------------------- 设备控制数据 -----------------------------------------
  /**
   * 获取设备的所有控制数据
   * @param {String} deviceSn 设备序列号
   */
  getDeviceControlData(deviceSn) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, deviceSn }
    return $ajax.get(serverUrl('DeviceControlData/GetDeviceControlData'), data)
  },
  /**
   * 获取设备配件下的控制数据
   * @param {String} deviceSn     设备序列号
   * @param {String} accessoryId  配件编号
   */
  findControlDataByAccessory(deviceSn, accessoryId) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, deviceSn, accessoryId }
    return $ajax.get(serverUrl('DeviceControlData/FindControlDataByAccessory'), data)
  },
  /**
   * 新增设备控制数据
   * @param {string} DeviceSn     设备序列号
   * @param {string} ControlName  控制名称
   * @param {string} DataValue    默认控制值
   * @param {string} PanelId      面板标识
   * @param {string} DataDefineId 设备数据定义标示
   * @param {string} DataKey      设备数据定义标示对应的Key，用于mqtt控制
   * @param {string} AccessoryId  配件编号
   * @param {string} AssociateDefineId 关联数据定义ID
   * @param {String} SequenceIn   组内排序（配件内控制项之间的排序），json格式的字符串
   * @param {String} SequenceOut  组间排序（配件之间的排序），json格式的字符串
   */
  deviceControlDataAdd({ DeviceSn, ControlName, DataValue, PanelId, DataDefineId, DataKey, AccessoryId, AssociateDefineId, SequenceIn, SequenceOut }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = {
      account,
      token,
      DeviceSn,
      ControlName,
      DataValue,
      PanelId,
      DataDefineId,
      DataKey,
      AccessoryId,
      AssociateDefineId,
      SequenceIn,
      SequenceOut
    }
    return $ajax.post(serverUrl('DeviceControlData/DeviceControlDataAdd'), data)
  },
  /**
   * 修改设备控制数据
   * @param {string} DeviceSn           设备序列号
   * @param {string} ControlName        控制名称
   * @param {string} DataValue          默认控制值
   * @param {string} Id                 设备控制数据标识
   * @param {string} DataDefineId       设备数据定义标示
   * @param {string} AccessoryId        配件编号
   * @param {string} AssociateDefineId  关联数据定义ID
   * @param {Number} IState             android端使用区分是否是显示项，0代表不显示，1代表显示
   */
  updateDeviceControlData({ DeviceSn, ControlName, DataValue, Id, DataDefineId, AccessoryId, AssociateDefineId, IState }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = {
      account,
      token,
      DeviceSn,
      ControlName,
      DataValue,
      Id,
      DataDefineId,
      AccessoryId,
      AssociateDefineId,
      IState
    }
    return $ajax.put(serverUrl('DeviceControlData/updateDeviceControlData'), data)
  },
  /**
   * 修改设备控制数据
   * @param {string} DeviceSn   设备序列号
   * @param {string} Accessory  设备配件编号列表（以|分隔），用于组间位置修改时使用，组内修改时忽略
   * @param {string} Id         控制数据编号列表（以|分隔），用于组内位置修改时使用，组间时忽略
   * @param {string} seq        组内或者组间位置信息列表（各个位置信息以|分隔）
   * @param {string} type       组间或者组内标示，0为组间，1为组内
   */
  updateDeviceControlSeqIn({ DeviceSn, Accessory, Id, seq, type }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    let data = { account, token, DeviceSn, Accessory, Id, seq, type }
    if (type === 0) {
      data = { account, token, DeviceSn, Accessory, seq, type }
    } else if (type === 1) {
      data = { account, token, DeviceSn, Id, seq, type }
    }
    return $ajax.put(serverUrl('DeviceControlData/UpdateDeviceControlSeqIn'), data)
  },
  /**
   * 删除设备控制数据
   * @param {string} id        设备控制数据标识
   * @param {string} deviceSn  设备序列号
   */
  deleteDeviceControlData(id, deviceSn) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, deviceSn, id }
    return $ajax.post(serverUrl('DeviceControlData/DeleteDeviceControlData'), data)
  },

  // -------------------------------------- 设备配置信息 -----------------------------------------
  /**
   * 新增设备配置信息
   * @param {string} DeviceSn     设备序列号
   * @param {string} Name         名称
   * @param {string} Category     类型（自定义的类型->./constants/dictionaries -> DEVICE_CONFIG_DIC）
   * @param {string} DefineId     数据定义标示
   */
  deviceConfigAdd({ DeviceSn, Name, Category, DefineId }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, DeviceSn, Name, Category, DefineId }
    return $ajax.post(serverUrl('DeviceConfig/Add'), data)
  },
  /**
   * 修改设备配置信息
   * @param {string} DeviceSn     设备序列号
   * @param {string} Name         名称
   * @param {string} Category     类型（自定义的类型->./constants/dictionaries -> DEVICE_CONFIG_DIC）
   * @param {string} DefineId     数据定义标示
   * @param {string} Id           设备配置信息标识
   */
  deviceConfigSave({ DeviceSn, Name, Category, DefineId, Id }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, DeviceSn, Name, Category, DefineId, Id }
    return $ajax.put(serverUrl('DeviceConfig/Save'), data)
  },
  /**
   * 删除设备配置信息
   * @param {string} Id           设备配置信息标识
   * @param {string} DeviceSn     设备序列号
   */
  deviceConfigRemove(Id, deviceSn) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, Id, deviceSn }
    return $ajax.post(serverUrl('DeviceConfig/Remove'), data)
  }
}

export default DEVICE_API
