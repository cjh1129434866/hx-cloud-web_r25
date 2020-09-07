/*
 * @Author: jiapeng.Zheng
 * @Date: 2019-06-26 14:29:25
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-04-29 17:32:32
 * @Description: 数据定义类型、单位等配置
 */
export const DATA_TYPE_BOOLEAN = 'boolean'
export const DATA_TYPE_BOOLEAN2 = 'boolean2'
export const DATA_TYPE_STRING = 'string'
export const DATA_TYPE_ENUM = 'enum'
export const DATA_TYPE_MONITOR = 'monitor'
export const DATA_TYPE_DATETIME = 'time'
export const DATA_TYPE_SELECT = 'select'
// DATA_TYPE_CONFIG 中有旧的属性值
export const OLD_DATA_TYPE_LIST = ['datetime', 'date']

export const SWITCH_ACTIVE = '1'
export const SWITCH_UNACTIVE = '0'
/**
 * 频率类型的单位，不能更改该字段的值
 */
export const UNIT_FREQ = 'frequency'
/**
 * 时间类型的单位，不能更改该字段的值
 */
export const UNIT_TIME = 'Time'
export const UNIT_TIME_S = 's' // 秒，不能更改该字段的值
// 数据类型配置
export const DATA_TYPE_CONFIG = new Proxy(
  {
    [DATA_TYPE_BOOLEAN]: {
      icon: '', // 图标（暂未使用）
      componentType: 'Iswitch', // 自定义的组件名称
      componentDataType: DATA_TYPE_BOOLEAN, // 数据类型
      componentDataValue: '{"0":0,"1":1}', // 默认值
      hasUnit: false, // 是否有单位
      disabled: false // 是否启用该类型
    },
    [DATA_TYPE_BOOLEAN2]: {
      icon: '',
      componentType: 'Iswitch',
      componentDataType: DATA_TYPE_BOOLEAN2,
      componentDataValue: '{"0":0,"1":1}',
      hasUnit: false,
      disabled: true
    },
    [DATA_TYPE_STRING]: {
      icon: '',
      componentType: 'controllerInput',
      componentDataType: DATA_TYPE_STRING,
      componentDataValue: '',
      hasUnit: true,
      disabled: false
    },
    [DATA_TYPE_ENUM]: {
      icon: '',
      componentType: 'monitor',
      componentDataType: DATA_TYPE_ENUM,
      componentDataValue: '{"0":"低","1":"中","2":"高"}',
      hasUnit: false,
      disabled: false
    },
    [DATA_TYPE_MONITOR]: {
      icon: '',
      componentType: 'monitor',
      componentDataType: DATA_TYPE_MONITOR,
      componentDataValue: '',
      hasUnit: true,
      disabled: false
    },
    [DATA_TYPE_DATETIME]: {
      icon: '',
      componentType: 'controllerInput',
      componentDataType: DATA_TYPE_DATETIME,
      componentDataValue: '',
      hasUnit: false,
      disabled: false
    },
    [DATA_TYPE_SELECT]: {
      icon: '',
      componentType: 'monitor',
      componentDataType: DATA_TYPE_SELECT,
      componentDataValue: '{"options":[{"name":"波特率1200","value":1200},{"name":"波特率9600","value":9600}]}',
      hasUnit: false,
      disabled: false
    }
  },
  {
    get: function(target, propKey) {
      // 当获取不到有效的属性时（旧类型），返回一个默认的值
      if (!target[propKey] && OLD_DATA_TYPE_LIST.indexOf(propKey) > -1) {
        console.error(`DATA_TYPE_CONFIG 不存在 ${propKey} 属性`)
        return {
          icon: '',
          componentType: 'monitor',
          componentDataType: DATA_TYPE_MONITOR,
          componentDataValue: '',
          hasUnit: false,
          disabled: true
        }
      }
      return target[propKey]
    }
  }
)
/**
 * 数据定义单位
 *
 * label:     前端展示用;
 *
 * value:     存储于数据库中的key，为了兼容旧数据不能更改该字段的值;
 *
 * format:    单位转换规则，例：1h = 60m = 60*60s;
 *
 * children:  同属一种类别的单位，例：h、m、s 同属于“时间Time”这一类别;
 *
 * isBase:    是否是同一类别下的基础单位（默认单位），主要用于统计合计时，把不同类型的单位转换为同一基础单位;
 *
 * 注：isBase 为 true 的字段，其 format 中的 step 必须为1，与其同属一类的单位中的step，必须根据该单位的进制做转换，
 *
 * 例： 时间(Time)下的秒(s)，isBase = true 则 format.step = 1;
 *
 *    则时间(Time)下的分(m)，format.step = 1 * 60;
 *
 *    则时间(Time)下的时(h)，format.step = 1 * 60 * 60;
 *
 *    ......
 */
