/*
 * @Author: jiapeng.Zheng
 * @Date: 2019-04-03 09:46:15
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-05-25 10:57:48
 * @Description:  统计相关的常量
 */

/**
 * 存储在用户配置中关于统计图个性化配置的key
 */
export const USERCONFIG_STATS_KEY = 'statsIsShow'

// ---------------- 过滤方案 ----------------
// -- 若要新增过滤方案，则要同时修改一下两个方法：
// -- 1、src/helper/utils.js 中的 statisticsDataFormat 方法
// -- 2、src/views/system/deviceTypeStatisticsInfo.vue 中的过滤方法
// -------------------------------------------
/**
 * （默认）过滤方案:不过滤
 */
export const STAT_FILTER_NO = 0
/**
 * 过滤方案:后端统计程序根据 Filter 属性中的最大最小值[ filter = "max_value,min_value"(用逗号分隔最大最小值) ]进行过滤
 */
export const STAT_FILTER_MAX_MIN = 1
/**
 * 过滤方案:其他(待定)
 */
export const STAT_FILTER_OTHER = 2

// ---------------- 统计类型 ----------------
/**
 * （默认）统计类型：瞬时值统计（后端统计程序逻辑:当天所有的值取平均）
 */
export const TYPE_REAL_STAT = 1
/**
 * 统计类型：累计值统计（后端统计程序逻辑:当天最后一个值减当天第一个值）
 */
export const TYPE_CUM_STAT = 2

// ---------------- 统计分类(用于分组) ----------------
/**
 * （默认）检测类型统计
 */
export const STAT_TYPE_CHECK = 0
/**
 * 监测类型统计
 */
export const STAT_TYPE_MONITOR = 1
/**
 * 状态类型统计
 */
export const STAT_TYPE_STATE = 2
/**
 * 统计类型配置
 */
export const STAT_TYPE_CONFIG = {
  [STAT_TYPE_CHECK]: { key: STAT_TYPE_CHECK, icon: 'panel/statsdata', name: '检测' },
  [STAT_TYPE_MONITOR]: { key: STAT_TYPE_MONITOR, icon: 'panel/monitor', name: '监测' },
  [STAT_TYPE_STATE]: { key: STAT_TYPE_STATE, icon: 'panel/state', name: '状态' }
}

// ---------------------------------------- 统计展示方式(图表/表格) ----------------------------------------
export const STAT_SHOW_WAY_CHART = 'chart' // 统计数据展示方式:图表
export const STAT_SHOW_WAY_TABLE = 'table' // 统计数据展示方式:表格
export const STAT_SHOW_WAY = [
  { key: STAT_SHOW_WAY_CHART, icon: 'statistics/line' },
  { key: STAT_SHOW_WAY_TABLE, icon: 'statistics/table' }
]
// ----------------------------------- 统计展示层级(首页/项目/站场/设备) -----------------------------------
/**
 * （默认）统计展示层级:设备级，即只在设备上显示
 */
export const STAT_SHOW_LEVEL_DEVICE = 0
/**
 * 统计展示层级:站场级，即只在站场和设备上显示
 */
export const STAT_SHOW_LEVEL_STATION = 1
/**
 * 统计展示层级:项目级，即只在项目、站场和设备上显示，首页不显示
 */
export const STAT_SHOW_LEVEL_PROJECT = 2
/**
 * 统计展示层级:首页，即所有层级都显示
 */
export const STAT_SHOW_LEVEL_ALL = 3
