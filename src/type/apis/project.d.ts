/**
 * 用于界面上显示的“项目/站场”的数据结构
 */
type ProjectVO = {
  Address: string
  /**
   * 站场绑定的地域
   */
  AreaId: string
  // AreaName: string
  /**
   * 项目所属的客户ID
   */
  ClientId: number
  /**
   * 设备数量
   */
  DeviceNum: number
  /**
   * 前端注入的属性，非后端api接口携带的属性，用于保存当前站场/项目下激活的设备
   */
  _activeDeviceData: DeviceVO
  /**
   * 项目或站场所属项目构成的id，例子：项目ID/子项目ID/...
   */
  FullId: string
  /**
   *  项目或站场所属项目构成的名称，例子：项目名称/子项目名称/...
   */
  FullName: string
  /**
   * 项目/站场ID
   */
  Id: number
  // ParentId: number
  Position: string
  /**
   * 前端根据 Position、Position、RegionId判断计算出来的坐标
   */
  lnglatXY: Array<string | number>
  // ProjectAffiliateData: Array<>
  // ProjectImageData: Array<>
  /**
   * 项目/站场名称
   */
  ProjectName: string
  /**
   * 项目数量
   */
  ProjectNum: number
  /**
   * 类型：用于区分项目(1)Or站场(2)
   */
  ProjectType: number
  /**
   * 区域编码
   */
  RegionId: string
  // RegionName: string
  // RegionPath: string
  /**
   * 站场数量
   */
  SitesNum: number
  // StartTime: string
  // Token: null
  // level: number
}
/**
 * 调用“项目”api接口时上传的参数
 */
type ProjectPageDTO = {
  /**
   * 父项目编号，如果一级项目则为空
   */
  projectId?: string
  /**
   * 查询字段：项目所属的客户ID
   */
  clientId: number
  /**
   * 查询字段：项目类型（0：所有；1：项目；2：站场）
   */
  ProjectType?: number
  /**
   * 查询字段：项目名称，为空('')时查询所有
   */
  projectName: string
  /**
   * 页码
   */
  pageNo: number
  /**
   * 页大小
   */
  pageSize: number
  /**
   * 排序的字段
   */
  sortData: string
  /**
   * 排序类型(asc或者desc)
   */
  sortType: string
}
