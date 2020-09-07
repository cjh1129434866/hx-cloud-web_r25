/*
 * @Author: jiapeng.Zheng
 * @Date: 2019-09-10 11:16:48
 * @LastEditors: jiapeng.Zheng
 * @LastEditTime: 2019-09-10 13:48:42
 * @Description: IndexedDB
 */
/**
 * IndexedDB 数据表中的数据格式
 */
type IndexedDBDataItemDO = {
  /**
   * 主键，不能重复，用于查找当前数据是否存在
   */
  Key: string
  /**
   * 数据创建时间，用于判断该数据是否过期
   */
  CreatedTime: string
  /**
   * 具体的数据
   */
  Data: any
}
/**
 * IndexedDB 数据表中的建立索引所需的参数
 */
type IndexedDBStoreIndexBO = {
  /**
   * 索引名称
   */
  name: string
  /**
   * 索引所在的属性
   */
  keyPath: string
  /**
   * 索引的配置对象
   */
  options?: IDBIndexParameters
}
/**
 * IndexedDB 创建数据表所需的参数
 */
type IndexedDBStoreBO = {
  /**
   * 表名称
   */
  storeName: string
  /**
   * 主键
   */
  keyPath: string
  /**
   * 索引
   */
  storeIndexList?: Array<IndexedDBStoreIndexBO>
  /**
   * 数据有效时间
   */
  expiresTime: number
  /**
   * 数据有效时间的单位，默认：天(d)，可取： "y" | "M" | "w" | "d" | "h" | "m" | "s" | "ms"
   */
  expiresUnit: 'y' | 'M' | 'w' | 'd' | 'h' | 'm' | 's' | 'ms'
}
