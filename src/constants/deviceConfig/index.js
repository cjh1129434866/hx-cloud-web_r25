export const DEFAULT_ACC_ICON = 'statistics/powerNum' // 设备配件默认的图标

// ------------------------------ 设备配置信息中控制模式 CTRL_MODE 、CTRL_MODE_CHECK 下的分类-----------------------------------------------------------
export const AUTO_MODE = '1' // 自动模式
export const MANUAL_MODE = '0' // 手动模式
export const CHECK_MODE = '2' // 自检模式

// ------------------------------  统计分类 -----------------------------------------------------------
export const CUM_VAL_STAT = 'T0' // 累积值统计（已经废弃）
export const REAL_VAL_STAT = 'T0_1' // 实时值统计（已经废弃）

// ------------------------------ 设备配置信息 -----------------------------------------------------------
export const SHUT_DOWN = 'T1' // 一键停机
/**
 * 控制模式（手自动切换）
 */
export const CTRL_MODE = 'T2'
/**
 * 控制模式（自检）
 */
export const CTRL_MODE_CHECK = 'T2_0'
export const RUN_TIME_YMD = 'T3' // 运行时长(年月日)
export const RUN_TIME_Y = 'T3_0' // 运行时长(年)
export const RUN_TIME_M = 'T3_1' // 运行时长(月)
export const RUN_TIME_D = 'T3_2' // 运行时长(日)
export const DEVICE_VERSION = 'T4' // 设备版本
export const DEVICE_WARN_RESET = 'T5' // 设备报警复位

/**
 * 设备配置信息的配置
 */
export const DEVICE_CONFIG = {
  // [CUM_VAL_STAT]: {},
  // [REAL_VAL_STAT]: {},
  [SHUT_DOWN]: {},
  [CTRL_MODE]: { icon: '', category: { [AUTO_MODE]: '自动', [MANUAL_MODE]: '手动' } },
  [CTRL_MODE_CHECK]: { icon: '', category: { [AUTO_MODE]: '自动', [MANUAL_MODE]: '手动', [CHECK_MODE]: '自检' } },
  [RUN_TIME_YMD]: {},
  [RUN_TIME_Y]: {},
  [RUN_TIME_M]: {},
  [RUN_TIME_D]: {},
  [DEVICE_VERSION]: {},
  [DEVICE_WARN_RESET]: {}
}
