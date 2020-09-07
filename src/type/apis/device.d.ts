/*
 * @Author: jiapeng.Zheng
 * @Date: 2019-06-26 14:29:25
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-05-22 16:32:52
 * @Description: 与设备关联的VO
 */
/**
 * 设备配置信息
 */
type DeviceConfigVO = {
  /**
   * 配置信息的类型，参考：src\constants\deviceConfig\index.js
   */
  Category: string
  /**
   * 配置信息绑定的数据定义的格式转换规则
   * 例："{"step":100}"
   */
  DefineFormat: string
  // DefineId: 3726
  /**
   * 配置信息绑定的数据定义的key
   */
  DefineKey: string
  /**
   * 配置信息绑定的数据定义的类型
   */
  DefineType: string
  /**
   * 配置信息绑定的数据定义的单位，
   * 例："["Flow","m3/H"]"
   */
  DefineUnit: string
  // DeviceSn: "f0f7591fafe945b3ba750a6c1030edf1"
  // Id: 402
  Name: string
  /**
   * 前端生成的该配置对应的控制量的值
   */
  val: string
  /**
   * 前端生成的该配置对应的控制量是否在获取数据
   */
  isLoading: boolean
}

/**
 * 用于界面上显示的“设备”的数据结构
 */
type DeviceVO = {
  Address: string
  /**
   * 设备所属站场的地域
   */
  AreaId: string
  //   AreaName: null
  //   DeviceDescription: '异龙镇左所村100T贝斯'
  /**
   * 设备名称
   */
  DeviceName: string
  /**
   * 设备号，通过该编码订阅mqtt主题，获取设备数据
   */
  DeviceNo: string
  /**
   * 设备编号（系统自动生成）
   */
  DeviceSn: string
  /**
   * 设备所属站场、项目构成的id，例子：项目ID/子项目ID/.../站场ID
   */
  FullId: string
  /**
   * 设备所属站场、项目构成的名称，例子：项目名称/子项目名称/.../站场名称
   */
  FullName: string
  /**
   * 最近在线时间
   */
  Online: string
  /**
   * 前端根据 Online（最近在线时间）计算出来的当前设备是否在线
   */
  _isOnline: boolean
  /**
   * 前端根据 $mqtt_error_data（$vuexSetDeviceError） 计算出来的当前设备是否有报警信息
   */
  _isWarn: boolean
  Position: string
  /**
   * 前端根据 Position、Position、RegionId判断计算出来的坐标
   */
  lnglatXY: Array<string | number>
  //   ProductTime: '2018-12-23T09:52:09.81'
  //   ProjectId: 232
  /**
   * 设备所属站场的区域
   */
  RegionId: string
  //   RegionName: null
  //   RegionPath: null
  //   Token: '9baa3bad40914445b50bb2afb519d133'
  /**
   * 设备类型ID
   */
  TypeId: number
  //   UseTime: '2018-12-23T09:52:09.81'
  /**
   * 设备配置信息
   */
  ConfigData?: Array<DeviceConfigVO>
}

/**
 * 调用“设备”api接口时上传的参数
 */
type DevicePageDTO = {
  /**
   * 站场ID（无项目的站场编号不用输入即可）
   */
  projectId?: string
  /**
   * 页码
   */
  pageNo: number
  /**
   * 页大小
   */
  pageSize: number
  /**
   * 排序的字段
   */
  sortData: string
  /**
   * 排序类型(asc或者desc)
   */
  sortType: string
  /**
   * 查询字段：设备名称，为空('')时查询所有
   */
  DeviceName?: string
  /**
   * 查询字段：设备类型，为空('')时查询所有
   */
  TypeId?: string
}

/**
 * 设备控制数据
 */
type DeviceControlVO = {
  /**
   * 该控制项所属配件的ID
   */
  AccessoryId: string

  /**
   * 关联数据的数据定义的类型
   */
  AssociateDataType: string
  // AssociateDefineId: 3557
  /**
   * 关联数据的数据定义的格式转换规则
   * 例如："{"step":100}"
   */
  AssociateFormat: string
  /**
   * 关联数据的数据定义, 为了区分当前值(AssociateKey)与设定值(DataKey)
   */
  AssociateKey: string
  /**
   * 关联数据的数据定义的单位
   * 例如："["frequency","HZ"]"
   */
  AssociateUnit: string
  /**
   * 控制量名称
   */
  ControlName: string
  // DataDefineId: 3564
  /**
   * 该控制项所属数据定义中的数据输入标识，用于向设备发送数据
   */
  DataKey: string
  /**
   * 控制量类型
   */
  DataType: string
  /**
   * 默认值
   */
  DataValue: string
  // DeviceSn: "7fd019c23a5347389377b440f2d2fdf5"
  /**
   * 该控制项所属数据定义中的数据输出标识，用于接收设备发送过来的数据，为空时使用 DataKey 的值
   */
  DisplayKey: string
  /**
   * 该控制项所属数据定义的格式转换规则
   * 例如："{"step":100}"
   */
  Format: string
  // IState: 0
  Id: number
  /**
   * 用于标识该数据定义受不受手自动的影响（true：自动模式下允许操作；false：自动模式下不允许操作）
   */
  AutoControl: boolean
  /**
   * 该控制项在所属配件中的位置信息
   * 例："{"i":"","x":3,"y":3,"w":9,"h":4}"
   */
  SequenceIn: string
  /**
   * 该控制项所属配件和其他配件之间的位置信息
   * 例："{"i":"946d03168cba4b0593cb91bbd92a7e0f","w":12,"h":3,"x":0,"y":0}"
   */
  SequenceOut: string
  /**
   * 该控制项所属数据定义的单位
   * 例如："["frequency","HZ"]"
   */
  Unit: string
}
/**
 * 设备控制数据 DeviceControlVO 格式化后的形式
 */
