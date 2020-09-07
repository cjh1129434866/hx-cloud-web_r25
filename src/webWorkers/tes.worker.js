/*
 * @Author: jiapeng.Zheng
 * @Date: 2019-08-07 13:59:53
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-31 16:22:23
 * @Description:
 */
// import _ from '@helper/lodash.js'
// const $mqttData = require('@/prototype/mqttData')
// const $utils = require('@utils')

// const $mqttData = require('@prototype/mqttData')
// const _ = require('@helper/lodash.js')

// const $mqttData = resolve => require.ensure([], () => resolve(require('@/prototype/mqttData')), 'mqttData')
const _ = resolve => require.ensure([], () => resolve(require('@helper/lodash.js')), '_')

console.log(_)

// Post data to parent thread
self.postMessage({ foo: 'foo' })

// Respond to message from parent thread
self.addEventListener('message', event => console.log(event))
