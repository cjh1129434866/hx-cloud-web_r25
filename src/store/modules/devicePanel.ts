/*
 * @Author       : jiapeng.Zheng
 * @Date         : 2020-04-02 16:45:52
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-04-03 11:03:29
 * @Description  :
 */

import PanelApi from '@helper/apis/panel.js'
import { PANEL_CONFIG } from '@constants/panelConfig'

type DevicePanelState = {
  panelList: DevicePanelVO[]
}

const state: DevicePanelState = {
  panelList: []
}

const getters = {
  // 将 panelList 转换化为 JSON 格式，并未每个面板添加 componentName 属性（面板的前端组件名称）
  panelObjs(state: DevicePanelState) {
    const panelObjs: DevicePanelJson = {}
    state.panelList.forEach(ele => {
      panelObjs[ele.TypeId] = {
        ...ele,
        componentName: PANEL_CONFIG[ele.TypeId].component
      }
    })
    return panelObjs
  },
  // 获取当前设备面板类型ID = typeId的面板信息
  getPanelObj: (state: DevicePanelState, getters) => (typeId: number): DevicePanelBO | null => {
    return getters.panelObjs[typeId] || null
  },
  // 获取当前设备面板类型ID = typeId的面板ID
  getPanelId: (state: DevicePanelState, getters) => (typeId: number) => {
    let panelId: number | null = null
    const activePanel: DevicePanelBO | null = getters.getPanelObj(typeId)
    if (activePanel) {
      panelId = activePanel.Id
    }
    return panelId
  }
}

// mutations
const mutations = {
  // 同步设置面板列表
  setPanelList(state: DevicePanelState, { panelList }) {
    state.panelList = panelList
  },
  // 手动往面板列表中添加用户新增的面板（为了不重新调用getPanel方法更新panelList）
  addPanel(state: DevicePanelState, panel: DevicePanelVO) {
    if (state.panelList.findIndex(ele => ele.TypeId === panel.TypeId) === -1) {
      state.panelList.push(panel)
    }
  }
}

// actions
const actions = {
  // 通过设备编码 deviceSn 异步获取拥有的面板
  async getPanel({ commit }, deviceSn: string) {
    try {
      const panelList = await PanelApi.getDevicePanels(deviceSn)
      commit('setPanelList', { panelList: panelList.list })
    } catch (error) {
      console.error('[Store Actions "setPanelList" Error]', error)
      commit('setPanelList', { panelList: [] })
    }
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
