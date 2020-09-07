/*
 * @Author       : jiapeng.Zheng
 * @Date         : 2020-04-02 16:45:52
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-04-10 09:48:31
 * @Description  :
 */

type DeviceConfigState = {
  isChange: boolean
}

const state: DeviceConfigState = {
  isChange: false
}

const getters = {}

// mutations
const mutations = {
  // 同步设置面板列表
  setIsChange(state: DeviceConfigState, isChange: boolean) {
    state.isChange = isChange
  }
}

// actions
const actions = {}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
