/*
 * @Author: jiapeng.Zheng
 * @Date: 2018-04-24 14:06:51
 * @Last Modified by:   jiapeng.Zheng
 * @Last Modified time: 2018-04-24 14:06:51
 * @description: mqtt配置api
 */
// import $ajax from '@helper/ajax'
// import $utils from '@helper/utils'

// let serverUrl = $utils.serverUrl
import { SYS_CONFIG } from '@constants/index'
export default {
  config() {
    // 模拟通过 http 异步获取 mqtt 配置
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(SYS_CONFIG.EnvConfig['mqtt'])
      }, 1000)
    })
  }
}
