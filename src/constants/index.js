/*
 * @Author: jiapeng.Zheng
 * @Date: 2019-06-26 14:29:25
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-05-22 11:45:38
 * @Description: 系统配置
 */

import sysConfig from '../../config/index'

// let sysEnv = process.env.NODE_ENV === 'production' ? 'build' : 'dev'

export const SYS_CONFIG = sysConfig

// Vuex Storage Key
export const STORAGE_KEY = 'vuex-storage'

// export const SESSIONSTORAGE_USERINFO_KEY = 'userInfo'

// 用户菜单的 sessionStorag 的 key
export const SESSIONSTORAGE_USERMENU_KEY = 'userMenus'
// 是否首次加载的 sessionStorag 的 key
export const SESSIONSTORAGE_ISFIRST_KEY = 'storeIsFirst'
// 路由的历史信息的 sessionStorag 的 key
export const SESSIONSTORAGE_HISTORYUTL_KEY = 'historyUrl'
// 设备类型布局的 localStorage 的 key
export const LOCALSTORAGE_DEVICEPANELLAYOUT_KEY = 'DevicePanelLayout'
// 首页布局的 localStorage 的 key
export const LOCALSTORAGE_HOMEPANELLAYOUT_KEY = 'HomeLayout'
// 跟用户相关的配置 localStorage 的 key
export const LOCALSTORAGE_USER_CONFIG_KEY = 'USERCONFIG'

// Menuconfig
// export const MenuConfig = require('./menuConfig')

export const MQTT_TOPIC_PREFIX = 'Hexu'

// 远程api接口的url前缀
export const SERVER_URL = '/api'
// 远程摄像头api接口的url前缀
export const VIDEO_API_URL = '/videoapi'

// 远程api接口IP(用户logo、头像、升级文件)
export const IMAGE_URL = location.origin // 'http://www.hexucloud.com:18003' // location.origin // 'http://192.168.40.206:8003' // 'http://www.hexucloud.com:18003'

// 摄像头服务器配置
export const VIDEO_CONFIG = {
  appKey: '3e5c83343a394cfda2e27b14d1d7a1ba', // '01b799eaac914aed979f7f49c00f9095',
  appSecret: '8ab57e31fe7a97714c3385fd779650da' // '8508cb4ebd4b52c0ae6aac1608fcfe18'
}

// 带查询时间范围的接口，其时间范围不允许超过3个月
export const SEARCH_DATE_RANGE = 1000 * 60 * 60 * 24 * 30 * 3 // 单位：毫秒
/**
 * 设备状态有效时间,超过4分钟则说明设备不在线,单位：毫秒
 */
export const DECIVE_ONLINE_TIME = 7 * 60 * 1000
// 主题回复时间，主动获取设备数据时，若10秒内未回复则说明设备离线
export const DECIVE_RECOVERY_TIME = 10 * 1000 // 单位：毫秒
// 主题升级回复时间，主动下发设备数据时，若 30 秒内未回复则说明设备接收不到当前数据包，需重发
export const DECIVE_UPGRADE_TIME = 30 * 1000 // 单位：毫秒

// 设备默认的位置
export const DEFAULT_POSITION = '113.8865,22.609985'
export const DEFAULT_ADDRESS = '深圳市宝安区桃花源科技创新园'
export const EARTH_RADIUS = 6378.137 // 地球赤道半径

