/*
 * @Author: jiapeng.Zheng
 * @Date: 2019-06-26 14:29:25
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-04-10 09:34:49
 * @Description:
 */
import Vue from 'vue'
import Vuex from 'vuex'
import actions from '@store/actions'
import getters from '@store/getters'
import mutations from '@store/mutations'
import createLogger from 'vuex/dist/logger'
// import createPersistedState from 'vuex-persistedstate'

import devicePanel from './modules/devicePanel'
import deviceConfig from './modules/deviceConfig'

Vue.use(Vuex)

const state = {
  $mqttIsConnect: false, // mqtt 是否已经连接
  $mqtt_device_data: {}, // 设备通过mqtt发送的数据
  $mqtt_error_data: {}, // 设备通过mqtt发送的报警数据
  $isMobile: /Mobile/i.test(navigator.userAgent),
  isLogin: true, // 用户是否已经登录
  // userId: '', // 用户Id
  userInfo: {}, // 用户信息
  $userGroup: {}, // 用户组织信息
  $userMenu: [], // 用户菜单信息
  $userConfig: {}, // 用户配置信息（保存于浏览器的信息）
  $commonParam: {
    deviceType: [],
    deviceTypeFormat: [],
    deviceTypeNameDict: {},
    warnTypes: [],
    warnTypeDict: {},
    nowPosition: null
  },
  /**
   *  $activeMenu 为当前激活的菜单,当 $historyPath 生成的面包屑导航为空时（parentPath：为null，或重新登录），使用 $activeMenu 作为Frame.vue 的标题
   */
  $activeMenu: {},
  /**
   *  his.$store.commit('$vuexAddHistoryPath', {
   *    path: this.$route.path,
   *    parentPath: null,
   *    title: { ...$utils.titleLang(DeviceName, DeviceName) }
   *  })
   */
  $historyPath: {}, // 历史访问的菜单，用于生成面包屑导航，作为Frame.vue 的标题
  $sideNavStatus: '' // 左侧导航的状态：'sidenav-open':展开, 'sidenav-close'：关闭
}

const debug = process.env.NODE_ENV !== 'production'

// const persitedState = createPersistedState({
//   key: STORAGE_KEY
// })

export default new Vuex.Store({
  modules: {
    devicePanel,
    deviceConfig
  },
  state,
  actions,
  getters,
  mutations,
  strict: debug,
  plugins: debug ? [createLogger()] : []
  // plugins: debug ? [createLogger(), persitedState] : [persitedState]
})
