/*
 * @Author       : jiapeng.Zheng
 * @Date         : 2020-05-15 17:00:48
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-05-19 16:44:49
 * @Description  :
 */
/**
 * 新增“设备控制日志”对象
 */
type DeviceControlLogDTO = {
  /**
   * 设备序列号
   */
  DeviceSn: string
  /**
   * 被控制的“数据定义”的Key
   */
  Key: string
  /**
   * 被控制的“数据定义”的名称
   */
  KeyName: string
  /**
   * 原始值
   */
  OldValue: string | number | boolean
  /**
   * 要改变的值
   */
  Value: string | number | boolean
  /**
   * 改变后的值，若改变成功，则理论上 Value === NewValue
   */
  NewValue: string | number | boolean
  /**
   * 控制设备的时间
   */
  SendTime: string
  /**
   * 控制设备成功Or失败的时间，通过 Time - SendTime 可以计算出当前控制指令话费的时间
   */
  Time: string
}
/**
 * 查询“设备控制日志”对象（分页）
 */
type DeviceControlLogPageDTO = {
  /**
   * 设备序列号
   */
  DeviceSn: string
  /**
   * 当前页
   */
  pageNo: number
  /**
   * 页大小
   */
  pageSize: number
  /**
   * 开始时间
   */
  begin: string
  /**
   * 结束时间
   */
  end: string
  /**
   * 排序字段
   */
  order: string
  /**
   * 排序类型
   */
  orderType: string
  /**
   * 搜索字段，对key和keyName进行搜索
   */
  search: string
}

/**
 * 控制日志对象
 */
type DeviceControlLogVO = {
  DeviceSn: string
  Id: number
  Key: string
  KeyName: string
  NewValue: string
  OldValue: string
  SendTime: string
  Time: string
  Value: string
}
