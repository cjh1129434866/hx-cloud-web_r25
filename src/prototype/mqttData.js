/*
 * @Author: jiapeng.Zheng
 * @Date: 2018-12-29 14:05:04
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-31 17:21:13
 * @Description:
 */
// import Vue from 'vue'
import { $utils } from '@helper'
import $_ from '@helper/lodash'
import { DATA_TYPE_UNIT_CONFIG } from '@constants/dataTypeConfig'
import { locales, i18n } from '@/locales'

/**
 * 四则运算
 * @param {number} val1 第一个操作数
 * @param {number} opt 操作符, 1:加法,-1:减法,2:加法,-2:除法
 * @param {number} val2 第二个操作数
 */
const formulaRule = (val1, opt, val2) => {
  let returnVal = val1
  switch (opt) {
    case 1:
      returnVal = val1 + val2
      break
    case -1:
      returnVal = val1 - val2
      break
    case 2:
      returnVal = val1 * val2
      break
    case -2:
      returnVal = val1 / val2
      break
    default:
      returnVal = val1
  }
  return returnVal.toFixed(3) * 1
}

// 对数据定义的format字段中的formula属性进行正向的四则运算运算
const operation = (val, rule) => {
  let returnVal = val
  for (const i of rule) {
    if ($_.isArray(i) && i.length === 2) {
      returnVal = formulaRule(returnVal * 1, i[0], i[1] * 1)
    }
  }
  return returnVal
}
// 对数据定义的format字段中的formula属性进行逆向的四则运算运算
const inverseOperation = (val, rule) => {
  let returnVal = val
  for (const i of rule.reverse()) {
    if ($_.isArray(i) && i.length === 2) {
      returnVal = formulaRule(returnVal * 1, i[0] * -1, i[1] * 1)
    }
  }
  return returnVal
}

// =========================================================== 单位格式化 =====================================================
const getBaseUnit = (value, key = 'value') => {
  const valueObj = $utils.isJsonString(value) ? JSON.parse(value) : [`${value}`]
  const valueArray = $utils.getCascaderObj(valueObj, DATA_TYPE_UNIT_CONFIG, {
    children: 'children',
    label: 'label',
    value: 'value'
  })
  const topObj = valueArray[0] ? valueArray[0] : { children: [] }

  const baseUnit = (topObj.children || []).find(ele => {
    return ele.isBase === true
  })
  return baseUnit ? baseUnit[key] : ''
}
const unitFormat = (value, key = 'label') => {
  const valueObj = $utils.isJsonString(value) ? JSON.parse(value) : [`${value}`]
  const valueArray = $utils.getCascaderObj(valueObj, DATA_TYPE_UNIT_CONFIG, {
    children: 'children',
    label: 'label',
    value: 'value'
  })
  const result = valueArray[valueArray.length - 1] ? valueArray[valueArray.length - 1][key] : ''
  return result
}
// ================ 数据显示格式化（将从“设备”接收到的数据格式化为“前端组件”能处理的数据） ================
const booleanOutFormat = (value = 0, formatObj) => {
  let returnVal = value
  for (const i in formatObj) {
    if (String(formatObj[i]) === String(value)) {
      returnVal = i
    }
  }
  return returnVal
}
const stringOutFormat = (value = 0, formatObj) => {
  let returnVal = value
  formatObj.formula = formatObj.formula || []
  // formatObj.step = formatObj.step || 1
  if ($_.isArray(formatObj.formula) && formatObj.formula.length > 0) {
    returnVal = inverseOperation(value, formatObj.formula)
  } else if ($_.isFinite(formatObj.step * 1)) {
    returnVal = (value / formatObj.step).toFixed(3) * 1
  }
  return returnVal
}

const timeOutFormat = (value /* ,formatObj */) => {
  let date = $utils.dayConvert(Date.now())
  date = new Date(`${date} ${value}`)
  if ($_.isNaN(date.getTime())) {
    date = undefined
  }
  return date
}

