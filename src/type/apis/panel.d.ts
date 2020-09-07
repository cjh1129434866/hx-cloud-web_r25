/*
 * @Author       : jiapeng.Zheng
 * @Date         : 2020-04-02 09:32:22
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-04-02 09:54:48
 * @Description  : 设备面板
 */
type DevicePanelVO = {
  Id: number
  /**
   * 面板名称（用户自定义）
   */
  PanelName: string
  /**
   * 面板类型
   */
  TypeId: number
  /**
   * 面板名称
   */
  TypeName: string
}

type DevicePanelBO = DevicePanelVO & {
  /**
   * 面板关联的组件名称
   */
  componentName: string
}

type DevicePanelJson = { [propName: string]: DevicePanelBO }
