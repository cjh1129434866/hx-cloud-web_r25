/*
 * @Author       : jiapeng.Zheng
 * @Date         : 2020-04-07 14:39:37
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-04-07 14:44:15
 * @Description  :
 */
type DeviceTypeDTO = {
  /**
   * 模版名称（模板名称不能重复）
   */
  TempName: string
  /**
   * 是否标准模板（一个类型只能有一个标准模板）
   */
  IsStandard: boolean
  /**
   * 设备编号（可以为空，把设备保存为模板时不能为空）
   */
  DeviceSn: string
  /**
   * 设备类型标示
   */
  TypeId: number
}
