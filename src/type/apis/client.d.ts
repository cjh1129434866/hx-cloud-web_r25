/**
 * 用于界面上显示“客户”的数据结构
 */
type ClientVO = {
  // Account: null | string
  /**
   * 地理位置名称
   */
  Address: string
  /**
   * 地理位置坐标
   */
  Position: string
  /**
   * 客户所属的地域
   */
  AreaId: string
  /**
   * 客户所属的区域
   */
  RegionId: string
  /**
   * 客户名称
   */
  ClientName: string
  // ClientSn: string
  // Description: string
  /**
   * 客户下项目数量，暂时未空
   */
  projectNum: number
  /**
   * 前端根据 Position、Position、RegionId判断计算出来的坐标
   */
  lnglatXY: Array<string | number>
  /**
   * 客户ID
   */
  Id: number
  FullId: undefined
  FullName: undefined
  // Linkman: string
  // Message: null | string
  // Mobile: string
  // Success: boolean
  // Telephone: string
  // Token: string
}
/**
 * 调用“客户”api接口时上传的参数
 */
type ClientDTO = {
  /**
   * 客户名称
   */
  ClientName: string
}
