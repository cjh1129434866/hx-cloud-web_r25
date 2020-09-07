/**
 * 所有数据结构
 */
type AllDataListVO<T> = {
  // Account: null | string
  // Message: string
  // Success: boolean
  /**
   * 数据
   */
  list: Array<T>
}
/**
 * 所有数据结构
 */
type AllDataListVO2<T> = {
  Message: string
  Success: boolean
  Data: Array<T>
}

type PageVO = {
  /**
   * 总数据长度
   */
  DataCount: number
  // Message: string
  /**
   * 总页数
   */
  PageCount: number
  /**
   * 当前页码
   */
  PageNo: number
  /**
   * 每页的数据长度
   */
  PageSize: number
  // Success: boolean
}

/**
 * 项目/站场的分页数据结构
 */
type ProjectPageDataListVO<T> = PageVO & {
  /**
   * 数据
   */
  Projects: Array<T>
}
/**
 * 设备的分页数据结构
 */
type DevicePageDataListVO<T> = PageVO & {
  /**
   * 数据
   */
  Data: Array<T>
}

/**
 * 单个数据结构
 */
type DataInfo<T> = {
  // Account: null | string
  // Message: string
  // Success: boolean
  /**
   * 数据
   */
  Data: T
}

type DataPageList<T> = PageVO & {
  List: T[]
}

/**
 * 不带分页的数据列表
 */
type DataList<T> = {
  list: T[]
}
