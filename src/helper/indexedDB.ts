/*
 * @Author: jiapeng.Zheng
 * @Date: 2019-09-09 09:25:43
 * @LastEditors: jiapeng.Zheng
 * @LastEditTime: 2019-10-16 14:52:34
 * @Description:
 */
import $q from 'q'
import $utils from '@helper/utils.js'

export default class IndexedDB {
  private version: number // 数据库版本,变更时候只能增加不能减少
  private databaseName: string
  private storeList: Array<IndexedDBStoreBO> = []
  private DB: IDBDatabase = null
  private request: IDBOpenDBRequest = null
  private constructor(databaseName: string, version = 1) {
    if (!databaseName || !version) {
      throw new Error('databaseName or version must be not a null')
    }
    this.databaseName = databaseName
    this.version = version
  }
  /**
   * 创建表
   * @param {IndexedDBStoreBO}   数据表配置
   */
  private createStore({ storeName, keyPath, storeIndexList = [] }: IndexedDBStoreBO) {
    // 判断 storeName 表是否存在
    if (!this.DB.objectStoreNames.contains(storeName)) {
      // 不存在则新增一张叫做 storeName 的表格,主键为 keyPath
      const objectStore = this.DB.createObjectStore(storeName, { keyPath })
      objectStore.createIndex(keyPath, keyPath, { unique: true }) // 为主键建立索引
      // 建立索引,IDBObject.createIndex()的三个参数分别为:索引名称、索引所在的属性、配置对象（说明该属性是否包含重复的值）
      storeIndexList.forEach(ele => {
        objectStore.createIndex(ele.name, ele.keyPath, ele.options)
      })
      console.log(`数据表（${storeName}）创建成功`)
    }
  }
  /**
   * 清空 storeName 数据表
   * @param {string} storeName  数据表名称
   */
  clearStore(storeName: string) {
    const _readStore = this.storeList.find(ele => ele.storeName === storeName)
    if (!_readStore) {
      throw new Error(`不存在数据表:${storeName}！`)
    }
    this.DB.transaction([storeName], 'readwrite')
      .objectStore(storeName)
      .clear()
  }
  /**
   * 初始化数据表
   * @param {Array<IndexedDBStoreBO>} storeList   数据表配置数组
   */
  initStores(storeList: Array<IndexedDBStoreBO> = []) {
    const defer = $q.defer()
    this.storeList = storeList || [] // 确保 storeList 不为 null
    this.request = window.indexedDB.open(this.databaseName, this.version)
    this.request.onerror = ev => {
      console.error('数据库打开失败', ev)
      defer.reject(ev)
    }
    // 下面事情执行于：数据库首次创建版本，或者 window.indexedDB.open 传递的新版本（版本数值要比现在的高）
    // onupgradeneeded 后会接着调用 onsuccess 事件
    this.request.onupgradeneeded = () => {
      console.log(`数据库（version=${this.version}）创建成功`)
      this.DB = this.request.result // event.target.result
      this.storeList.forEach(ele => {
        this.createStore(ele)
      })
    }
    this.request.onsuccess = () => {
      console.log('数据库打开成功')
      this.DB = this.request.result
      // 数据库版本变化时触发（发生 upgradeneeded 事件，或调用indexedDB.deleteDatabase()）
      this.DB.onversionchange = ev => {
        console.log('数据库版本发送变化', ev)
        // 重新初始化
        // 若 newVersion 为空，这说明数据库被删除
        if (!ev.newVersion) {
          console.log('数据库被删除，重新生成数据库')
          this.initStores(this.storeList)
            .then(() => {
              console.log('重新生成数据库成功')
            })
            .catch(error => {
              console.error('重新生成数据库失败：', error)
            })
        }
      }
      defer.resolve(null)
    }

    return defer.promise
  }

  data2ArrayBuffer(data: any) {
    const defer = $q.defer<Uint8Array>()
    const objStr = JSON.stringify(data)
    const blob = new Blob([objStr], { type: 'application/json' })
    const reader = new FileReader()
    reader.readAsArrayBuffer(blob)
    reader.onload = () => {
      const result = reader.result as ArrayBuffer
      // 将 ArrayBuffer 转换成Blob
      const buf = new Uint8Array(result)
      defer.resolve(buf)
    }
    reader.onerror = e => {
      console.error('Error', e)
      defer.reject(e)
    }
    return defer.promise
  }

