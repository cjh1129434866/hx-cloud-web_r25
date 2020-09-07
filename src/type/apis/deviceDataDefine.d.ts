/*
 * @Author: jiapeng.Zheng
 * @Date: 2019-08-27 14:34:16
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-01-15 15:00:13
 * @Description: 数据定义
 */
/**
 * 设备的数据定义
 */
type DeviceDataDefinedVO = {
  /**
   * 是否受手自动模式的影响（true:自动模式下能操作；false：自动模式下不可以操作），默认 false
   */
  AutoControl: boolean
  /**
   * 数据定义Key（输入标识），不为空
   */
  DataKey: string
  DataName: string
  /**
   * 数据类型，详情见 src\constants\dataTypeConfig\index.js 中的 DATA_TYPE_CONFIG 常量
   */
  DataType: 'string' | 'enum' | 'boolean' | 'monitor'
  DefaultValue: string
  DeviceSn: string
  /**
   * 输出标识，若为空，则 DisplayKey 默认与 DataKey 相同
   */
  DisplayKey: string
  /**
   * 数据格式化对象，详情见 src\constants\dataTypeConfig\index.js 中的 DATA_TYPE_UNIT_CONFIG 常量
   */
  Format: string
  Id: number
  /**
   * （暂时保留）判断该数据定义的读写权限，1:只读;2:可读可写;0:旧数据默认为0，为了兼容手动置为2
   */
  Model: 0 | 1 | 2
  /**
   * 单位 "["-"]"，详情见 src\constants\dataTypeConfig\index.js 中的 DATA_TYPE_UNIT_CONFIG 常量
   */
  Unit: string
}
/**
 * 设备子系统控制项绑定的数据定义
 */
type SystemControlDataDefined = {
  /**
   * 数据定义Key（输入标识）
   */
  DataKey: string
  /**
   * 输出标识，若为空，则 DisplayKey 默认与 DataKey 相同
   */
  DisplayKey: string
  /**
   * 数据定义的类型，详情见 src\constants\dataTypeConfig\index.js 中的 DATA_TYPE_CONFIG 常量
   */
  DataType: 'string' | 'enum' | 'boolean' | 'monitor'
  /**
   * 数据定义格式化对象，详情见 src\constants\dataTypeConfig\index.js 中的 DATA_TYPE_UNIT_CONFIG 常量
   */
  Format: string
  /**
   * 数据定义单位 "["-"]"，详情见 src\constants\dataTypeConfig\index.js 中的 DATA_TYPE_UNIT_CONFIG 常量
   */
  Unit: string
  /**
   * 关联数据定义Key（关联数据定义主要是用作显示）
   */
  AssociateKey: string
  /**
   * 关联数据定义的类型，详情见 src\constants\dataTypeConfig\index.js 中的 DATA_TYPE_CONFIG 常量
   */
  AssociateDataType: 'string' | 'enum' | 'boolean' | 'monitor'
  /**
   * 关联数据定义格式化对象，详情见 src\constants\dataTypeConfig\index.js 中的 DATA_TYPE_UNIT_CONFIG 常量
   */
  AssociateFormat: string
  /**
   * 关联数据定义单位 "["-"]"，详情见 src\constants\dataTypeConfig\index.js 中的 DATA_TYPE_UNIT_CONFIG 常量
   */
  AssociateUnit: string
}