type DeviceControlBO = {
  // ...JSON.parse(element.SequenceIn), // 控制数据的位置信息{ i: '', x: '', y: '', w:'',h:'' }
  //       ...DATA_TYPE_CONFIG[element.DataType], // 数据类型配置{ icon: '', componentType: '', data: [] }
  // icon: string
  // componentType: string
  /**
   * 该控制项代表的组件类型
   * ...DATA_TYPE_CONFIG[DeviceControlVO.DataType] 添加的配置信息
   */
  componentDataType: string
  // componentDataValue: string
  /**
   * 该控制项所属配件的ID
   */
  AccessoryId: string
  /**
   * 位置id,必须在...JSON.parse(element.SequenceIn)后面，覆盖因为新增导致SequenceIn中的i为空
   */
  // i: string
  /**
   * 该控制项目是否关联控制模式，即能否在自动模式下启用
   */
  isAssCtrlModel: boolean
  /**
   * 是否加载中
   */
  isLoading: boolean
  /**
   * 是否可用
   */
  disabled: boolean
  /**
   * 控制项不可用时的提示名称
   */
  disableTitle: string
  /**
   * 等于 DeviceControlVO 中的 ID
   */
  Id: number
  /**
   * 控制量名, 等于 DeviceControlVO 中的 ControlName
   */
  DataName: string
  /**
   * 该控制项所属数据定义的格式转换规则, 等于 DeviceControlVO 中的 Format
   * 例如："{"step":100}"
   */
  dataFormat: string
  /**
   * 该控制项所属数据定义中的数据输入标识，用于向设备发送数据, 等于 DeviceControlVO 中的 DataKey
   */
  dataType: string
  /**
   * 数据定义的数据输出标识
   * 等于 DeviceControlVO.DisplayKey || DeviceControlVO.DataKey
   */
  displayKey: string
  /**
   * 设备编码
   */
  DeviceNo: string
  /**
   * 用于标识该数据定义受不受手自动的影响（true：自动模式下允许操作；false：自动模式下不允许操作）
   */
  AutoControl: boolean
  /**
   * 关联数据信息
   */
  Associate: {
    /**
     * 关联数据的数据定义, 为了区分当前值(DeviceControlVO.AssociateKey)与设定值(DeviceControlVO.DataKey)，
     * 等于 DeviceControlVO.AssociateKey
     */
    key: string
    /**
     *   /**
     * 关联数据的数据定义的单位
     * 例如："["frequency","HZ"]"
     * 等于 DeviceControlVO.AssociateUnit
     */
    Unit: string
    /**
     * 关联数据的数据定义的格式转换规则,例如："{"step":100}"；
     * 等于 DeviceControlVO.AssociateFormat
     */
    Format: string
    /**
     * 关联数据的数据定义的类型
     * 等于 DeviceControlVO.AssociateDataType
     */
    DataType: string
  }
  /**
   * 该控制项在所属配件中的位置信息
   * 例："{"i":"","x":3,"y":3,"w":9,"h":4}"
   */
  SequenceIn: string
  /**
   * 该控制项所属配件和其他配件之间的位置信息
   * 例："{"i":"946d03168cba4b0593cb91bbd92a7e0f","w":12,"h":3,"x":0,"y":0}"
   */
  SequenceOut: string
  /**
   * 数据定义的单位, 等于 DeviceControlVO 中的 Unit
   */
  Unit: Array<string>
  /**
   * 通过控制量绑定的数据定义从mqtt中获取到的原始值，初始化化时使用 DeviceControlVO 中的 DataValue
   */
  DataValue: string
  /**
   * 历史数据
   */
  historyValue: any
}

type DeviceControlBOPick = Pick<DeviceControlBO, 'isLoading' | 'disabled' | 'dataType' | 'displayKey' | 'DataName' | 'DataValue'>

/**
 * 设备配件信息
 */
type DeviceAccessoryVO = {
  // DeviceSn: "7fd019c23a5347389377b440f2d2fdf5"
  // ICON: null
  /**
   * 配件ID
   */
  Id: string
  /**
   * 配件名称
   */
  Name: string
  /**
   * 前端手动添加的该配件的控制信息
   */
  ControlData: Array<DeviceControlBO>
  /**
   * 前端手动添加的该配件的布局信息
   */
  layout: { xs: number; sm: number; md: number; lg: number }
}
/**
 * 当前统计信息包含的设备（主要用来统计设备的在线/离线）
 */
type DeviceOverViewDataBO = {
  /**
   *  设备名称
   */
  DeviceName: string
  /**
   * 设备编码
   */
  DeviceNo: string
  /**
   * 设备序列号
   */
  DeviceSn: string
  /**
   * 最近在线时间
   */
  Online: string
  /**
   * 设备类型
   */
  TypeId: number
}