  arrayBuffer2data(arrayBuffer: Uint8Array) {
    const defer = $q.defer()
    const array = new Uint8Array(arrayBuffer)
    const blob = new Blob([array], { type: 'application/json' })
    // 将 Blob对象 读成字符串
    const reader = new FileReader()
    reader.readAsText(blob)
    reader.onload = () => {
      const result = reader.result as string
      const obj = $utils.isJsonString(result) ? JSON.parse(result) : result
      defer.resolve(obj)
    }
    reader.onerror = e => {
      console.error('Error', e)
      defer.reject(e)
    }
    return defer.promise
  }

  /**
   *
   * 根据 indexKeyValue 更新数据表中的数据
   * @param {string}    storeName       数据表
   * @param {string}    indexKeyValue   主键值
   * @param {any}       data            数据
   */
  async putItem(storeName: string, indexKeyValue: string, data: any) {
    const _readStore = this.storeList.find(ele => ele.storeName === storeName)
    if (!_readStore) {
      throw new Error(`不存在数据表:${storeName}！`)
    }
    if (!indexKeyValue) {
      throw new Error('indexKeyValue must be not a null')
    }
    const dataItem: IndexedDBDataItemDO = { Key: indexKeyValue, CreatedTime: $utils.dateConvert(new Date()), Data: data }
    const dataItemArrayBuffer: IndexedDBDataItemDO = {
      Key: dataItem.Key,
      CreatedTime: dataItem.CreatedTime,
      Data: await this.data2ArrayBuffer(dataItem.Data)
    }
    // await this.data2ArrayBuffer(dataItem.Data)
    // data = { key: '123', name: '张三', age: 24, email: 'zhangsan@example.com', time: $utils.dateConvert(new Date()) }
    // data.CreatedTime = $utils.dateConvert(new Date())
    const defer = $q.defer()
    const request = this.DB.transaction([storeName], 'readwrite')
      .objectStore(storeName)
      .put(dataItemArrayBuffer)

    request.onsuccess = () => {
      console.log('数据写入成功')
      defer.resolve(dataItem)
    }

    request.onerror = event => {
      console.log('数据写入失败')
      defer.reject(event)
    }
    return defer.promise
  }
  /**
   * 读取 storeName 表中 key 为 indexKeyValue 的数据
   * 目前只能通过主键查询
   * @param { string } storeName        数据表
   * @param { string } indexKeyValue    主键值
   */
  readItem(storeName: string, indexKeyValue: string) {
    const defer = $q.defer()
    const _readStore = this.storeList.find(ele => ele.storeName === storeName)
    if (!_readStore) {
      throw new Error(`不存在数据表:${storeName}！`)
    }
    const transaction = this.DB.transaction([storeName], 'readonly')
    const objectStore = transaction.objectStore(storeName)
    const index = objectStore.index(_readStore.keyPath)
    const request = index.get(indexKeyValue)

    request.onerror = event => {
      console.error('读取数据失败')
      defer.reject(event)
    }

    request.onsuccess = async event => {
      console.log('读取数据成功')
      const result: IndexedDBDataItemDO = request.result
      if (result) {
        const isExpire = $utils.dateCompare(new Date(), new Date(result.CreatedTime), _readStore.expiresUnit) >= _readStore.expiresTime
        if (!isExpire) {
          result.Data = await this.arrayBuffer2data(result.Data)
          // console.log('name: ' + storeName)
          // console.log('key: ' + result.Key)
          // console.log('time: ' + result.CreatedTime)
          defer.resolve(result.Data)
        } else {
          console.log('数据过期')
          defer.reject(event)
        }
      } else {
        console.log('未获得数据记录')
        defer.reject(event)
      }
    }
    return defer.promise
  }
  /**
   * 删除 storeName 表中 key 为 indexKeyValue 的数据
   * @param { string } storeName        数据表
   * @param { string } indexKeyValue    索引值，即 IndexedDBDataItemDO.key 的值
   */
  //   removeItem(storeName: string, indexKeyValue: string) {
  //     let request = this.DB.transaction([storeName], 'readwrite')
  //       .objectStore(storeName)
  //       .delete(1)

  //     request.onsuccess = function(event) {
  //       console.log('数据删除成功')
  //     }
  //   }
}
