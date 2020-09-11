/*
 * @Author: jiapeng.Zheng
 * @Date: 2018-12-26 09:52:16
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-04-15 14:02:32
 * @Description:
 */
import { $apis, $utils } from '@helper'
import $q from 'q'
import _ from '@helper/lodash.js'
import { IMAGE_URL, SESSIONSTORAGE_USERMENU_KEY, SESSIONSTORAGE_ISFIRST_KEY, SESSIONSTORAGE_HISTORYUTL_KEY, LOCALSTORAGE_USER_CONFIG_KEY } from '@constants/index'
// import MenuConfig from '@constants/menuConfig'

export default {
  async getUserInfo({ commit /** state */ }) {
    const res = await $apis.user.getUser()
    res.data.picture = res.data.picture ? IMAGE_URL + '/' + res.data.picture + `?_=${_.random(0, 99999)}` : null
    commit('$vuexSetUserInfo', res.data)
    return res.data
  },
  async getUserMenu({ commit /** state, getters  */ }) {
    // ！！！不延时的话，beforeEachHooks.js中的checkLoginAuth会无限次执行???
    // setTimeout(async () => {}, 0)

    // 从getSessionStorage获取用户菜单，防止多次请求,也是为了确保能够获取已经动态添加了的子菜单
    let $userMenu = $utils.getSessionStorage(SESSIONSTORAGE_USERMENU_KEY)
    $utils.setSessionStorage(SESSIONSTORAGE_ISFIRST_KEY, false)
    if (!$userMenu) {
      $utils.setSessionStorage(SESSIONSTORAGE_ISFIRST_KEY, true) // 第一次加载
      // const res = await $apis.sysMenu.getTopLevelMenu()
      $userMenu = []
    }
    commit('$vueSetUserMenu', $userMenu)
    return $userMenu
  },

  async getUserGroup({ commit, state /** state, getters */ }) {
    const res = await $apis.group.findByToken(state.userInfo.groupId)
    res.data.logo = res.data.logo ? IMAGE_URL + res.data.logo + `?_=${_.random(0, 99999)}` : null
    commit('$vuexSetUserGroup', res.data)
    return res.data
  },

  getHistoryPath({ /** dispatch */ commit /** state */ }) {
    const $historyPath = $utils.getSessionStorage(SESSIONSTORAGE_HISTORYUTL_KEY)
    if ($historyPath) {
      commit('$vuexSetHistoryPath', $historyPath)
    }
    return $historyPath
  },

  getUserConfig({ /** dispatch */ commit, state }) {
    const $userConfig = $utils.getLocalStorage(LOCALSTORAGE_USER_CONFIG_KEY)
    if ($userConfig && state.userInfo && $userConfig[state.userInfo.Account]) {
      commit('$vuexSetUserConfig', $userConfig[state.userInfo.Account])
    }
  },

  async getUser({ dispatch /** commit, state */ }) {
    const userInfo = await dispatch('getUserInfo')
    const $userMenu = await dispatch('getUserMenu')
    const $historyPath = await dispatch('getHistoryPath')
    dispatch('getUserConfig')
    Promise.all([dispatch('getUserGroup')]).catch(error => {
      console.error(error)
    })

    return { userInfo, $userMenu, $historyPath }
  },

  async getDeviceType({ commit /** state, getters */ }) {
    // 统计类型
    const types = await $apis.deviceType.getDeviceType()
    // 统计配置
    /* const typeStats = await $apis.deviceType.getGroupStatisticsList()
    // 将统计配置信息添加大到统计类型的_typeStatObj属性中
    types.List.map(_typeObj => {
      _typeObj._StatisticsInfo = {}
      typeStats.Data.filter(_typeStatObj => {
        return _typeStatObj.TypeId === _typeObj.Id
      }).map(_typeStatObj => {
        _typeObj._StatisticsInfo[_typeStatObj.Key] = _typeStatObj
      })
    }) */

    commit('$vuexSetDeviceType', types.List)
    return types
  },

  async getWarnType({ commit /** state, getters */ }) {
    const res = await $apis.warn.getWarnTypeList()
    commit('$vuexSetWarnType', res.WarnTypes)
    return res
  },

  async getNowPosition({ commit, state /** getters */ }) {
    const defer = $q.defer()
    if (state.$commonParam.nowPosition === null) {
      AMap.plugin('AMap.Geolocation', function() {
        const geolocation = new AMap.Geolocation({
          timeout: 3000 // 超时时间 3000ms
          // GeoLocationFirst: true
          // noIpLocate: 3 // 禁止使用IP定位，目前web端使用IP定位会出现 CORB 报警
        })
        geolocation.getCurrentPosition((status, result) => {
          if (status === 'complete') {
            commit('$vuexSetNowPosition', result)
            defer.resolve(result)
          } else {
            defer.reject(result.message)
          }
        })
        // geolocation.getCityInfo((status, result) => {
        //   if (status === 'complete') {
        //     commit('$vuexSetNowPosition', { position: { lng: result.center[0], lat: result.center[1] } })
        //     defer.resolve({ position: { lng: result.center[0], lat: result.center[1] } })
        //   } else {
        //     // commit('$vuexSetNowPosition', { position: { lng: '', lat: '' } })
        //     defer.reject(result.message)
        //   }
        // })
      })
    } else {
      defer.resolve(state.$commonParam.nowPosition)
    }
    return defer.promise
  },

  async getCommnParam({ dispatch /** commit, state */ }) {
    await dispatch('getDeviceType')
    await dispatch('getWarnType')
    dispatch('getNowPosition')
      .then(() => {
        // console.log(e)
      })
      .catch(err => {
        console.error(err)
      })
  }
}
