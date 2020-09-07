/**
 * "地域"数据结构
 */
type AreaVO = {
  /**
   * 地域编码
   */
  Code: string
  /**
   * 上一级地域的编码，为'0'代表为最顶级的地域
   */
  ParentCode: string
  /**
   * 地域名称
   */
  Name: string
  /**
   * 地域名称缩写
   */
  ShortName: string
  /**
   * 维度
   */
  Latitude: number
  /**
   * 经度
   */
  Longitude: number
  /**
   * 层级
   */
  Level: 1
}
/**
 * 区域数据结构
 */
type AreaRegionVO = {
  /**
   * 区域编码,每三位代表一级区域，如："101005001"代表中国区域(101)下的东部区域(005)下的江浙区域(001)
   */
  Id: string
  /**
   * 区域路径，从最顶级区域到该区域的所有区域名称(不包含101)，用 "/" 划分，如：'东部区域/江浙区域'
   */
  FullPath: string

  /**
   * 当前区域下绑定的地域列表
   */
  Area: Array<AreaVO>
  /**
   * Area.toString() 后的格式
   */
  AreaCode: string
  /**
   * 父级区域的编码
   */
  ParentId: string
  /**
   * 区域名称
   */
  Name: string
  /**
   * 区域范围，例: "{"obj":"","center":{"P":34.31261560846104,"O":117.75368718802929,"lng":117.753687,"lat":34.312616},"radius":644023.3152575202,"type":"circle","bounds":{"Jb":{"P":28.524798013894568,"O":110.74801606068354,"lng":110.748016,"lat":28.524798},"Gb":{"P":40.10043320302751,"O":124.75935831537504,"lng":124.759358,"lat":40.100433},"southwest":{"P":28.524798013894568,"O":110.74801606068354,"lng":110.748016,"lat":28.524798},"northeast":{"P":40.10043320302751,"O":124.75935831537504,"lng":124.759358,"lat":40.100433}}}"
   * 作用1: 高德地图根据该字段生成区域对应的覆盖物；
   * 作用2: 也可以通过 OVERLAYS_FUNCTION.calcCenterPosition 计算出其中心点的坐标
   */
  Radius: string
  /**
   * 保留字段
   */
  Point: null
}