// js-cookie 配置 https://github.com/js-cookie/js-cookie
export const COOKIE_COONFIG = {
  // 若要设置时间少于1天 https://github.com/js-cookie/js-cookie/wiki/Frequently-Asked-Questions#expire-cookies-in-less-than-a-day
  expires: 1, // 存活时间，单位天;(12小时 = 0.5, 30分钟 = 1/48)
  path: '/',
  sameSite: 'lax' // http://www.ruanyifeng.com/blog/2019/09/cookie-samesite.html
}
// indexDB 配置
export const INDEXEDDB_CONFIG = {
  databaseName: 'HxCache', // 数据库名称
  version: 1, // 数据库版本，数据库版本变更只能增加不能减少
  // 数据库表
  storesList: [
    // {
    //   storeName: 'person', // 表名称
    //   keyPath: 'Key', // 主键
    //   // 索引
    //   storeIndexList: [
    //     // 创建索引：https://developer.mozilla.org/zh-CN/docs/Web/API/IDBObjectStore#createIndex()
    //     // { name: 'key', keyPath:'key', options: { unique: true } }, // person 表中的 key 字段(name)建立key索引(keyPath)，unique 表示不可重复
    //   ],
    //   expiresTime: 1, // 数据表中数据的有效时间,
    //   expiresUnit: 'd' // 数据表中数据的有效时间的单位，默认：天(d)，可取： "d" | "y" | "M" | "w" | "h" | "m" | "s" | "ms"
    // }
  ],
  expiresTime: 1, // 数据库有效时间,超过该时间，会清空 storesList 表中的数据
  expiresUnit: 'd' // 数据库有效时间的单位，默认：天(d)，可取： "d" | "y" | "M" | "w" | "h" | "m" | "s" | "ms"
}

// 上传配置
export const UPLOAD_CONFIG = {
  url: '', // 测试用的文件上传路径 https://jsonplaceholder.typicode.com/posts/
  // 设备类型升级文件
  deviceTypeUpgradeFileCof: {
    url: IMAGE_URL + '/api/TypeUpdateFile/TypeUpdateFileAdd',
    size: 3, // 设备升级文件大小, 单位MB
    unit: 'M',
    type: 'application/octet-stream' // 升级文件类型
  },
  // 设备现场图片
  deviceImageCof: {
    url: IMAGE_URL + '/api/DeviceImage/DeviceImageUpload',
    size: 5, // 设备图片大小, 单位MB
    unit: 'M',
    fixedNumber: [4, 3], // vue-cropper 的 fixedNumber
    type: 'image/png;image/jpeg;image/bmp' // 图片类型
  },
  // 设备类型图片
  deviceTypeImageCof: {
    url: IMAGE_URL + '/api/TypeImages/TypeImagesAdd',
    size: 5, // 设备类型图片大小, 单位MB
    unit: 'M',
    fixedNumber: [1, 1], // vue-cropper 的 fixedNumber
    type: 'image/png;image/jpeg;image/bmp' // 图片类型
  },
  // 项目图片
  projectImageCof: {
    url: IMAGE_URL + '/api/ProjectImage/ProjectImagesAdd',
    size: 5, // 项目/站场图片大小, 单位MB
    unit: 'M',
    fixedNumber: [2.5, 1], // vue-cropper 的 fixedNumber
    type: 'image/png;image/jpeg;image/bmp' // 图片类型
  },
  // 用户头像
  avatarImageCof: {
    url: IMAGE_URL + '/api/user/Picture/',
    size: 2, // 头像图片大小,单位MB
    unit: 'M',
    fixedNumber: [1, 1], // vue-cropper 的 fixedNumber
    type: 'image/png;image/jpeg;image/bmp' // 图片类型
  },
  // 组织logo
  logoImageCof: {
    url: IMAGE_URL + '/api/group/logo/',
    size: (2 / 1024) * 100, // 组织logo图片大小(200K),单位MB
    unit: 'K',
    fixedNumber: [1, 1], // vue-cropper 的 fixedNumber
    type: 'image/png', // 图片类型
    method: 'put'
  },
  // 移动端apk
  appFileCof: {
    url: IMAGE_URL + '/api/AppVersion/AddVersion',
    size: 100, // 设备升级文件大小, 单位MB
    unit: 'M',
    type: 'application/vnd.android.package-archive' // 升级文件类型
  }
}

// apk服务器
export const APK_SERVER_CONFIG = {
  qrCodeUrl: 'http://192.168.100.3:8082/apk/qrCode'
}
