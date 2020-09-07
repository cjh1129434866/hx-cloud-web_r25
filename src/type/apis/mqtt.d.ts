/*
 * @Author       : jiapeng.Zheng
 * @Date         : 2020-05-19 10:26:50
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-05-22 15:35:17
 * @Description  :
 */
/**
 * 设备控制指令
 */
type ctrlAction = 'writedata' | 'readdata'
/**
 * 设备应答指令
 */
type ackAction = 'write_ack' | 'read_ack' | 'error' | 'timing_upload' | 'timing_upload2' | 'timing_upload3'
/**
 * 设备升级指令
 */
type updateAction = 'update'
/**
 * 设备升级请求状态
 */
type updataReqState = 'request'
/**
 * 设备升级应答状态
 */
type updataAckState = 'ready' | 'refuse'
/**
 * 设备分包下发升级文件状态
 */
type sendDataState = 'complete' | 'error'
type dataValue = string | number | boolean
/**
 * 获取设备数据类型或对某一设备参数进行修改
 * 即对设备当前各种指标的控制，如运行时间的设置/开关的启停...(MqttDataReq.action 必须等于"writedata")，
 * @see "alldata" 代表获取所有的指标值(MqttDataReq.action 必须等于"readdata")
 * @see "info" 代表获取设备控制无关的值，如设备版本、场站名称等(action 必须等于"readdata")
 * @see "error" 代表获取设备错误信息(MqttDataReq.action 必须等于"readdata")
 */
type mqttDataType = { [dataKey: string]: dataValue } | 'alldata' | 'info' | 'error'

/**
 * 要操作的数据定义的详细信息，
 * 主要用于日志记录和数据下发
 */
interface MqttDataCtrlVO {
  /**
   * 数据定义Key(数据下发时的key)
   */
  dataKey: string
  /**
   * 数据定义Key(数据返回时的key,用户若未配置则默认等于dataKey)
   */
  displayKey:string
  /**
   * 变更后数据定义值
   */
  dataValue: dataValue
  /**
   * 变更前数据定义值
   */
  dataValueOld: dataValue
  /**
   * 数据定义名称
   */
  dataName: string
}

/**
 * 设备控制请求
 */
interface MqttDataReq {
  /**
   * 设备的 DeviceNo
   */
  uuid: string
  /**
   * 设备的操作指令,
   * "writedata":代表对设备进行控制;
   * "readdata":代表获取设备的值;
   */
  action: ctrlAction
  /**
   *  获取设备数据类型或对某一设备参数进行修改
   */
  data: mqttDataType
  /**
   * 时间
   */
  ts: string
}
/**
 * 通过mqtt获取到的数据/设备控制应答
 */
interface MqttDataAck {
  /**
   * 设备的 DeviceNo
   */
  uuid: string
  /**
   * 设备的操作指令
   */
  action: ackAction
  /**
   * 数据定义，即设备当前各种指标的值，如电量、水量、开关转态等
   */
  data: {
    [dataKey: string]: dataValue
  }
  /**
   * 各种自定义的与控制无关的数据值，如设备版本、场站名称等
   */
  info: {
    [infoKey: string]: string
  }
  /**
   * 错误信息
   */
  error: {
    [errorKey: string]: boolean
  }
  /**
   * 时间
   */
  ts: string
}

/**
 * 设备升级请求
 */
interface UpdataReq {
  /**
   * 设备的 DeviceNo
   */
  uuid: string
  /**
   * 对设备升级的操作指令
   */
  action: updateAction
  /**
   * 当前的升级状态
   */
  state: updataReqState
  /**
   * 设备要升级的版本号，设备通过该版本判断是否需要升级
   * "version"包含六部分(v1.0.0)，定义如下：
   *    "v"	固定值，小写
   *    "1"	大版本号，如对大版本号不敏感，可设为"x"，底层将不予以区分
   *    "."	固定值，分隔符
   *    "0"	中版本号，如对中版本号不敏感，可设为"x"，底层将不予以区分
   *    "."	固定值，分隔符
   *    "0"	小版本号，如对小版本号不敏感，可设为"x"，底层将不予以区分
   */
  version: string
  /**
   * 升级文件类型
   */
  Level: number
  /**
   * 升级文件（程序）名称
   * 用于匹配升级文件和底层程序，它所对应的字符串必需完全一致才匹配升级，
   * 如"SoftwareName":"E1-OM501"与"SoftwareName":"E1-OM501-1"是不匹配的对象，
   * 下位机会对其进行判断，上位机无须判断。
   */
  SoftwareName: string
}
/**
 * 设备升级请求应答
 */
interface UpdataAck {
  /**
   * 设备的 DeviceNo
   */
  uuid: string
  /**
   * 对设备升级的操作指令
   */
  action: updateAction
  /**
   * 当前的升级状态
   */
  state: updataAckState
}
/**
 * 设备升级文件分包下发
 */
interface UpdataSendData {
  /**
   * 设备的 DeviceNo
   */
  uuid: string
  /**
   * 对设备升级的操作指令
   */
  action: updateAction
  /**
   * 当前下发包的索引
   */
  package: number
  /**
   * 总分包数
   */
  allpackage: number
  /**
   * 当前包的数据，可以为二进制和十六进制
   *【十进制模式】
   * 1、BIN包的数据大小必须为4的整数倍；
   * 2、全程BIN包的大小不可改变；
   * 3、最后数据包不足整包的以255填充；
   * 【十六进制HEX模式】
   * 1、BIN包的大小必须为4的整数倍；
   * 2、全程BIN包的大小不可改变；
   * 3、最后数据包不足整包的以0xFF填充；
   */
  bin: number[] | string[]
  ts: string
}
/**
 * 设备分包接收升级文件后的应答
 */
interface UpdataSendDataAck {
  /**
   * 设备的 DeviceNo
   */
  uuid: string
  /**
   * 对设备升级的操作指令
   */
  action: updateAction
  /**
   * 当前设备接收到的包索引
   */
  package: number
  /**
   * 设备接收到包的状态
   */
  state: sendDataState
  /**
   * 时间
   */
  ts: string
}
