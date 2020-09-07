/*
 * @Author: jiapeng.Zheng
 * @Date: 2018-04-24 14:02:12
 * @Last Modified by: jiapeng.Zheng
 * @Last Modified time: 2019-03-25 14:22:42
 * @description: 地图api
 */
// import Vue from 'vue'
// import $q from 'q'
import $ajax from '@helper/ajax'
import $utils from '@helper/utils'
import store from '@store'
import { EARTH_RADIUS } from '@constants/index'

const serverUrl = $utils.serverUrl
// let geocoder
// AMap.service('AMap.Geocoder', function() {
//   // 回调函数 : 实例化Geocoder
//   geocoder = new AMap.Geocoder()
// })

export default {
  /**
   * 获取设备地图
   * @param {string} deviceSn 设备序列号
   */
  getDeviceMap(deviceSn) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, deviceSn }
    return $ajax.get(serverUrl('DeviceMap/GetDeviceMap'), data)
  },
  /**
   * 计算经纬度为position的设备与当前位置的距离
   * @param {string} position 要计算的经纬度
   */
  async calcAmpDist(position) {
    let distance = null
    try {
      // 获取当前位置的经纬度
      const nowPosition = await store.dispatch('getNowPosition')
      if (nowPosition) {
        const { lng, lat } = nowPosition.position
        const lnglat = position.split(',')
        if (lng !== '' && lat !== '' && lnglat[0] !== '' && lnglat[1] !== '') {
          const radParam = Math.PI / 180.0
          const radLat1 = lnglat[1] * radParam
          const radLat2 = lat * radParam
          const a = radLat1 - radLat2
          const b = (lnglat[0] - lng) * radParam
          distance = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)))
          distance = (Math.round(distance * EARTH_RADIUS * 10000) / 10000) * 1000
        }
      }
    } catch (error) {
      console.error(error)
    }

    return { distance: distance, distanceStr: distance ? `${(distance / 1000).toFixed(2)}km` : '定位失败' }
  }
}
