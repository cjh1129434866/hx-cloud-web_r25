/*
 * @Author: jiapeng.Zheng
 * @Date: 2018-04-24 14:02:01
 * @Last Modified by: jiapeng.Zheng
 * @Last Modified time: 2019-07-10 17:32:00
 * @description: 通过mqtt控制设备
 */
import mqtt from '@helper/mqtt'
import { MQTT_TOPIC_PREFIX } from '@constants/index'
import $q from 'q'
import $store from '@store'
import { $utils } from '@helper'
import PermissionApi from './permission'
import DeviceLogApi from './deviceLog'

// 获取mqtt主题前缀（以组织机构的Code作为mqtt主题前缀）
const getMqttTopicPrefix = () => {
  const Code = $store.state.$userGroup.Code
  return Code || MQTT_TOPIC_PREFIX
}

// 信息格式化，将json对象转换为json字符串，并在末尾增加回车换行
const msgFormat = (msgObj: MqttDataReq | UpdataSendData) => {
  return JSON.stringify(msgObj) + '\r\n'
}

/**
 * 设备控制
 * @param deviceNo  设备编码
 * @param dataKey   数据定义Key
 * @param dataValue 数据定义value
 */
async function _ctrlDevice(deviceInfo: DeviceVO, mqttDataObj: MqttDataCtrlVO) {
  const defer = $q.defer<MqttDataAck>()
  const { DeviceNo, DeviceSn } = deviceInfo
  const { dataKey, displayKey, dataValue, dataValueOld, dataName } = mqttDataObj
  let resData: MqttDataAck = $store.state.$mqtt_device_data[DeviceNo] // 获取设备控制之前的数据
  const logData = {
    DeviceSn: DeviceSn,
    Key: dataKey,
    KeyName: dataName,
    OldValue: dataValueOld,
    Value: dataValue,
    NewValue: null,
    SendTime: null,
    Time: null
  }
  // 订阅一次主题，接收返回的信息
  await mqtt.once(
    // 主题名称
    `${getMqttTopicPrefix()}/${DeviceNo}/DevicePub`,
    // 接收到的消息
    message => {
      const formatData: MqttDataAck = JSON.parse(message)
      resData = $utils.mqttDeviceDataFormatMethod(formatData, DeviceNo) // 数据解析
      logData.Time = $utils.dateConvert(new Date(), 'YYYY-MM-DD HH:mm:ss.SSS') // 记录发送成功Or失败的时间
      logData.NewValue = resData.data[displayKey || dataKey] // 记录返回值
      // 控制日志记录
      DeviceLogApi.addDeviceLog(logData)
      defer.resolve(resData)
    }
  )
  // 往设备下发的数据
  const msg: MqttDataReq = {
    uuid: DeviceNo,
    action: 'writedata',
    ts: $utils.mqttSendDateConvert(Date.now()),
    data: {}
  }

  msg.data[dataKey] = dataValue
  logData.SendTime = $utils.dateConvert(new Date(), 'YYYY-MM-DD HH:mm:ss.SSS') // 记录发送时间
  mqtt.send(`${getMqttTopicPrefix()}/${DeviceNo}/DeviceSub`, msgFormat(msg))

  return defer.promise
}

