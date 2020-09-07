/*
 * @Author: jiapeng.Zheng
 * @Date: 2019-09-02 09:51:16
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-01-15 16:21:48
 * @Description:
 */
import { DATA_TYPE_CONFIG } from '@constants/dataTypeConfig/index.js'
/**
 * 控制数据格式化
 * @param   { DeviceControlVO }   deviceControl   设备控制数据
 * @param   { string }            DeviceNo        设备号
 * @returns { DeviceControlBO }
 */
export const ControlDataFormat = (deviceControl: DeviceControlVO, DeviceNo: string): DeviceControlBO => {
  return {
    // ...JSON.parse(deviceControl.SequenceIn), // 控制数据的位置信息{ i: '', x: '', y: '', w:'',h:'' }
    ...DATA_TYPE_CONFIG[deviceControl.DataType], // 数据类型配置{ icon: '', componentType: '', data: [] }
    // i: String(deviceControl.Id), // 位置id,必须在...JSON.parse(deviceControl.SequenceIn)后面，覆盖因为新增导致SequenceIn中的i为空
    AutoControl: deviceControl.AutoControl,
    isAssCtrlModel: deviceControl.AutoControl === false, // 只有 AutoControl 为 false 的控制量要关联控制模式
    isLoading: true,
    disabled: true,
    disableTitle: '控制数据加载中...',
    Id: deviceControl.Id,
    AccessoryId: deviceControl.AccessoryId,
    SequenceOut: deviceControl.SequenceOut,
    SequenceIn: deviceControl.SequenceIn,
    DataName: deviceControl.ControlName,
    dataFormat: deviceControl.Format, // deviceControl.dataFormat 数据定义的格式转换
    dataType: deviceControl.DataKey, // 数据定义的数据输入标识
    displayKey: deviceControl.DisplayKey || deviceControl.DataKey, // 数据定义的数据输出标识
    DeviceNo: DeviceNo, // 设备编码
    Associate: {
      key: deviceControl.AssociateKey || undefined,
      Unit: deviceControl.AssociateUnit || undefined, //  ！！！！！！不应该绑定该值，而是直接从接口获取
      Format: deviceControl.AssociateFormat || undefined,
      DataType: deviceControl.AssociateDataType || undefined
    },
    Unit: deviceControl.Unit, // 数据定义的单位
    DataValue: deviceControl.DataValue || '',
    historyValue: {}
  }
}
/**
 * 对格式化后的控制数据绑定mqtt数据
 * @param   { DeviceControlBO }   controlData   格式化后的设备控制数据
 * @param   { Object }            mqttData      当前设备返回过来的mqtt数据
 * @param   { string }            deviceNo      设备号
 */
export const ControlDataBindMqttData = (controlData: DeviceControlBO, mqttData, deviceNo: string) => {
  const { displayKey } = controlData
  if (mqttData[deviceNo]['data'][displayKey] !== undefined) {
    controlData.disableTitle = '数据下发中...'
    controlData.DataValue = mqttData[deviceNo]['data'][displayKey]
    controlData.historyValue[mqttData[deviceNo]['ts']] = mqttData[deviceNo]['data'][displayKey]
    controlData.disabled = false
  } else {
    controlData.disableTitle = '数据标识不存在'
  }
  controlData.isLoading = false
}