export const DATA_TYPE_UNIT_CONFIG = [
  { label: '', value: '-', format: { step: 1 } },
  {
    label: '时间',
    value: UNIT_TIME,
    children: [
      { label: '秒', value: UNIT_TIME_S, format: { step: 1 }, isBase: true },
      { label: '分', value: 'm', format: { step: 60 } },
      { label: '时', value: 'h', format: { step: 60 * 60 } },
      { label: '日', value: 'd', format: { step: 60 * 60 * 24 } },
      { label: '月', value: 'M', format: { step: 60 * 60 * 24 * 30 } },
      { label: '年', value: 'y', format: { step: 60 * 60 * 24 * 365 } }
    ]
  },
  { label: '电量', value: 'Energy', children: [{ label: 'kW·h', value: 'kW·h', format: { step: 1 }, isBase: true }] },
  {
    label: '流量',
    value: 'Flow',
    children: [
      { label: 'm³', value: 'm3', format: { step: 1 }, isBase: true },
      { label: 'm³/d', value: 'm3/d', format: { step: 1 } },
      { label: 'm³/H', value: 'm3/H', format: { step: 24 } }
    ]
  },
  {
    label: '浓度',
    value: 'concentration',
    children: [
      { label: 'mg/L', value: 'mg/L', format: { step: 1 }, isBase: true },
      { label: 'g/L', value: 'g/L', format: { step: 1000 } }
    ]
  },
  {
    label: 'ppm浓度',
    value: 'ppm',
    children: [{ label: 'ppm', value: 'ppm', format: { step: 1 }, isBase: true }]
  },
  {
    label: '气压',
    value: 'airPressure',
    children: [
      { label: 'KPa', value: 'KPa', format: { step: 1 }, isBase: true },
      { label: 'Pa', value: 'Pa', format: { step: 1 / 1000 } },
      { label: 'MPa', value: 'MPa', format: { step: 1000 } }
    ]
  },
  {
    label: '电压',
    value: 'Voltage',
    children: [
      { label: 'mV', value: 'mV', format: { step: 1 }, isBase: true },
      { label: 'V', value: 'V', format: { step: 1000 } }
    ]
  },
  {
    label: '电流',
    value: 'Current',
    children: [
      { label: 'mA', value: 'mA', format: { step: 1 }, isBase: true },
      { label: 'A', value: 'A', format: { step: 1000 } }
    ]
  },
  {
    label: '频率',
    value: UNIT_FREQ,
    children: [
      { label: 'HZ', value: 'HZ', format: { step: 1 }, max: 50, isBase: true },
      { label: 'KHZ', value: 'KHZ', format: { step: 1000 } },
      { label: 'MHZ', value: 'MHZ', format: { step: 1000 * 1000 } }
    ]
  },
  {
    label: '功率',
    value: 'power',
    children: [
      { label: 'W', value: 'W', format: { step: 1 }, isBase: true },
      { label: 'KW', value: 'KW', format: { step: 1000 } },
      { label: 'MW', value: 'MW', format: { step: 1000 * 1000 } }
    ]
  },
  { label: '温度', value: 'temperature', children: [{ label: '℃', value: '℃', format: { step: 1 }, isBase: true }] },
  { label: '湿度', value: 'humidity', children: [{ label: '%', value: '%', format: { step: 1 }, isBase: true }] }
] // 60 * 60 * 24 * 365 // 60 * 60 * 24 * 30 //  60 * 60 * 24 // 60 * 60 // 设备的默认时间单位为秒 // 设备的默认电量单位为kW·h // 设备的默认电压单位为V // 设备的默认电流单位为mA // 设备的默认频率单位为HZ
