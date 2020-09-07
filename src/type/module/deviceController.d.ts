/*
 * @Author: jiapeng.Zheng
 * @Date: 2019-08-27 09:48:50
 * @LastEditors: jiapeng.Zheng
 * @LastEditTime: 2019-08-27 10:10:00
 * @Description: 设备控制
 */

/**
 * 模块
 */
type ModuleBO = {
  /**
   * 名称（首页、工艺、模式、报警）
   */
  name: string
  /**
   * icon
   */
  icon: string
  /**
   * vue 组件
   */
  component: any
}
/**
 * 运行模式
 */
type RunModelBO = {
  Id: number
  Name: string
  /**
   * 模式对应的Value
   */
  Value: string
  /**
   * 模式对应的Key，通过mqtt对该key写对应的Value
   */
  Key: string
  isLoading: boolean
  disabled: boolean
  /**
   * 模式类型（1:自定义模式;0:自动模式）
   */
  SchemaType: '0' | '1'
  Child: Array<RunModelBO>
}
/**
 * 当前激活的Tab：调试(debug)、自动(autoRun)、自定义(customRun)、检修(recondition)
 */
type ActiveModelBO = 'debug' | 'autoRun' | 'customRun' | 'recondition'
