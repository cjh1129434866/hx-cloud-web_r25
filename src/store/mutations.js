/*
 * @Author: jiapeng.Zheng
 * @Date: 2018-12-29 14:05:04
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-31 16:55:45
 * @Description:
 */
import Vue from 'vue'
import { $utils } from '@helper'
import { locales, i18n } from '@/locales'
import { SESSIONSTORAGE_USERMENU_KEY, SESSIONSTORAGE_HISTORYUTL_KEY, LOCALSTORAGE_USER_CONFIG_KEY } from '@constants/index'

export default {
  // -------------------------- user info ---------------------

  // 保存用户信息
  $vuexSetUserInfo(state, info) {
    // state.userId = info.UserId
    state.isLogin = !!info.account
    state.userInfo = {
      account: info.account,
      ...info
    }
  },
  // 实时更改用户头像
  $vuexSetUserPicture(state, picture) {
    state.userInfo.picture = picture
  },
  // 设置mqtt连接状态
  $vuexSetMqttIsConnect(state, isConnect) {
    state.$mqttIsConnect = isConnect
  },
  // 保存设备的mqtt信息
  $vuexSetMqttDeviceData(state, data) {
    const cache = JSON.parse(JSON.stringify(state.$mqtt_device_data))
    if (cache[data.uuid]) {
      for (const i in data) {
        if (typeof data[i] === 'string') {
          cache[data.uuid][i] = data[i]
        } else if (i === 'error') {
          cache[data.uuid][i] = null // Object.assign({}, cache[data.uuid][i], {}) // 不更新错误信息
        } else {
          cache[data.uuid][i] = Object.assign({}, cache[data.uuid][i], data[i])
        }
      }
    } else {
      data['error'] = null // 不添加错误信息
      cache[data.uuid] = Object.assign({}, cache[data.uuid], data)
    }
    state.$mqtt_device_data = cache
  },
  // 保存设备的错误信息
  $vuexSetDeviceError(state, data) {
    const cache = JSON.parse(JSON.stringify(state.$mqtt_error_data))
    // 遍历有错误信息的设备,为设备添加或更新报警信息
    for (const uuid in data) {
      if (cache[uuid]) {
        cache[uuid]['error'] = data[uuid]['error']
      } else {
        cache[uuid] = Object.assign({}, cache[uuid], data[uuid])
      }
    }
    // 遍历所有的设备，清空上一次保存的错误信息
    for (const uuid in cache) {
      if (!data[uuid]) {
        cache[uuid]['error'] = null
      }
    }

    state.$mqtt_error_data = cache
  },
  // 保存用户组织信息
  $vuexSetUserGroup(state, group) {
    state.$userGroup = group
  },
  // 实时更改组织logo
  $vuexSetUserGroupLogo(state, logo) {
    state.$userGroup.Logo = logo
  },

  // -------------------------- menu ---------------------

  // 保存用户的菜单
  $vueSetUserMenu(state, menu) {
    state.$userMenu = menu
    // 保存用户的菜单到sessionStorage，防止用户强制刷新时菜单丢失
    $utils.setSessionStorage(SESSIONSTORAGE_USERMENU_KEY, menu)
  },

  // 保存当前激活的菜单
  $vuexSetActiveMenu(state, $activeMenu) {
    // 实时改变document.title
    document.title = `${$activeMenu.title[i18n.locale]}_${locales[i18n.locale]['projectTitle']}`
    state.$activeMenu = $activeMenu
  },

  // 记录访问过的路由
  $vuexAddHistoryPath(state, $historyPath) {
    Vue.set(state.$historyPath, $historyPath.path, $historyPath)
    $utils.setSessionStorage(SESSIONSTORAGE_HISTORYUTL_KEY, state.$historyPath)
  },

  // 保存用户配置
  $vuexSetUserConfig(state, $userConfig) {
    state.$userConfig = $userConfig
    const USER_CONFIG = $utils.getLocalStorage(LOCALSTORAGE_USER_CONFIG_KEY) || {}
    if (state.userInfo && state.userInfo.Account) {
      USER_CONFIG[state.userInfo.Account] = $userConfig
      $utils.setLocalStorage(LOCALSTORAGE_USER_CONFIG_KEY, USER_CONFIG)
    }
  },

  // 更新路由信息
  $vuexSetHistoryPath(state, $historyPath) {
    state.$historyPath = $historyPath
  },

  // 更新左侧导航的状态
  $vuexSetSideNavStatus(state, $sideNavStatus) {
    state.$sideNavStatus = $sideNavStatus
  },
  // -------------------------------- $commonParam -----------------------------------------
  $vuexSetDeviceType(state, deviceType = []) {
    const deviceTypeNameDict = {}
    const deviceTypeDict = {}
    deviceType.forEach(item => {
      deviceTypeNameDict[item.Id] = item.DeviceTypeName
      deviceTypeDict[item.Id] = item
    })
    const deviceTypeFormat = $utils.treeDataFormat({
      data: deviceType,
      idName: 'Id',
      parentIdName: 'ParentId',
      parentNodeflag: null
    })
    state.$commonParam.deviceType = deviceType
    state.$commonParam.deviceTypeNameDict = deviceTypeNameDict
    state.$commonParam.deviceTypeDict = deviceTypeDict
    state.$commonParam.deviceTypeFormat = deviceTypeFormat
  },
  $vuexSetWarnType(state, warnType = []) {
    const warnTypeDict = {}
    warnType.forEach(item => {
      warnTypeDict[item.Id] = item
    })
    state.$commonParam.warnTypes = warnType
    state.$commonParam.warnTypeDict = warnTypeDict
  },
  $vuexSetNowPosition(state, info) {
    state.$commonParam.nowPosition = info
  },
  $vuexGetUserInfo(state, info) {
    if (!info || state.userInfo.username !== info.username) {
      return
    }

    if (!state.isLogin) {
      return
    }

    state.userInfo = { ...info }
  }
}