export default {
  /**
   * 销毁订阅的主题
   * @param {string}  deviceNo      设备序列号
   * @param {Array}   topicIndexs   要销毁的回调的索引
   */
  destroyedDevicePubMessageArrived(deviceNo, topicIndexs) {
    const topic = `${getMqttTopicPrefix()}/${deviceNo}/DevicePub`
    topicIndexs.forEach(item => {
      mqtt.removeMessageArrived(topic, item)
    })
  },

  /**
   * 订阅设备中所有类型的数据
   * @param   {string}    deviceNo    设备序列号
   * @param   {function}  callBackFn  消息回调函数
   * @return  {number}    返回主题的处理函数的索引，用于手动删除消息回调函数onMessageDispose
   */
  async subscribeAllDeviceData(deviceNo, callBackFn) {
    // 订阅主题，接收返回的信息
    return mqtt.subscribe(
      `${getMqttTopicPrefix()}/${deviceNo}/DevicePub`,
      // 接收到的消息
      message => {
        const formatData = JSON.parse(message)
        const data = $utils.mqttDeviceDataFormatMethod(formatData, deviceNo)
        callBackFn(data)
      }
    )
  },

  /**
   * 获取设备中各所有的数据
   * @param   deviceNo  设备序列号
   * @param   callBackFn  消息回调函数
   * @return  返回主题的处理函数的索引，用于手动删除消息回调函数onMessageDispose
   */
  async getAllDeviceData(deviceNo: string, callBackFn: Function) {
    const msg: MqttDataReq = {
      uuid: deviceNo,
      action: 'readdata',
      ts: $utils.mqttSendDateConvert(Date.now()),
      data: 'alldata'
    }

    // 订阅一次主题，接收返回的信息
    const topicIndex: number = await mqtt.once(
      // 主题名称
      `${getMqttTopicPrefix()}/${deviceNo}/DevicePub`,
      // 接收到的消息
      message => {
        const formatData = JSON.parse(message)
        const data = $utils.mqttDeviceDataFormatMethod(formatData, deviceNo)
        callBackFn(data)
      }
    )
    // msg = msgFormat(msg)
    // 发送消息
    mqtt.send(`${getMqttTopicPrefix()}/${deviceNo}/DeviceSub`, msgFormat(msg))
    return topicIndex
  },

  /**
   * 获取设备中各种类型的数据
   * @param  deviceNo  设备序列号
   * @param  dataType  数据种类，如：info、alldata、error ....
   * @param  callBackFn  消息回调函数
   * @return 返回主题的处理函数的索引，用于手动删除消息回调函数onMessageDispose
   */
  async getDeviceData(deviceNo: string, dataType: mqttDataType = 'alldata', callBackFn: Function) {
    const msg: MqttDataReq = {
      uuid: deviceNo,
      action: 'readdata',
      ts: $utils.mqttSendDateConvert(Date.now()),
      data: dataType
    }

    // 订阅一次主题，接收返回的信息
    const topicIndex: number = await mqtt.once(
      // 主题名称
      `${getMqttTopicPrefix()}/${deviceNo}/DevicePub`,
      // 接收到的消息
      message => {
        const formatData = JSON.parse(message)
        const data = $utils.mqttDeviceDataFormatMethod(formatData, deviceNo)
        callBackFn(data)
      }
    )
    // 发送消息
    mqtt.send(`${getMqttTopicPrefix()}/${deviceNo}/DeviceSub`, msgFormat(msg))
    return topicIndex
  },

  /**
   * 控制设备
   * @param deviceInfo  设备信息
   * @param mqttDataObj 设备控制信息
   * @description 需要根据deviceSn进行权限验证
   */
  async controlleDevice(deviceInfo: DeviceVO, mqttDataObj: MqttDataCtrlVO): Promise<ControlPermissionVO> {
    const { DeviceNo, DeviceSn } = deviceInfo
    const defer = $q.defer<ControlPermissionVO>()
    const res: ControlPermissionVO = {
      IsAccess: false,
      Message: '',
      data: $store.state.$mqtt_device_data[DeviceNo] // 获取设备控制之前的数据
    }

    const { IsAccess, Message, Success } = await PermissionApi.checkDeviceControl(DeviceSn)
    res.IsAccess = IsAccess && Success
    res.Message = Message

    // 权限判断
    if (res.IsAccess) {
      const resData = await _ctrlDevice(deviceInfo, mqttDataObj)
      res.data = resData
    }
    defer.resolve(res)

    return defer.promise
  },

  /**
   * 报警复位
   * @param   deviceInfo    设备信息
   * @param   dataKey       报警复位的Key
   * @description 需要根据DeviceSn进行权限验证
   */
  async resertWarn(deviceInfo: DeviceVO, dataKey: string) {
    const key_up = 0
    const key_down = 1
    const { DeviceNo, DeviceSn } = deviceInfo
    const mqttObj: MqttDataCtrlVO = {
      dataKey: dataKey,
      displayKey: dataKey,
      dataValueOld: key_up,
      dataValue: key_down,
      dataName: '报警复位'
    }
    const defer = $q.defer()
    const res = {
      IsAccess: false,
      Message: '无权限',
      data: $store.state.$mqtt_device_data[DeviceNo] // 获取设备控制之前的数据
    }
    // 获取设备控制权限
    const { IsAccess, Message, Success } = await PermissionApi.checkDeviceControl(DeviceSn)
    res.IsAccess = IsAccess && Success
    res.Message = Message
    // 权限判断
    if (res.IsAccess) {
      // 设备复位逻辑：先置1再置0
      let resData = await _ctrlDevice(deviceInfo, mqttObj) // 置1
      res.data = resData
      res.IsAccess = resData.data[dataKey] === key_down
      res.Message = res.IsAccess ? '' : '设备不支持在线复位！'
      // 只有成功置1后才重新置0
      if (res.IsAccess) {
        mqttObj.dataValue = key_up
        mqttObj.dataValueOld = key_down
        resData = await _ctrlDevice(deviceInfo, mqttObj) // 置0
        res.data = resData
        res.IsAccess = resData.data[dataKey] === key_up
        res.Message = res.IsAccess ? '' : '设备异常，请重新复位！'
      }
    }
    defer.resolve(res)

    return defer.promise
  },

  /**
   * 获取设备升级信息，判断设备是否需要升级
   * @param {String} deviceNo 设备编码
   * @param {String} version  版本号码
   * @param {Object} preload  其他信息, 允许重新定义获取设备升级状态时的参数
   */
  async getDeviceUpgradeState(deviceNo, version, preload) {
    const defer = $q.defer()
    // 订阅一次主题，接收返回的信息
    await mqtt.once(
      // 主题名称
      `${getMqttTopicPrefix()}/${deviceNo}/DevicePub`,
      // 接收到的消息
      message => {
        const formatData = JSON.parse(message)
        defer.resolve(formatData.state)
      }
    )
    let msg = {
      uuid: deviceNo,
      action: 'update',
      state: 'request',
      version: version,
      ts: $utils.mqttSendDateConvert(Date.now()),
      ...preload
    }
    msg = msgFormat(msg)
    mqtt.send(`${getMqttTopicPrefix()}/${deviceNo}/DeviceSub`, msg)
    return defer.promise
  },
  /**
   * 发送升级包
   * @param {String} deviceNo 设备编码
   * @param {Object} packet 升级数据包 {index:'当前包的索引',count:'总包数',data:'当前包的数据'}
   */
  async sendUpgradeData(deviceNo, packet) {
    const defer = $q.defer()
    // 订阅一次主题，接收返回的信息
    await mqtt.once(
      // 主题名称
      `${getMqttTopicPrefix()}/${deviceNo}/DevicePub`,
      // 接收到的消息
      message => {
        const formatData = JSON.parse(message)
        defer.resolve(formatData)
      }
    )
    const msg: UpdataSendData = {
      uuid: deviceNo,
      action: 'update',
      package: packet.index,
      allpackage: packet.count,
      bin: packet.data,
      ts: $utils.mqttSendDateConvert(Date.now())
    }
    mqtt.send(`${getMqttTopicPrefix()}/${deviceNo}/DeviceSub`, msgFormat(msg))
    return defer.promise
  }
}
