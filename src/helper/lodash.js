/*
  Date: 2017-08-01
  Desc: Modular Lodash builds without the hassle. You can freely add the method you need
  Detail:
    https://www.npmjs.com/package/lodash-webpack-plugin
    https://www.npmjs.com/package/babel-plugin-lodash
*/
import _ from 'lodash'

export default {
  trim: _.trim, // 从string字符串中移除前面和后面的 空格 或 指定的字符
  toNumber: _.toNumber,
  merge: _.merge, // 合并对象，遇到相同属性名的时候，如果属性值是纯对象或集合的时候，会合并属性值，如果源对象的属性值为 undefined，则会忽略该属性
  uniqueId: _.uniqueId, // 主要是为区分一 mqtt 主题的不同订阅者
  random: _.random, // 主要是为图片添加随机后缀
  cloneDeep: _.cloneDeep, // 主要是为了每个输入的字段拷贝自定义的验证规则
  debounce: _.debounce, // input框的change事件消抖
  throttle: _.throttle, // window resize 事件节流
  values: _.values,
  fill: _.fill,
  remove: _.remove, // 针对复杂数组的删除
  orderBy: _.orderBy, // 主要用来对设备列表进行多条件排序
  isEmpty: _.isEmpty,
  isNaN: _.isNaN, // 主要验证用户输入的值是否为数字
  isNil: _.isNil, // Checks if value is null or undefined.
  isNull: _.isNull,
  isObject: _.isObject,
  isArray: _.isArray,
  isDate: _.isDate,
  isFinite: _.isFinite
}
