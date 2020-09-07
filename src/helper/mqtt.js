import { $apis, $utils } from '@helper'
import _ from '@helper/lodash.js'
import $q from 'q'

let client

/**
 * mqtt 日志输出
 * @param {strin}   tyep    日志类型
 * @param {strin}   logMsg  日志内容
 * @param {Object}  data    日志的附带数据
 */
function mqttLog(tyep, logMsg, data) {
  let color = {
    send: '#4d1a4d', // purple
    arrive: '#13ce66', // green
    subscribe: '#1D8CE0', // darkBlue
    once: '#1D8CE0', //  darkBlue
    error: '#fa0101', // color
    success: '#58b7ff', // lightBlue
    remove: '#ffa35c' // yellow
  }
  color = color[tyep] || '#20a0ff' // defaule color is blue
  console.group(`%c ${tyep} ${logMsg}`, `color:${color};font-weight:bold`)
  console.log(data)
  console.groupEnd()
}

// 存放不同主题的处理函数
// {..., destinationName:{..., topicIndex: {type:'subscribe',onMessageArrived}}}
const destinationNameFnObj = {}

/**
 * 移除主题中的某一处理函数
 * @param {string} topic  主题
 * @param {string} index  处理函数的索引
 */
function removeMessageArrived(topic, index) {
  if (destinationNameFnObj[topic] && destinationNameFnObj[topic][index]) {
    delete destinationNameFnObj[topic][index]
    mqttLog('remove', ` number of ${index} in ${topic}`, destinationNameFnObj[topic])
  }
}

/**
 * 移除主题,需要unSubscribe
 * tips：预留的方法，目前空置中....
 * @param {string} topic 主题
 */
function removeTopic(topic) {
  if (destinationNameFnObj[topic]) {
    delete destinationNameFnObj[topic]
    mqttLog('remove', ` ${topic}`, destinationNameFnObj)
  }
}

/**
 * 信息处理函数
 * @param {object} message mqtt接收到信息
 */
function onMessageArrived(message) {
  const { destinationName, payloadString } = message
  // 根据不同的主题选择不同的处理函数
  const destinationNameFn = destinationNameFnObj[destinationName]
  if (destinationNameFn) {
    // 遍历主题中的处理函数
    for (const index in destinationNameFn) {
      const fnObj = destinationNameFn[index]
      mqttLog('arrive', `index of ${index} ${fnObj.type} ${destinationName}`, payloadString)
      // 调用处理函数
      fnObj.onMessageArrived(payloadString)
      // 移除单次调用的函数
      if (fnObj.type === 'once') {
        removeMessageArrived(destinationName, index)
      }
    }
    // destinationNameFnList.forEach((destinationNameFn, index) => {})
  } else {
    // 理论上不会到此，因为订阅时（once、subscribe）已经处理了destinationNameFnList为undefined的情况
    console.error(`接收到没有处理函数的主题:${message.destinationName}`)
  }
}

// mqtt连接中断处理函数
function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) mqttLog('error', 'mqtt Lost', responseObject)
}

// function onFailure(failure) {
//   console.log('failure')
//   console.log(failure.errorMessage)
// }

