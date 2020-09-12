/*
 * @Author: jiapeng.Zheng
 * @Date: 2018-05-22 09:25:42
 * @Last Modified by: jiapeng.Zheng
 * @Last Modified time: 2019-04-08 10:35:42
 * @description:
 */
import $ajax from '@helper/ajax'
import $utils from '../utils'
// import store from '@store'

const serverUrl = $utils.serverUrl

export default {
  /**
   * 获取设备类型
   */
  getDeviceType() {
    return $ajax.get(serverUrl('Type'))
  },
  /**
   * 添加设备类型
   * @param {string} ICON             设备类型图标名称
   * @param {string} DeviceTypeName   设备类型名称
   * @param {string} ParentId         父标识
   * @param {string} Description      设备类型描述
   * @param {number} Order            排序
   */
  addDeviceType({ icon, typeName, parentId, description, Status }, GroupId) {
    const data = { ICON: icon, TypeName: typeName, parentId, Description: description, Status, GroupId }
    return $ajax.post(serverUrl('Type'), data)
  },
  /**
   * 修改设备类型
   * @param {string} ICON             设备类型图标名称
   * @param {string} Id               设备类型标识
   * @param {string} DeviceTypeName   设备类型名称
   * @param {string} ParentId         父标识
   * @param {string} Description      设备类型描述
   * @param {number} Order            排序
   */
  updateDeviceType({ id, icon, typeName, description }) {
    const data = { TypeName: typeName, ICON: icon, Id: id, Description:description  }
    return $ajax.put(serverUrl(`Type/${id}`), data)
  },
  /**
   * 删除设备类型
   * @param {number} id 设备类型标识
   */
  deviceTypeRemove(id) {
    return $ajax.post(serverUrl(`Type/${id}`))
  },
  // ------------------ DeviceTypeStatisticsInfo(设备类型统计) ------------------
  /**
   * 获取类型统计数据配置，获取该类型下所有的数据
   * @param {string} TypeId      设备类型标示
   */
  getTypeStatisticsInfoList({ pageNo, pageSize, sortData, sortType, Search, TypeId }) {
    let data = { PageNo: pageNo, PageSize: pageSize, OrderBy: sortData, OrderType: sortType, Search }
    return $ajax.get(serverUrl(`type/${TypeId}/TypeStatistics`), data)
  },
  /**
   * 获取所有类型统计数据配置
   */
  getGroupStatisticsList() {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token }
    return $ajax.get(serverUrl('TypeStatisticsInfo/GetGroupStatisticsList'), data)
  },
  /**
   * 添加类型统计数据配置
   * @param {{ Key:string, StaticsType:boolean, DisplayType:boolean, TypeId:number, Standard:string, Filter:string, FilterType:number, ShowState:number, SUnit:string, Name:string }} param
   * @description   Key           要统计的key。注意这个值要和数据定义的key一致
   * @description   StaticsType   数据类型，1表示瞬时值，2表示累计值
   * @description   DisplayType   分类，0表示检测，1表示监测，2表示状态
   * @description   TypeId        设备类型标示
   * @description   Standard      标准值，设计值
   * @description   SUnit         标准值单位
   * @description   Filter        过滤内容;
   * @description   FilterType    过滤方案：0为不过滤，1为最大值最小值过滤，2为其他方案;
   * @description   ShowState     展示层级：0表示设备级，1代表场站级，2代表项目级，3代表首页;
   * @description   Name          要统计的数据名称
   */
  typeStatisticsInfoAdd({ Key, StaticsType, DisplayType, TypeId, Standard, Filter, FilterType, ShowState, SUnit, Name }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = {
      account,
      token,
      Key,
      StaticsType,
      DisplayType,
      TypeId,
      Standard,
      Filter,
      FilterType,
      ShowState,
      SUnit,
      Name
    }
    return $ajax.post(serverUrl('TypeStatisticsInfo/TypeStatisticsInfoAdd'), data)
  },
  /**
   * 修改类型统计数据配置
   * @param {{ Key:string, StaticsType:boolean, DisplayType:boolean, TypeId:number, Standard:string, Filter:string, FilterType:number, ShowState:number, SUnit:string, Name:string }} param
   * @description   Id            类型统计标示
   * @description   Key           要统计的key。注意这个值要和数据定义的key一致;
   * @description   StaticsType   数据类型，1表示瞬时值，2表示累计值;
   * @description   DisplayType   分类，0表示检测，1表示监测，2表示状态;
   * @description   TypeId        设备类型标示;
   * @description   Standard      标准值，设计值;
   * @description   SUnit         标准值单位;
   * @description   Filter        过滤内容;
   * @description   FilterType    过滤方案：0为不过滤，1为最大值最小值过滤，2为其他方案;
   * @description   ShowState     展示层级：0表示设备级，1代表场站级，2代表项目级，3代表首页;
   * @description   Name          要统计的数据名称;
   */
  typeStatisticsInfoSave({ Id, Key, StaticsType, DisplayType, TypeId, Standard, Filter, FilterType, ShowState, SUnit, Name }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = {
      account,
      token,
      Id,
      Key,
      StaticsType,
      DisplayType,
      TypeId,
      Standard,
      Filter,
      FilterType,
      ShowState,
      SUnit,
      Name
    }
    return $ajax.put(serverUrl('TypeStatisticsInfo/TypeStatisticsInfoSave'), data)
  },
  /**
   * 删除类型统计数据配置
   * @param {String}  Id            类型统计标示
   * @param {string}  TypeId        设备类型标示
   */
  typeStatisticsInfoRemove({ Id, TypeId }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, Id, TypeId }
    return $ajax.post(serverUrl('TypeStatisticsInfo/TypeStatisticsInfoRemove'), data)
  },

  // ------------------------- Schema (设备类型模式) -----------------

  /**
   * 获取类型模式数据，获取该类型下所有的数据
   * @param {string} TypeId      设备类型标示
   */
  getTypeSchema(typeId) {
    return $ajax.get(serverUrl(`type/${typeId}/TypeSchema`))
  },
  /**
   * 添加类型模式
   * @param {{ Key:string, Name:string, Value:number, TypeId:number, ParentId:number, SchemaType: number }}
   * @description Key           模式的key，注意这个值要和数据定义的key一致
   * @description Name          模式名称
   * @description Value         模式的Value
   * @description TypeId        设备类型标示
   * @description ParentId      父模式标示
   * @description SchemaType    模式类型（0：自动，1：自定义）
   */
  addSchema({ Key, Name, Value, TypeId, ParentId, SchemaType }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, Key, Name, Value, TypeId, ParentId, SchemaType }
    return $ajax.post(serverUrl('Schema/AddSchema'), data)
  },
  /**
   * 更新类型模式
   * @param {{ Id:number, Key:string, Name:string, Value:number, TypeId:number, ParentId:number}}
   * @description Id            模式标示
   * @description Key           模式的key，注意这个值要和数据定义的key一致
   * @description Name          模式名称
   * @description Value         模式的Value
   * @description TypeId        设备类型标示
   * @description ParentId      父模式标示
   */
  updateSchema({ Id, Key, Name, Value, TypeId, ParentId }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, Id, Key, Name, Value, TypeId, ParentId }
    return $ajax.put(serverUrl('Schema/UpdateSchema'), data)
  },
  /**
   * 删除类型模式
   * @param {string} Id            模式标示
   */
  removeSchema(Id) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, Id }
    return $ajax.delete(serverUrl('Schema/RemoveSchema'), data)
  },

  // ------------------------- DeviceTypeTemplate(设备类型模板) -----------------

  /**
   * 获取分页设备类型模板
   * @param {string} TypeId      设备类型标示
   * @param {string} sortData    排序字段
   * @param {string} sortType    排序方法
   * @param {string} pageNo      分页：当前页
   * @param {string} pageSize    分页：页大小
   * @param {string} TempName    查询：模板名称
   */
  getDeviceTypeTemplatePage({ TypeId, sortData, sortType, pageNo, pageSize, TempName, IsStandard }) {
    const data = { TypeId, sortData, sortType, pageNo, pageSize, TempName, IsStandard }
    return $ajax.get(serverUrl('DeviceTypeTemplate/GetDeviceTypeTemplatePage'), data)
  },

  /**
   * 获取设备类型模板
   * @param {String} TypeId  设备类型标识
   */
  getDeviceTypeTemplate(TypeId) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, TypeId }
    return $ajax.get(serverUrl('DeviceTypeTemplate/GetDeviceTypeTemplate'), data)
  },

  /**
   * 新增设备类型模板
   * @param {DeviceTypeDTO}  DeviceTypeDTO
   */
  typeTemplateAdd({ TempName, IsStandard, DeviceSn, TypeId }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, TempName, IsStandard, DeviceSn, TypeId }
    return $ajax.post(serverUrl('DeviceTypeTemplate/TypeTemplateAdd'), data)
  },

  /**
   * 修改设备类型模板
   * @param {string} TempName      模版名称（模板名称不能重复）
   * @param {Boolean} Id           模板标示
   */
  typeTemplateModify({ TempName, Id }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, TempName, Id }
    return $ajax.put(serverUrl('DeviceTypeTemplate/TypeTemplateModify'), data)
  },

  /**
   * 删除设备类型模板
   * @param {String} TempId  模板标示
   */
  deviceTypeTemplateRemove(TempId) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, TempId }
    return $ajax.post(serverUrl('DeviceTypeTemplate/DeviceTypeTemplateRemove'), data)
  },

  // ---------------- DeviceTypeTemplateProfile(设备类型模板数据定义) ------------

  /**
   * 获取设备类型模板数据定义
   * @param {String} TempId         模板标示
   * @param {string} sortData       排序字段
   * @param {string} sortType       排序方法
   * @param {string} pageNo         分页：当前页
   * @param {string} pageSize       分页：页大小
   * @param {String} DataKey        查询：数据标识
   * @param {String} DataName       查询：数据名称
   */
  getTemplateProfile({ TempId, sortData, sortType, pageNo, pageSize }) {
    const data = { OrderBy: sortData, OrderType: sortType, PageNo: pageNo, PageSize: pageSize }
    return $ajax.get(serverUrl(`type/${TempId}/TypeDataDefine`), data)
  },
  /**
   * 添加设备类型模板数据定义
   * @param {String} TempId         模板标示
   * @param {String} DataType       数据类型
   * @param {String} DataKey        数据标示(输入)
   * @param {String} DisplayKey     数据标示(输出)
   * @param {String} DataName       数据名称
   * @param {String} Unit           单位符号
   * @param {String} DefaultValue   默认值
   * @param {JSONString} Format     数据转换
   * @param {Boolean} AutoControl   用于标识该数据定义受不受手自动的影响
   */
  addTemplateProfile({ TempId, DataType, DataKey, DisplayKey, DataName, Unit, DefaultValue, Format, AutoControl = false }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = {
      account,
      token,
      TempId,
      DataType,
      DataKey,
      DisplayKey,
      DataName,
      Unit,
      DefaultValue,
      Format,
      AutoControl
    }
    return $ajax.post(serverUrl('DeviceTypeTemplateProfile/AddTemplateProfile'), data)
  },
  /**
   * 添加类型模板面板数据
   * @param {String} TemplateId    模板标示
   * @param {String} PanelTypeId   面板类型
   * @param {String} PanelName     面板名称
   */
  addTemplatePanel({ TemplateId, PanelTypeId, PanelName }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, TemplateId, PanelTypeId, PanelName }
    return $ajax.post(serverUrl('TypeTemplatePanel/Add'), data)
  },
  /**
   * 添加类型模板参数信息
   * @param {String} TemplateId   模板标示
   * @param {String} DataName     参数名称
   * @param {String} DataType     参数类型
   * @param {String} DataValue    参数值
   */
  addTemplateArgs({ TemplateId, DataName, DataType, DataValue }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, TemplateId, DataName, DataType, DataValue }
    return $ajax.post(serverUrl('TypeTemplateArgs/Add'), data)
  },
  /**
   * 添加类型模板配件信息
   * @param {String} TemplateId   模板标示
   * @param {String} Name         类型模板配件名称
   * @param {String} ICON         类型模板配件图标
   */
  addTemplateAccessory({ TemplateId, Name, ICON }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, TemplateId, Name, ICON }
    return $ajax.post(serverUrl('TypeTemplateAccessory/Add'), data)
  },
  /**
   * 添加类型模板控制数据
   * @param {String} ControlName    制数据名称
   * @param {String} DataValue      设备设置值
   * @param {String} DataDefineKey  设备数据栏位的key
   * @param {String} AssociateKey   设备关联的数据栏位的key
   * @param {String} SequenceIn     设备组内坐标
   * @param {String} SequenceOut    设备组间坐标
   * @param {String} Istate         控制数据是否显示
   * @param {String} AccessoryId    类型模板配件标示
   */
  addTemplateControlData({ ControlName, DataValue, DataDefineKey, AssociateKey, SequenceIn, SequenceOut, Istate, AccessoryId }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = {
      account,
      token,
      ControlName,
      DataValue,
      DataDefineKey,
      AssociateKey,
      SequenceIn,
      SequenceOut,
      Istate,
      AccessoryId
    }
    return $ajax.post(serverUrl('TypeTemplateControlData/Add'), data)
  },
  /**
   * 添加设备配置类型数据
   * @param {String} TemplateId       模板标示
   * @param {String} Category         配置类型（约定的数据）
   * @param {String} DataDefineKey    设备数据定义key
   * @param {String} Name             设备配置名称
   */
  typeTemplateConfigAdd({ TemplateId, Category, DataDefineKey, Name }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, TemplateId, Category, DefineKey: DataDefineKey, Name }
    return $ajax.post(serverUrl('TypeTemplateConfig/TypeTemplateConfigAdd'), data)
  },
  /**
   * 删除设备类型模板数据定义
   * @param {String} TempId     模板标示
   * @param {String} profileId  数据定义标示
   */
  removeTemplateProfile(TempId, profileId) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, TempId, profileId }
    return $ajax.post(serverUrl('DeviceTypeTemplateProfile/RemoveTemplateProfile'), data)
  },
  /**
   * 删除类型模板面板数据
   * @param {String} id     模板面板标示
   */
  removeTemplatePanel(id) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, id }
    return $ajax.post(serverUrl('TypeTemplatePanel/Remove'), data)
  },
  /**
   * 删除类型模板参数信息
   * @param {String} id     模板参数标示
   */
  removeTemplateArgs(id) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, id }
    return $ajax.post(serverUrl('TypeTemplateArgs/Remove'), data)
  },
  /**
   * 删除类型模板配件信息
   * @param {String} id     类型模板配件标示
   */
  removeTemplateAccessory(id) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, id }
    return $ajax.post(serverUrl('TypeTemplateAccessory/Remove'), data)
  },
  /**
   * 删除类型模板控制数据
   * @param {String} id     类型模板配件标示
   */
  removeTemplateControlData(id) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, id }
    return $ajax.post(serverUrl('TypeTemplateControlData/Remove'), data)
  },
  /**
   * 删除设备配置类型数据
   * @param {String} id     设备模板配置数据标示
   */
  typeTemplateConfigRemove(id) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, id }
    return $ajax.post(serverUrl('TypeTemplateConfig/TypeTemplateConfigRemove'), data)
  },
  /**
   * 修改设备类型模板数据定义
   * @param {String} TempId         模板标示
   * @param {String} Id             数据定义标示
   * @param {String} DataType       数据类型
   * @param {String} DataKey        数据标示(输入)
   * @param {String} DisplayKey     数据标示(输出)
   * @param {String} DataName       数据名称
   * @param {String} Unit           单位符号
   * @param {String} DefaultValue   默认值
   * @param {JSONString} Format     数据转换
   * @param {Boolean} AutoControl   用于标识该数据定义受不受手自动的影响
   */
  modifyTemplateProfile({ TempId, Id, DataType, DataKey, DisplayKey, DataName, Unit, DefaultValue, Format, AutoControl = false }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = {
      account,
      token,
      TempId,
      Id,
      DataType,
      DataKey,
      DisplayKey,
      DataName,
      Unit,
      DefaultValue,
      Format,
      AutoControl
    }
    return $ajax.put(serverUrl('DeviceTypeTemplateProfile/ModifyTemplateProfile'), data)
  },
  /**
   * 添加类型模板面板数据
   * @param {String} TemplateId    模板标示
   * @param {String} Id            类型模板面板标示
   * @param {String} PanelName     面板名称
   */
  saveTemplatePanel({ TemplateId, Id, PanelName }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, TemplateId, Id, PanelName }
    return $ajax.put(serverUrl('TypeTemplatePanel/Save'), data)
  },
  /**
   * 修改类型模板参数信息
   * @param {String} TemplateId   模板标示
   * @param {String} DataName     参数名称
   * @param {String} DataType     参数类型
   * @param {String} DataValue    参数值
   * @param {String} Id           模板参数标示
   */
  saveTemplateArgs({ TemplateId, Id, DataName, DataType, DataValue }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, TemplateId, Id, DataName, DataType, DataValue }
    return $ajax.put(serverUrl('TypeTemplateArgs/Save'), data)
  },
  /**
   * 修改类型模板配件名称
   * @param {String} TemplateId   模板标示
   * @param {String} Name         类型模板配件名称
   * @param {String} Id           类型模板配件标示
   * @param {String} ICON         类型模板配件图标
   */
  saveTemplateAccessory({ TemplateId, Id, Name, ICON }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, TemplateId, Id, Name, ICON }
    return $ajax.put(serverUrl('TypeTemplateAccessory/Save'), data)
  },
  /**
   * 修改类型模板控制数据
   * @param {String} Id             类型模板配件控制项标示
   * @param {String} ControlName    制数据名称
   * @param {String} DataValue      设备设置值
   * @param {String} DataDefineKey  设备数据栏位的key
   * @param {String} AssociateKey   设备关联的数据栏位的key
   * @param {String} SequenceIn     设备组内坐标
   * @param {String} SequenceOut    设备组间坐标
   * @param {String} IState         控制数据是否显示
   * @param {String} AccessoryId    类型模板配件标示
   */
  saveTemplateControlData({ Id, ControlName, DataValue, DataDefineKey, AssociateKey, SequenceIn, SequenceOut, IState, AccessoryId }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = {
      account,
      token,
      Id,
      ControlName,
      DataValue,
      DataDefineKey,
      AssociateKey,
      SequenceIn,
      SequenceOut,
      IState,
      AccessoryId
    }
    return $ajax.put(serverUrl('TypeTemplateControlData/Save'), data)
  },
  /**
   * 修改类型模板控制的布局
   * @param {string} Accessory  设备配件编号列表（以|分隔），用于组间位置修改时使用，组内修改时忽略
   * @param {string} Id         控制数据编号列表（以|分隔），用于组内位置修改时使用，组间时忽略
   * @param {string} seq        组内或者组间位置信息列表（各个位置信息以|分隔）
   * @param {string} type       组间或者组内标示，0为组间，1为组内
   */
  updateTemplateControlSeqIn({ Accessory, Id, seq, type }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    let data = { account, token, Accessory, Id, seq, type }
    if (type === 0) {
      data = { account, token, Id: Accessory, seq, type }
    } else if (type === 1) {
      data = { account, token, Id, seq, type }
    }
    return $ajax.put(serverUrl('TypeTemplateControlData/UpdateTemplateControlSeqIn'), data)
  },
  /**
   * 修改设备配置类型数据
   * @param {String} Id             设备模板配置数据标示
   * @param {String} Category       配置类型（约定的数据）
   * @param {String} DataDefineKey  设备数据定义key
   * @param {String} Name           设备配置名称
   */
  typeTemplateConfigModify({ Id, Category, DataDefineKey, Name }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, Id, Category, DefineKey: DataDefineKey, Name }
    return $ajax.put(serverUrl('TypeTemplateConfig/TypeTemplateConfigModify'), data)
  },
  // ---------------- TypeUpdateFile(设备类型模板数据定义) ------------
  /**
   * 删除设备类型升级文件
   * @param {String} id         升级文件标识
   */
  typeUpdateFileDelete(id) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, id }
    return $ajax.post(serverUrl('TypeUpdateFile/TypeUpdateFileDelete'), data)
  },

  /* 
  * 获取类型升级文件
  */
  typeUpdateFile(typeId) {
    return $ajax.get(serverUrl(`type/${typeId}/TypeUpdateFile`))
  },
  /* 
  * 获取类型参数（分页）
  */
  typeArgument({ TempId, sortData, sortType, pageNo, pageSize }) {
    const data = { OrderBy: sortData, OrderType: sortType, PageNo: pageNo, PageSize: pageSize }
    return $ajax.get(serverUrl(`type/${TempId}/TypeArgument`), data)
  }
}
