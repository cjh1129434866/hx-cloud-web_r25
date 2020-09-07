/*
 * @Author: jiapeng.Zheng
 * @Date: 2018-12-26 09:52:16
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-04-29 17:16:40
 * @Description: 系统字典
 */
import {
  CUM_VAL_STAT,
  REAL_VAL_STAT,
  SHUT_DOWN,
  CTRL_MODE,
  CTRL_MODE_CHECK,
  RUN_TIME_YMD,
  RUN_TIME_Y,
  RUN_TIME_M,
  RUN_TIME_D,
  DEVICE_VERSION,
  DEVICE_WARN_RESET
} from '@constants/deviceConfig'
import { TYPE_AUTO_SCHEMA, TYPE_CUSTOM_SCHEMA, TYPE_FILE_MAINSYS, TYPE_FILE_SUBSYS, TYPE_FILE_BOOTLOADER } from '@constants/deviceTypeConfig'
import {
  TYPE_REAL_STAT,
  TYPE_CUM_STAT,
  STAT_FILTER_NO,
  STAT_FILTER_MAX_MIN,
  // STAT_FILTER_OTHER,
  STAT_SHOW_LEVEL_DEVICE,
  STAT_SHOW_LEVEL_STATION,
  STAT_SHOW_LEVEL_PROJECT,
  STAT_SHOW_LEVEL_ALL
} from '@constants/statisticsConfig' // 统计配置
import { DATA_TYPE_BOOLEAN, DATA_TYPE_BOOLEAN2, DATA_TYPE_STRING, DATA_TYPE_ENUM, DATA_TYPE_MONITOR, DATA_TYPE_DATETIME, DATA_TYPE_SELECT } from '@constants/dataTypeConfig'
import { DEVICE_DATADEFINE_PANEL, DEVICE_PARAM_PANEL, DEVICE_IMAGE_PANEL, DEVICE_VIDEO_PANEL, DEVICE_CONTROLDATA_PANEL, DEVICE_MAP_PANEL } from '@constants/panelConfig'
import { NOTICE_STATE_UNSOLVED, NOTICE_STATE_SOLVED } from '@constants/noticeTypeConfig'
import { _PROJECT, _STATION } from '@constants/projectType'

export const PROJECT_TYPE_PROJECT = _PROJECT.ID
export const PROJECT_TYPE_STATION = _STATION.ID
export const REGION_TOP_CODE = '101' // 顶级的区域CODE
// 项目类型字典
export const PROJECT_TYPE_DIC = {
  [PROJECT_TYPE_STATION]: '站场',
  [PROJECT_TYPE_PROJECT]: '项目'
}
// 面板类型字典
export const PANEL_TYPE_DIC = {
  baseInfo: 'deviceBaseInfo', // 这个面板所有设备都有，不受系统控制
  [DEVICE_MAP_PANEL]: 'deviceMap', // 这个面板所有设备都有，不受系统控制
  [DEVICE_DATADEFINE_PANEL]: 'deviceDataDefine',
  [DEVICE_PARAM_PANEL]: 'deviceBaseData',
  [DEVICE_IMAGE_PANEL]: 'deviceImage',
  [DEVICE_VIDEO_PANEL]: 'deviceVideo',
  [DEVICE_CONTROLDATA_PANEL]: 'deviceControlData'
}
// 数据类型字典
export const DATA_TYPE_DIC = {
  [DATA_TYPE_BOOLEAN]: '布尔型',
  [DATA_TYPE_BOOLEAN2]: '布尔型2(已废弃)',
  [DATA_TYPE_STRING]: '字符型',
  [DATA_TYPE_ENUM]: '枚举型',
  [DATA_TYPE_MONITOR]: '监控型',
  [DATA_TYPE_DATETIME]: '日期型',
  [DATA_TYPE_SELECT]: '下拉型'
}
// 地图覆盖物类型
export const AMAP_OVERLAYS_TYPE_DIC = {
  circle: '圆',
  rectangle: '矩形',
  polygon: '多边形'
}
// 角色类型字典
export const ROLE_TYPE_DIC = {
  1: '管理员',
  0: '普通用户'
}
// 菜单类型字典
export const MENU_TYPE_DIC = {
  1: '链接菜单',
  0: '导航菜单'
}
// 用户状态字典
export const USER_STATE_DIC = {
  0: '未激活',
  1: '正常',
  2: '禁用'
}
// 用户性别字典
export const SEX_TYPE_DIC = {
  true: '男',
  false: '女'
}
// 设备模板类型字典
export const DEVICE_TEMPLATE_DIC = {
  true: '标准',
  false: '非标准'
}
// 设备类型统计类别字典
export const TYPE_STATS_CONFIG_DIC = {
  [TYPE_REAL_STAT]: '瞬时值统计',
  [TYPE_CUM_STAT]: '累积值统计'
}
// 设备类型_模式类别字典
export const TYPE_SCHEMA_CONFIG_DIC = {
  [TYPE_AUTO_SCHEMA]: '自动模式',
  [TYPE_CUSTOM_SCHEMA]: '自定义模式'
}
// 设备类型_升级文件字典
export const TYPE_FILE_DIC = {
  [TYPE_FILE_MAINSYS]: '主系统',
  [TYPE_FILE_SUBSYS]: '子系统',
  [TYPE_FILE_BOOTLOADER]: 'BootLoader'
}
// 设备配置类型字典
export const DEVICE_CONFIG_DIC = {
  [CUM_VAL_STAT]: '累积值值统计(已废弃)', // 该值已经废弃
  [REAL_VAL_STAT]: '实时值统计(已废弃)', // 该值已经废弃
  [SHUT_DOWN]: '一键停机',
  [CTRL_MODE]: '控制模式',
  [CTRL_MODE_CHECK]: '控制模式(自检)',
  [RUN_TIME_YMD]: '运行时长(年月日)',
  [RUN_TIME_Y]: '运行时长(年)',
  [RUN_TIME_M]: '运行时长(月)',
  [RUN_TIME_D]: '运行时长(日)',
  [DEVICE_VERSION]: '设备版本',
  [DEVICE_WARN_RESET]: '报警复位'
}
// 设备状态字典
export const DEVICE_STATE_DIC = { 0: '正常', 1: '异常', 2: '待巡', 3: '已巡', 4: '待修' }
// 导航状态字典
export const SIDENAV_STATUS = {
  open: 'sidenav-open',
  close: 'sidenav-close'
}
// 消息状态字典
export const NOTICE_STATUS_DIC = {
  [NOTICE_STATE_UNSOLVED]: '未处理',
  [NOTICE_STATE_SOLVED]: '已处理'
}
export const NOTICE_RETURN_STATUS_DIC = { true: '已处理', false: '未处理' }

/**
 * 统计过滤方案字典
 */
export const STAT_FILTER_DIC = {
  [STAT_FILTER_NO]: '不过滤',
  [STAT_FILTER_MAX_MIN]: '最大最小值过滤'
  // [STAT_FILTER_OTHER]: '其他'
}
/**
 * 统计展示层级字典
 */
export const STAT_SHOW_LEVEL_DIC = {
  [STAT_SHOW_LEVEL_ALL]: '所有',
  [STAT_SHOW_LEVEL_PROJECT]: '项目级',
  [STAT_SHOW_LEVEL_STATION]: '站场级',
  [STAT_SHOW_LEVEL_DEVICE]: '设备级'
}