export default {
  /**
   * 通过mqtt连接Apollo服务器
   * @param {{onConnectionLostCallBack}} 配置信息，目前只支持自定义错误处理函数
   */
  async connect({ onConnectionLostCallBack = onConnectionLost, clientId }) {
    const defer = $q.defer()

    const mqttConfig = await $apis.mqtt.config()
    const user = mqttConfig.username
    const password = mqttConfig.password
    const host = mqttConfig.hostname
    const port = mqttConfig.port
    clientId = clientId || $utils.newClientId() // mqttConfig.clintId
    client = new Messaging.Client(host, Number(port), clientId)
    // client.onConnect = onConnect

    client.onConnectionLost = function(responseObject) {
      // errorCode === 0 IS AMQJSC0000I OK.
      if (responseObject.errorCode !== 0) {
        if (typeof onConnectionLostCallBack === 'function') {
          onConnectionLostCallBack(responseObject)
        } else {
          mqttLog('error', 'mqtt Lost', responseObject)
        }
      }
    }
    client.onMessageArrived = onMessageArrived
    // see "/public/js/lib/mqttws31.js" line:1529
    client.connect({
      userName: user,
      password: password,
      timeout: 5, // 连接超时时间，单位秒
      keepAliveInterval: 120,
      onSuccess: frame => {
        mqttLog('success', 'mqtt connect success', frame)

        for (const topic in destinationNameFnObj) {
          client.subscribe(topic, {
            onSuccess() {
              mqttLog('success', `subscribe ${topic} success`)
            },
            onFailure(x) {
              mqttLog('error', `subscribe ${topic} again failure`, x)
            }
          })
        }
        defer.resolve(client)
      },
      onFailure: failure => {
        mqttLog('error', 'mqtt connect failure', failure)
        defer.reject(failure.errorMessage)
      }
    })
    return defer.promise
  },
  /**
   * 断开mqtt的连接
   */
  disConnects() {
    mqttLog('success', 'mqtt disConnects')
    client.disconnect()
  },
  /**
   * 订阅主题：多次订阅同一主题，以对象的形式存放在 destinationNameFnObj[topic] 中
   * @param   {string}    topic             主题
   * @param   {function}  onMessageArrived  主题处理函数
   * @param   {object}    subscribeOptions  订阅时的配置信息
   * @return  {number}    返回主题的处理函数的索引，用于手动删除onMessageArrived
   */
  subscribe(topic, onMessageArrived) {
    const defer = $q.defer()
    const topicIndex = _.uniqueId()
    // destinationNameFnObj[topic] = destinationNameFnObj[topic] || {}
    if (typeof onMessageArrived === 'function') {
      if (!destinationNameFnObj[topic]) {
        destinationNameFnObj[topic] = {}
        // topicIndex = destinationNameFnObj[topic].length - 1
        client.subscribe(topic, {
          onSuccess() {
            destinationNameFnObj[topic][topicIndex] = { type: 'subscribe', onMessageArrived }
            mqttLog('subscribe', ` ${topic},now this topic index is ${topicIndex}`, destinationNameFnObj[topic])
            defer.resolve(topicIndex)
          },
          onFailure(x) {
            mqttLog('error', `subscribe ${topic} failure,topic index is ${topicIndex}`, x)
          }
        })
      } else {
        destinationNameFnObj[topic][topicIndex] = { type: 'subscribe', onMessageArrived }
        mqttLog('subscribe', ` ${topic},now this topic index is ${topicIndex}`, destinationNameFnObj[topic])
        defer.resolve(topicIndex)
      }
    } else {
      defer.reject('onMessageArrived is not a function')
      console.error('onMessageArrived is not a function')
    }
    return defer.promise
  },
  /**
   * 订阅一次主题：接收到回复后会删除该主题对应的处理函数onMessageArrived
   * 由于
   * 目前有BUG
   * @param {string}    topic              主题
   * @param {function}  onMessageArrived   主题处理函数
   * @param {function}  [topicFormatFn]
   */
  once(topic, onMessageArrived, topicFormatFn) {
    const defer = $q.defer()
    const topicIndex = _.uniqueId()
    let formatTopic = topic
    if (typeof topicFormatFn === 'string') {
      formatTopic = topicFormatFn(topic)
    }
    // destinationNameFnObj[topic] = destinationNameFnObj[topic] || {}
    if (typeof onMessageArrived === 'function') {
      if (!destinationNameFnObj[topic]) {
        destinationNameFnObj[topic] = {}
        client.subscribe(topic, {
          onSuccess() {
            destinationNameFnObj[formatTopic][topicIndex] = { type: 'once', onMessageArrived }
            mqttLog('once', `${formatTopic},now this topic index is ${topicIndex}`, destinationNameFnObj[formatTopic])
            defer.resolve(topicIndex)
          },
          onFailure(err) {
            mqttLog('error', `once ${formatTopic} failure,topic index is ${topicIndex}`, err)
          }
        })
      } else {
        destinationNameFnObj[formatTopic][topicIndex] = { type: 'once', onMessageArrived }
        mqttLog('once', `${formatTopic},now this topic index is ${topicIndex}`, destinationNameFnObj[formatTopic])
        defer.resolve(topicIndex)
      }
    } else {
      defer.reject('onMessageArrived is not a function')
      console.error('onMessageArrived is not a function')
    }
    return defer.promise
  },
  removeMessageArrived,
  removeTopic,
  /**
   * 向主题发送消息
   * @param   {string}  topic   主题
   * @param   {string}  msg     要发送的消息
   */
  send(topic, msg) {
    mqttLog('send', `${topic}`, msg)
    // see "/public/js/lib/mqttws31.js" line:1748
    const message = new Messaging.Message(msg)
    message.destinationName = topic
    client.send(message)
  }
}
