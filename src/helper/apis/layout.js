/*
 * @Author: jiapeng.Zheng
 * @Date: 2019-02-19 09:34:50
 * @Last Modified by: jiapeng.Zheng
 * @Last Modified time: 2019-02-19 11:22:01
 * @Description: 页面布局 api
 */

import $utils from '@helper/utils'
import { LOCALSTORAGE_DEVICEPANELLAYOUT_KEY, LOCALSTORAGE_HOMEPANELLAYOUT_KEY } from '@constants/index'

export default {
  /**
   * 获取设备面板布局
   * @param {string} deviceSn 设备序列号
   */
  getDevicePanelLayout(deviceSn) {
    const account = $utils.getCookie('account')
    const layoutData = $utils.getLocalStorage(LOCALSTORAGE_DEVICEPANELLAYOUT_KEY) || {}
    const userLayoutData = layoutData[account] || {}
    const data = userLayoutData[deviceSn] || {}
    return data
  },

  /**
   * 跟新设备面板布局
   * @param {string} deviceSn 设备序列号
   * @param {Object} data   布局数据
   */
  updateDevicePanelLayout(deviceSn, data) {
    const account = $utils.getCookie('account')
    const layoutData = $utils.getLocalStorage(LOCALSTORAGE_DEVICEPANELLAYOUT_KEY) || {}
    layoutData[account] = layoutData[account] || {}
    layoutData[account][deviceSn] = data
    $utils.setLocalStorage(LOCALSTORAGE_DEVICEPANELLAYOUT_KEY, layoutData)
  },
  /**
   * 获取首页布局
   */
  getHomeLayout() {
    const account = $utils.getCookie('account')
    const layoutData = $utils.getLocalStorage(LOCALSTORAGE_HOMEPANELLAYOUT_KEY) || {}
    const userLayoutData = layoutData[account] || null
    return userLayoutData
  },

  /**
   * 跟新首页布局
   * @param {string} deviceSn 设备序列号
   * @param {Object} data   布局数据
   */
  updateHomeLayout(data) {
    const account = $utils.getCookie('account')
    const layoutData = $utils.getLocalStorage(LOCALSTORAGE_HOMEPANELLAYOUT_KEY) || {}
    layoutData[account] = data
    $utils.setLocalStorage(LOCALSTORAGE_HOMEPANELLAYOUT_KEY, layoutData)
  }
}
