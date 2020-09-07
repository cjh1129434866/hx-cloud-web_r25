/*
 * @Author       : jiapeng.Zheng
 * @Date         : 2020-04-01 13:44:44
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-04-03 17:28:39
 * @Description  : 设备参数
 */
type DeviceBaseVO = {
  /**
   * ID
   */
  Id: number
  /**
   * 参数名称
   */
  DataName: string
  /**
   * 参数值
   */
  DataValue: string
}

type DeviceBaseDTO = {
  Id?: number
  DeviceSn: string
  DataName: string
  DataType: string
  DataValue: string
  PanelId: number
}
