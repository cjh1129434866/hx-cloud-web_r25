// 面板配置
export const DEVICE_MAP_PANEL = 'deviceMap'
export const DEVICE_BASEINFO_PANEL = 'deviceBaseInfo'
export const DEVICE_ERROR_PANEL = 'deviceError'
export const DEVICE_CONFIG_PANEL = 'deviceConfig'
export const DEVICE_IMAGE_PANEL = 5
export const DEVICE_PARAM_PANEL = 4
export const DEVICE_VIDEO_PANEL = 6
export const DEVICE_CONTROLDATA_PANEL = 7
export const DEVICE_DATADEFINE_PANEL = 2
export const PANEL_CONFIG = {
  [DEVICE_MAP_PANEL]: {
    sort: 1,
    icon: 'panel/maps',
    component: 'deviceMap',
    layout: { i: 'deviceMap', w: 6, h: 21, x: 0, y: 0 },
    hasPanelTpl: false
  },
  [DEVICE_IMAGE_PANEL]: {
    sort: 2,
    icon: 'panel/image',
    component: 'deviceImage',
    layout: { i: 5, w: 6, h: 21, x: 6, y: 0 },
    hasPanelTpl: false
  },
  [DEVICE_BASEINFO_PANEL]: {
    sort: 3,
    icon: 'panel/baseInfo',
    component: 'deviceBaseInfo',
    layout: { i: 'deviceBaseInfo', w: 12, h: 15, x: 0, y: 21 },
    hasPanelTpl: false
  },
  [DEVICE_PARAM_PANEL]: {
    sort: 4,
    icon: 'panel/deviceParam',
    component: 'deviceBaseData',
    layout: { i: 4, w: 6, h: 19, x: 6, y: 36 },
    hasPanelTpl: true
  },
  [DEVICE_VIDEO_PANEL]: {
    sort: 5,
    icon: 'panel/camera',
    component: 'deviceVideo',
    layout: { i: 6, w: 6, h: 19, x: 0, y: 36 },
    hasPanelTpl: false
  },
  [DEVICE_ERROR_PANEL]: {
    sort: 6,
    icon: 'notice/alert',
    component: 'deviceError',
    layout: { i: 'deviceError', w: 12, h: 20, x: 0, y: 75 },
    hasPanelTpl: false
  },
  [DEVICE_CONTROLDATA_PANEL]: {
    sort: 7,
    icon: 'panel/nintendoswitch',
    component: 'deviceControlData',
    layout: { i: 7, w: 12, h: 20, x: 0, y: 55 },
    hasPanelTpl: true
  },
  [DEVICE_CONFIG_PANEL]: {
    sort: 8,
    icon: 'panel/baseInfo',
    component: 'deviceConfig',
    layout: { i: 'deviceConfig', w: 12, h: 15, x: 0, y: 65 },
    hasPanelTpl: false
  },
  [DEVICE_DATADEFINE_PANEL]: {
    sort: 9,
    icon: 'panel/dataDefine',
    component: 'deviceDataDefine',
    layout: { i: 2, w: 12, h: 30, x: 0, y: 83 },
    hasPanelTpl: true
  }
}
