/*
 * @Author       : jiapeng.Zheng
 * @Date         : 2020-05-19 14:50:27
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-05-19 14:57:29
 * @Description  :
 */

/**
 * 控制权限
 */
interface permissionVO {
  /**
   * 是否有权限
   */
  IsAccess: boolean
  /**
   * 当IsAccess为false时的错误信息
   */
  Message: string
  /**
   * 接口调用失败还是成功
   */
  Success: boolean
}

interface ControlPermissionVO {
  /**
   * 是否有权限
   */
  IsAccess: boolean
  /**
   * 当IsAccess为false时的错误信息
   */
  Message: string
  /**
   * 控制设备的数据:
   * 当无权限时，该值为设备原来的值;
   * 当若有权限，该值为设备变更后的值;
   */
  data: MqttDataAck
}
