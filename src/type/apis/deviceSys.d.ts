/*
 * @Author: jiapeng.Zheng
 * @Date: 2019-08-27 09:36:45
 * @LastEditors: jiapeng.Zheng
 * @LastEditTime: 2019-09-02 10:31:22
 * @Description: 子系统
 */
/**
 * 验证
 */
type ValidateBO = {
  [propName: string]: {
    /**
     * 是否通过验证
     */
    isValidate: boolean
    /**
     * 验证不通过时显示的信息
     */
    validateMsg: string
  }
}
/**
 * 保存、新增时的验证
 */
type AddOrEditValidate = {
  /**
   * isEdit用来显示不同的操作按钮以及控制表格编辑框的显示:
   * true  表示该数据准备修改（启用编辑框、显示保存按钮、删除按钮结合isEdit进行功能切换：若isSave为true切换为服务端删除onDelClick，为false切换为客户端删除onAddDelClick）;
   * false 表示该数据已经修改完毕且更新成功（禁用编辑框、显示编辑按钮、删除按钮功能切换为服务端删除onDelClick）;
   */
  isEdit: boolean
  /**
   * isSave用来区分调用保存Or新增接口:
   * ture  表示该数据来源于服务器,调用保存接口;
   * false 表示该数据来源于手动添加且还未保存到服务器，调用新增接口;
   */
  isSave: boolean
  /**
   * 验证
   */
  validate: ValidateBO
}

/**
 * 新增Or修改时传递的参数
 */
type SystemControlDTO = {
  Id: number
  /**
   * 所属配件编号
   */
  AccessoryId: string
  ControlName: string
  /**
   * 默认控制值
   */
  DataValue: string
  /**
   * 设备数据定义标示
   */
  DataDefineId: number
  /**
   * 关联数据定义ID
   */
  AssociateDefineId: number
  /**
   * 组内排序（配件内控制项之间的排序），json格式的字符串
   */
  SequenceIn: string
  /**
   * 组间排序（配件之间的排序），json格式的字符串
   */
  SequenceOut: string
  /**
   * 用于标识该数据定义受不受手自动的影响（true：自动模式下允许操作；false：自动模式下不允许操作）
   * 子系统没有AutoControl，默认为 true
   */
  AutoControl: true
}

/**
 * 子系统控制数据(SystemControlDTO & AddOrEditValidate)
 */
type SystemControlBO = SystemControlDTO &
  AddOrEditValidate & {
    /**
     * 数据定义Key（输入标识）
     */
    DataKey: string
    /**
     * 关联数据定义Key（关联数据定义主要是用作显示）
     */
    AssociateKey: string
  }

/**
 * api接口返回的子系统控制数据
 */
type SystemControlVO = SystemControlDTO & SystemControlDataDefined

/**
 * api接口返回子系统配件
 */
type AccessoriesVO = {
  Id: string
  /**
   * 配件svg图标
   */
  ICON: string
  /**
   * 该配件下的控制项
   */
  List: Array<SystemControlVO>
  Name: string
  /**
   * 该配件所属的子系统ID
   */
  SystemId: number
}
/**
 * 子系统配件 (AccessoriesVO & AddOrEditValidate)
 */
type AccessoriesBO = AccessoriesVO & AddOrEditValidate
/**
 * 子系统
 */
type DeviceSysVO = { Accessories: Array<AccessoriesVO>; DeviceSn: string; Id: number; Name: string; Order: number }
