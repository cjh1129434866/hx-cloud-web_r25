/*
 * @Author: jiapeng.Zheng
 * @Date: 2018-09-13 15:09:13
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-31 17:05:01
 * @Description:
 */
import md5 from 'md5'
import axios from 'axios'
import $q from 'q'
import qs from 'qs'
import { $utils } from '@helper'
import IndexedDB from '@helper/indexedDB'
import { INDEXEDDB_CONFIG } from '@constants/index'

// ========================================== 使用 IndexedDB 緩存接口返回的数据 ==========================================

const indexedDb = new IndexedDB(INDEXEDDB_CONFIG.databaseName, INDEXEDDB_CONFIG.version)
// api缓存表，用来存储开启api缓存的api接口的数据
const cacheStore = { storeName: 'webApi', keyPath: 'Key', expiresTime: 1, expiresUnit: 'd' }
// expires表，存储数据库上一次清空数据表的时间，用来判断数据库中的数据是否过期，过期这清空当前库中所有表的数据
const expiresStore = {
  storeName: 'expires',
  keyPath: 'Key',
  expiresTime: INDEXEDDB_CONFIG.expiresTime,
  expiresUnit: INDEXEDDB_CONFIG.expiresUnit
}
let isOpen = false
// 同步初始化 indexedDb ，确保 RequestCacheDecorator 中 indexedDb 是打开的
;(async () => {
  try {
    await indexedDb.initStores([cacheStore, expiresStore].concat(INDEXEDDB_CONFIG.storesList))
    try {
      // 读取 expiresStore 表中的 time
      await indexedDb.readItem(expiresStore.storeName, 'time')
    } catch (error) {
      // 若读取不到 expiresStore 的数据time（即数据过期Or不存在），清空 cacheStore 表的数据
      indexedDb.clearStore(cacheStore.storeName)
      // 清空 INDEXEDDB_CONFIG.storesList 中的数据
      INDEXEDDB_CONFIG.storesList.forEach(ele => {
        indexedDb.clearStore(ele.storeName)
      })
      // 保存当前数据库的创建时间
      await indexedDb.putItem(expiresStore.storeName, 'time', '')
    }
    isOpen = true
  } catch (error) {
    isOpen = false
    console.error(error)
  }
})()
/**
 * api请求缓存修饰器
 * @param {Promise} wrapped     api请求函数
 * @param {boolean} enableCache 是否开启缓存功能
 */
function RequestCacheDecorator(wrapped, enableCache = false) {
  return function() {
    /* eslint-disable prefer-rest-params */
    const defer = $q.defer()

    if (enableCache && isOpen) {
      const [arg0] = arguments
      // arg0.params.token = '' // 清空参数中的 token，后期 token 每次登陆时都不一致，会导致缓存失效
      // 对api的请求参数进行MD5加密，用作缓存的key
      const cacheKey = md5(JSON.stringify(arg0))
      // 读取缓存中的数据
      indexedDb
        .readItem(cacheStore.storeName, cacheKey)
        .then(cacheValue => {
          defer.resolve(cacheValue)
        })
        .catch(() => {
          // 缓存中没有数据Or数据过期，直接调用api
          wrapped
            .apply(this, arguments)
            .then(res => {
              // 保存、更新数据
              indexedDb.putItem(cacheStore.storeName, cacheKey, res)
              defer.resolve(res)
            })
            .catch(err => {
              defer.reject(err)
            })
        })
    } else {
      // 不使用缓存，则直接调用api
      wrapped
        .apply(this, arguments)
        .then(res => {
          defer.resolve(res)
        })
        .catch(err => {
          defer.reject(err)
        })
    }
    return defer.promise
  }
}

// ========================================== 使用 axios 的 CancelToken 和 interceptors 取消重复的请求 ==========================================
const ERROR_CODE_ABORT = 'abort'

const pending = [] // 声明一个数组用于存储每个ajax请求的取消函数和ajax标识
const CancelToken = axios.CancelToken
const removePending = ever => {
  for (const p in pending) {
    if (pending[p].id === ever.url) {
      // 判断是否开启了允许取消重复请求
      if (ever._couldCancelRepeatRequest === true) {
        // 当当前请求在数组中存在时执行函数体
        pending[p].cancel({ code: ERROR_CODE_ABORT, msg: '取消:' + pending[p].url }) // 执行取消操作
      }
      pending.splice(p, 1) // 把这条记录从数组中移除
    }
  }
}
//保存token在header里面
/* axios.interceptors.request.use(config => {
  if(token) {
    config.headers.Authorization = token;
  }
  return config
},error => {
  return Promise.reject(error)
}) */