const enumOutFormat = (value = '', formatObj) => {
  return formatObj[value] || value
}
const monitorOutFormat = (value = 0, formatObj) => {
  let returnVal = value
  formatObj.formula = formatObj.formula || []
  formatObj.step = formatObj.step || 1
  if ($_.isArray(formatObj.formula) && formatObj.formula.length > 0) {
    returnVal = inverseOperation(value, formatObj.formula)
  } else {
    returnVal = (value / formatObj.step).toFixed(3) * 1
  }
  return returnVal
}
const selectOutFormat = (value = '' /**, formatObj */) => {
  return value
}
// ================ 数据控制格式化（将“用户”通过“前端组件”输入的数据格式为“设备”能处理的数据） ================
const booleanInFormat = (value = 0, formatObj) => {
  return formatObj[value] !== undefined ? formatObj[value] : value
}

const stringInFormat = (value = 0, formatObj) => {
  let returnVal = value
  formatObj.formula = formatObj.formula || []
  // formatObj.step = formatObj.step || 1
  if ($_.isArray(formatObj.formula) && formatObj.formula.length > 0) {
    returnVal = operation(value, formatObj.formula)
  } else if ($_.isFinite(formatObj.step * 1)) {
    returnVal = (value * formatObj.step).toFixed(3) * 1
  }

  return returnVal
}

const timeInFormat = (value, formatObj) => {
  return $utils.timeConvert(value, formatObj.farmat)
}

const enumInFormat = enumOutFormat

const monitorInFormat = (value = 0, formatObj) => {
  let returnVal = value
  formatObj.formula = formatObj.formula || []
  formatObj.step = formatObj.step || 1
  if ($_.isArray(formatObj.formula) && formatObj.formula.length > 0) {
    returnVal = operation(value, formatObj.formula)
  } else {
    returnVal = (value * formatObj.step).toFixed(3) * 1
  }

  return returnVal
}

const selectInFormat = selectOutFormat

// ================ 数据展示格式化（将从“设备”接收到的数据格式化为能“直接展示（带单位）”的数据） ================
const booleanShowFormat = (value = 0, formatObj) => {
  const dict = { '0': locales[i18n.locale]['deviceOff'], '1': locales[i18n.locale]['deviceOn'] }
  value = formatObj[value] || value
  return dict[value]
}
const stringShowFormat = stringOutFormat
const timeShowFormat = (value /**formatObj */) => {
  return value
}
const enumShowFormat = enumOutFormat
const monitorShowFormat = monitorOutFormat
const selectShowFormat = (value = '', formatObj) => {
  const opt = formatObj.options.find(ele => ele.value === value)
  return opt ? opt.name : value
}
// =========================================================================================================
const _format = Format => {
  return $utils.isJsonString(Format) ? JSON.parse(Format) : {}
}
/* eslint @typescript-eslint/no-use-before-define: 0 */
// 格式化接收到的设备数据，主要用来只显示（带单位）
const showFormat = function({ Unit, Format, DataType }, value) {
  const formatObj = _format(Format)
  return THIS_MODULE[`${DataType}ShowFormat`](value, formatObj) + THIS_MODULE.unitFormat(Unit)
}
// 格式化接收到的设备数据
const outFormat = function({ Format, DataType }, value) {
  const formatObj = _format(Format)
  return THIS_MODULE[`${DataType}OutFormat`](value, formatObj)
}
// 格式化将要下发到设备的数据
const inFormat = function({ Format, DataType }, value) {
  const formatObj = _format(Format)
  return THIS_MODULE[`${DataType}InFormat`](value, formatObj)
}

const THIS_MODULE = {
  _format,
  showFormat,
  outFormat,
  inFormat,
  booleanOutFormat,
  booleanInFormat,
  booleanShowFormat,
  boolean2OutFormat: booleanOutFormat,
  boolean2InFormat: booleanInFormat,
  boolean2ShowFormat: booleanShowFormat,
  stringOutFormat,
  stringInFormat,
  stringShowFormat,
  selectOutFormat,
  selectInFormat,
  selectShowFormat,
  timeOutFormat,
  timeInFormat,
  timeShowFormat,
  enumOutFormat,
  enumInFormat,
  enumShowFormat,
  monitorOutFormat,
  monitorInFormat,
  monitorShowFormat,
  unitFormat,
  getBaseUnit
}

export default THIS_MODULE