// http request 拦截器
axios.interceptors.request.use(
  requestConfig => {
    removePending(requestConfig) // 在一个ajax发送前执行一下取消操作
    requestConfig.cancelToken = new CancelToken(c => {
      // 这里的ajax标识我是用请求地址&请求方式拼接的字符串，当然你可以选择其他的一些方式
      pending.push({ id: requestConfig.url, url: requestConfig.url, cancel: c })
    })
  const token =   $utils.getCookie('token')
    if(token){
      requestConfig.headers.Authorization = "Bearer " + token
    }
    return requestConfig
  },
  error => {
    return Promise.reject(error)
  }
)
// http response 拦截器
axios.interceptors.response.use(
  response => {
    removePending(response.config) // 在一个ajax响应后再执行一下取消操作，把已经完成的请求从 pending 中移除
    return response
  },
  error => {
    return Promise.reject(error)
  }
)

// ==========================

/**
 * 另起窗口下载文件
 * @param {string} url  文件地址
 */
function redirectToIframe(url) {
  const iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  iframe.src = url
  iframe.onload = function() {
    document.body.removeChild(iframe)
  }
  document.body.appendChild(iframe)
}

/**
 * 萤石云摄像头api请求方法
 * @param {Object} params 请求参数
 */
function eZUIPlayerRequestHandle(params) {
  const defer = $q.defer()
  axios(params)
    .then(res => {
      if (res && (res.unauthorized || res.statusCode === 401)) {
        window.location.href = '/login'
      }
      if (res.data) {
        if (res.data.code === '200') {
          defer.resolve(res.data.data)
        } else {
          defer.reject(res.data.msg)
        }
      } else {
        defer.reject('数据格式有误')
      }
    })
    .catch(err => {
      defer.reject(err.message)
    })

  return defer.promise
}
/**
 * api请求函数
 * @param {Object} requestConfig  axios 请求时的配置
 * @param {Object} op      预留的配置,与 axios 无关
 */
function requestHandle(requestConfig) {
  const defer = $q.defer()
  // https://www.npmjs.com/package/axios#request-config
  requestConfig.paramsSerializer = params => {
    return qs.stringify(params, { indices: false })
  }

  axios(requestConfig)
    .then(res => {
      if (res && (res.unauthorized || res.statusCode === 401)) {
        window.location.href = '/login'
      }
      if (res.type === 'application/x-msdownload') {
        redirectToIframe(res.request.responseURL)
      } else if (Object.prototype.toString.call(res.data) === '[object ArrayBuffer]' || Object.prototype.toString.call(res.data) === '[object Array]') {
        defer.resolve(res.data)
      } else if (res.data) {
        if (res.data.success) {
          defer.resolve(res.data)
        } else {
          defer.reject(res.data.message || 'data.Message is null or undefined')
        }
      } else {
        defer.reject('数据格式有误')
      }
    })
    .catch(err => {
      // 不抛出取消接口请求时的错误信息
      if (err && err.message && err.message.code === ERROR_CODE_ABORT) {
        console.warn(err.message.msg)
      } else {
        defer.reject(err)
      }
    })

  return defer.promise
}

export default {
  post: function(url, params, op) {
    return requestHandle(
      {
        method: 'post',
        url: url,
        data: params
      },
      op
    )
  },
  put: function(url, params, op) {
    return requestHandle(
      {
        method: 'put',
        url: url,
        data: params
      },
      op
    )
  },
  delete: function(url, params, op) {
    return requestHandle(
      {
        method: 'delete',
        url: url,
        data: params
      },
      op
    )
  },
  /**
   * get方法
   * @param { string } url                  接口地址
   * @param { object } params               携带参数
   * @param {{ enableCache: false , couldCancelRepeatRequest: false}} op   预留的配置，目前支持是否开启接口缓存功能(enableCache)，能否取消重复请求(couldCancelRepeatRequest)
   */
  get: function(url, params, op = { enableCache: false, couldCancelRepeatRequest: false }) {
    // 对api请求函数 requestHandle 进行修饰，使其具有缓存功能
    const requestCacheHandle = RequestCacheDecorator(requestHandle, op.enableCache)
    // 只对 get 方法开放缓存功能
    return requestCacheHandle(
      {
        method: 'get',
        url: url, // $utils.queryString(url, params),
        params: params,
        _couldCancelRepeatRequest: op.couldCancelRepeatRequest
      },
      op
    )
  },
  /**
   * 从服务器获取文件
   * @param {string} url  文件地址
   * @param {Object} config     axios 配置，可添加 onDownloadProgress 下载进度等方法
   */
  getArrayBuffer: function(url, config) {
    return requestHandle({
      method: 'get',
      responseType: 'arraybuffer',
      url: url,
      ...config
    })
  },
  uploadFile(url, params) {
    return requestHandle({
      method: 'post',
      url: url,
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      data: params
    })
  },
  eZUIPlayerGet: function(url, params) {
    return eZUIPlayerRequestHandle({
      method: 'get',
      url: $utils.queryString(url, params)
    })
  },
  eZUIPlayerPost: function(url, params) {
    return eZUIPlayerRequestHandle({
      method: 'post',
      // withCredentials: false, // 请求不携带cookie
      url: url,
      data: params,
      transformRequest: [
        function(data) {
          let ret = ''
          for (const it in data) {
            ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
          }
          return ret
        }
      ],
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
  }
}
