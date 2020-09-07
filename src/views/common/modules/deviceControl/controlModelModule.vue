<!--
 * @Author: jiapeng.Zheng
 * @Date: 2019-06-26 14:29:25
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-05-22 16:33:27
 * @Description: 设备控制-模式
 * @Bug: 还未对接设备上的4种中自定义；
 -->
<template>
  <div :class="$style['control-mode-wrap']">
    <!-- 头部右侧按钮 -->
    <div :class="$style['abs-header']">
      <!-- 刷新按钮 -->
      <i class="el-icon-refresh hover" :class="$style['abs-header-btn']" :title="$t('refreshs')" @click="onRefreshClick"></i>
      <!-- 设置下拉按钮：配置、全屏 -->
      <el-dropdown trigger="click" :class="$style['abs-header-btn']" @command="handleCommand">
        <i class="el-icon-s-tools hover"></i>
        <el-dropdown-menu slot="dropdown" class="device-control-dropdown-menu">
          <!-- 保存模板 -->
          <el-dropdown-item command="SaveAsTemplate">{{ $t('saveAs') + $t('template') }}</el-dropdown-item>
          <!-- 设备升级 -->
          <el-dropdown-item command="DeviceUpgrade">{{ $t('device') + $t('upgrades') + deviceVersionConf.val }}</el-dropdown-item>
          <!-- 配置 -->
          <el-dropdown-item command="ConfigPage">{{ $t('config') }}</el-dropdown-item>
          <!-- 全屏 -->
          <el-dropdown-item command="Full">{{ isFull ? $t('reduce') : $t('full') }}</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <!-- 配置页面 -->
      <el-dialog
        :title="`${deviceInfo.DeviceName}: ${$t('config')}${isConfigDataChange ? ' *' : ''}`"
        fullscreen
        append-to-body
        v-if="isConfigPageShow"
        :visible.sync="isConfigPageShow"
      >
        <config-page :deviceInfo="deviceInfo" :isConfigDataChange.sync="isConfigDataChange"></config-page>
        <div slot="footer">
          <el-button type="cancel" @click="isConfigPageShow = false">{{ $t('close') }}</el-button>
        </div>
      </el-dialog>
      <!-- 设备升级弹窗 -->
      <device-upgrade :typeId="deviceInfo.TypeId" :deviceNo="deviceInfo.DeviceNo" :nowVersion="deviceVersionConf.val" v-model="isUpgradeShow"></device-upgrade>
    </div>
    <el-tabs
      v-if="deviceState === 'onLine'"
      v-loading="deviceState === 'unknown'"
      element-loading-text="连接设备中..."
      v-model="activeName"
      :class="[$style['control-mode'], 'control-mode']"
    >
      <!-- 1、调试模式（控制时需判断当前是手动还是自动状态） -->
      <el-tab-pane name="debug" :class="[$style['tab-pane']]">
        <span slot="label">{{ $t('debug') }}</span>
        <div :class="[$style['tab-pane-title'], 'tab-pane-title']" v-if="ctrlModeConf">
          <!-- 调试模式：手自动切换 -->
          <div
            v-loading="ctrlModeConf.isLoading"
            :class="[$style['control-btn'], 'control-btn', { active: key === ctrlModeConf.val }]"
            v-for="(value, key) in deviceConfigCof[ctrlModeConf.Category].category"
            :key="key"
            @click="onCtrlModeChange(key)"
          >
            {{ value }}
          </div>
        </div>
        <EasyScrollbar :barOption="barOption" :class="[$style['tab-pane-scroll']]">
          <!-- 调试模式：各种开关（只有在手动状态下可以控制） -->
          <div :class="[$style['tab-pane-content']]">
            <Iswitch
              :skinCof="{ style: '1', activeClass: 'active' }"
              :class="[$style['control-btn'], 'control-btn', { [$style['disabled']]: itemData.disabled }]"
              v-for="(itemData, index) in debugList"
              :key="index"
              :data="itemData"
              :ctrlModeConf="ctrlModeConf"
              :title="itemData.disabled ? itemData.disableTitle : itemData.DataName"
              :disabled="itemData.disabled || deviceState === 'offLine'"
              v-model="itemData.DataValue"
              v-loading="deviceState === 'offLine' ? false : itemData.isLoading"
              @change="switchChange(itemData)"
              >{{ itemData.DataName }}</Iswitch
            >
            <div v-if="debugList.length <= 0" :class="[$style['no-data']]">{{ $t('nodata') }}</div>
          </div>
        </EasyScrollbar>
      </el-tab-pane>
      <!-- 2、自动模式（若自动模式数据为空则不显示该Tab） -->
      <el-tab-pane v-if="autoRunModel.length > 0" name="autoRun" :class="[$style['tab-pane']]">
        <span slot="label">{{ $t('autoRun') }}</span>
        <div :class="[$style['tab-pane-title'], 'tab-pane-title']">
          <!-- 第一级模式（目前仅支持两级模式） -->
          <template v-for="(item, index) in autoRunModel">
            <div
              :key="index"
              @click="
                () => {
                  parentAutoRunModelId = item.Id
                }
              "
              :class="[$style['control-btn'], 'control-btn', { active: item.Id === parentAutoRunModelId }]"
            >
              {{ item.Name }}
            </div>
          </template>
        </div>
        <EasyScrollbar :barOption="barOption" :class="[$style['tab-pane-scroll']]">
          <div :class="[$style['tab-pane-content']]">
            <template v-for="(item, index) in autoRunModel">
              <!-- 第二级模式（目前仅支持两级模式） -->
              <div
                v-for="(childrenItem, childrenIndex) in item.Child"
                :key="`${index}_${childrenIndex}`"
                v-loading="deviceState === 'offLine' ? false : childrenItem.isLoading"
                v-show="parentAutoRunModelId === item.Id"
                :class="[
                  $style['control-btn'],
                  'control-btn',
                  { active: childrenItem.Id === activeAutoRunModelId },
                  { [$style['disabled']]: childrenItem.disabled || deviceState === 'offLine' }
                ]"
                @click="runModelSelect(childrenItem, childrenItem.Id === activeAutoRunModelId)"
              >
                {{ childrenItem.Name }}
              </div>
            </template>
          </div>
        </EasyScrollbar>
      </el-tab-pane>
      <!-- 3、自定义模式 -->
      <el-tab-pane name="customRun" :class="[$style['tab-pane'], $style['custom-run-model'], 'custom-run-model']">
        <span slot="label">{{ $t('customRun') }}</span>
        <div :class="[$style['tab-pane-title'], 'tab-pane-title']">
          <!-- 自定义1 ~ n -->
          <div :class="[$style['custom-btns']]">
            <div
              v-for="item in customRunsModel"
              :key="item.Value"
              @click="
                () => {
                  selectCustomRunModel = item
                }
              "
              :class="[$style['control-btn'], 'control-btn', { active: selectCustomRunModel && item.Value === selectCustomRunModel.Value }]"
            >
              {{ item.Name }}
            </div>
          </div>
          <!-- 启动（只有设备类型上配置了自定义模式且选择的不是默认的模式，才显示启动按钮） -->
          <div
            v-if="hasCustomRunModel && isSelectCustomRunModel"
            v-loading="deviceState === 'offLine' ? false : selectCustomRunModel.isLoading"
            :class="[$style['run-btn'], 'run-btn', { active: isStartUpCustomRunModel }, { [$style['disabled']]: selectCustomRunModel.disabled || deviceState === 'offLine' }]"
            @click="runModelSelect(selectCustomRunModel, isStartUpCustomRunModel)"
          >
            {{ $t('startUp') }}
          </div>
        </div>
        <EasyScrollbar :barOption="barOption" :class="[$style['tab-pane-scroll']]" v-show="isSelectCustomRunModel">
          <div :class="[$style['tab-pane-content']]">
            <div :class="[$style['accessory-item-wrap'], 'accessory-item-wrap']">
              <div :class="[$style['accessory-item'], 'accessory-item']" v-for="item in customRunList" :key="item.Id">
                <span :class="[$style['accessory-name-wrap'], 'accessory-name-wrap']" :title="item.Name">
                  <span :class="[$style['accessory-name']]">{{ item.Name }}</span>
                  <icon :class="[$style['accessory-name-icon'], 'accessory-name-icon']" name="menu/double-arrow-right"></icon>
                </span>
                <div :class="[$style['accessory-control'], 'accessory-control']">
                  <div :class="[$style['control-item'], 'control-item']" v-for="ctrlData in item.ControlData" :key="ctrlData.DataKey">
                    <span :class="[$style['control-item-name'], 'control-item-name']" :title="ctrlData.DataName">{{ ctrlData.DataName }}</span>
                    <set-and-now-input
                      :class="[$style['set-and-now-input'], { [$style['disabled']]: ctrlData.disabled }]"
                      :disabled="ctrlData.disabled || deviceState === 'offLine'"
                      :title="ctrlData.disabled ? ctrlData.disableTitle : ctrlData.DataName"
                      :controlName="item.Name"
                      :data="ctrlData"
                      v-model="ctrlData.DataValue"
                      v-loading="deviceState === 'offLine' ? false : ctrlData.isLoading"
                      @change="switchChange(ctrlData, item.Name)"
                    ></set-and-now-input>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </EasyScrollbar>
      </el-tab-pane>
      <!-- 4、检修模式 -->
      <el-tab-pane name="recondition" :class="[$style['tab-pane']]">
        <span slot="label">{{ $t('recondition') }}</span>
        <!-- <div :class="[$style['tab-pane-title'], 'tab-pane-title']"></div> -->
        <EasyScrollbar :barOption="barOption" :class="[$style['tab-pane-scroll']]">
          <div :class="[$style['tab-pane-content']]">
            <Iswitch
              :skinCof="{ style: '1', activeClass: 'active' }"
              :class="[$style['control-btn'], 'control-btn', { [$style['disabled']]: itemData.disabled }]"
              v-for="(itemData, index) in reconditionList"
              :key="index"
              :data="itemData"
              :ctrlModeConf="ctrlModeConf"
              :title="itemData.disabled ? itemData.disableTitle : itemData.DataName"
              :disabled="itemData.disabled || deviceState === 'offLine'"
              v-model="itemData.DataValue"
              v-loading="deviceState === 'offLine' ? false : itemData.isLoading"
              @change="switchChange(itemData)"
              >{{ itemData.DataName }}</Iswitch
            >
            <div v-if="reconditionList.length <= 0" :class="[$style['no-data']]">{{ $t('nodata') }}</div>
          </div>
        </EasyScrollbar>
      </el-tab-pane>
      <!-- 子系统 -->
      <el-tab-pane v-for="subSys in deviceSubSystemList" :key="subSys.Id" :class="[$style['tab-pane']]">
        <span slot="label">{{ subSys.Name }}</span>
        <EasyScrollbar :barOption="barOption" :class="[$style['tab-pane-scroll']]">
          <sub-system :subSystem="subSys" :deviceInfo="deviceInfo" :deviceState="deviceState" :ctrlModeConf="ctrlModeConf" :_$style="$style"></sub-system>
        </EasyScrollbar>
      </el-tab-pane>
    </el-tabs>
    <!-- 设备离线时 -->
    <div v-else v-loading="deviceState === 'unknown'" element-loading-text="连接设备中..." :class="[$style['control-mode'], 'control-mode', $style['off-line']]">
      <span v-if="deviceState === 'offLine'">
        暂时获取不到设备控制数据，设备可能处于离线状态中，请尝试
        <span class="text-link" @click="onRefreshClick">{{ $t('refreshs') }}</span>
      </span>
    </div>
  </div>
</template>
<script lang="ts">
import { MessageBoxInputData } from 'element-ui/types/message-box'
import { Component, Prop, Watch, Emit, Vue } from 'vue-property-decorator'

import DeviceApi from '@helper/apis/device.js'
import DeviceControlApi from '@helper/apis/deviceControl'
import DeviceTypeApi from '@helper/apis/deviceType.js'
import DeviceSysApi from '@helper/apis/deviceSys.js'
import { $validate } from '@helper'
import { ControlDataBindMqttData } from './utils/index'
import $mqttData from '@/prototype/mqttData.js'
import { DATA_TYPE_STRING, DATA_TYPE_DATETIME, DATA_TYPE_SELECT, DATA_TYPE_BOOLEAN } from '@constants/dataTypeConfig/index.js'
import { TYPE_AUTO_SCHEMA, TYPE_CUSTOM_SCHEMA } from '@constants/deviceTypeConfig/index.js'
// import { RUN_TIME_YMD, RUN_TIME_Y, RUN_TIME_M, RUN_TIME_D, SHUT_DOWN, CTRL_MODE, CTRL_MODE_CHECK, DEVICE_CONFIG } from '@constants/deviceConfig'
import { CTRL_MODE, CTRL_MODE_CHECK, DEVICE_VERSION, DEVICE_CONFIG } from '@constants/deviceConfig/index.js'
import { BAR_OPTION } from '@constants/easyScrollbarConfig/index.js'

import SubSystem from '@views/common/modules/deviceControl/controlModelModule/subSystem.vue'
import ConfigPage from '@views/common/modules/deviceControl/controlModelModule/configPage.vue'
import DeviceUpgrade from '@views/device/upgrade.vue'

@Component({ components: { SubSystem, ConfigPage, DeviceUpgrade } })
export default class ControlModelModule extends Vue {
  // ---------------------------------------- Prop ----------------------------------------------------
  /**
   * 设备信息
   */
  @Prop({
    default() {
      return { DeviceSn: '' }
    }
  })
  deviceInfo: DeviceVO
  @Prop({ default: 'unknown' })
  deviceState: DeviceStateBO

  @Prop({
    default() {
      return []
    }
  })
  controlFormatList: Array<DeviceControlBO>

  @Prop({
    default() {
      return []
    }
  })
  deviceAccessory: Array<DeviceAccessoryVO>

  // ---------------------------------------- Data ----------------------------------------------------

  /**
   * EasyScrollbar 滚动条配置
   */
  barOption = BAR_OPTION
  // $style = {} // 开启 css module 后会在计算属性computed中引入该变量$style，在这里定义是为了解决开发时页面频繁刷新导致获取不到 $style 的bug
  deviceConfigCof = DEVICE_CONFIG // 设备配置信息的配置
  deviceConfigs: Array<DeviceConfigVO> = [] // 设备配置信息
  // 设备配置信息中的“控制模式”
  ctrlModeConf: DeviceConfigVO = {
    Name: '',
    Category: CTRL_MODE,
    DefineFormat: '',
    DefineKey: '',
    DefineType: DATA_TYPE_BOOLEAN,
    DefineUnit: '',
    val: '',
    isLoading: true
  }
  // 设备配置信息中的“设备版本”
  deviceVersionConf: DeviceConfigVO = {
    Name: '',
    Category: '',
    DefineFormat: '',
    DefineKey: '',
    DefineType: '',
    DefineUnit: '',
    val: '',
    isLoading: true
  }
  activeName: ActiveModelBO = 'debug'
  autoRunModel: Array<RunModelBO> = [] // 自动运行模式数据
  parentAutoRunModelId: number = null // 激活的自动运行模式的上级模式（目前仅支持两级模式）
  activeAutoRunModelId: number = null // 激活的自动运行模式（目前仅支持两级模式）
  hasCustomRunModel = false // 设备类型上是否配置了自定义默认
  startUpCustomRunModel: RunModelBO = null // 当前启动的自定义模式
  selectCustomRunModel: RunModelBO = null // 选择的自定义模式
  // 默认的自定义模式（即当自定义模式为空时，默认显示自定义模式）
  defaultCustomRunModel: RunModelBO = {
    Id: null,
    Name: '自定义',
    Value: null,
    Key: null,
    isLoading: false,
    disabled: false,
    SchemaType: TYPE_CUSTOM_SCHEMA,
    Child: []
  }
  customRunsModel: Array<RunModelBO> = [] // 自定义运行模式
  customRunList: Array<DeviceAccessoryVO> = [] // 自定义运行模式数据
  debugList: Array<DeviceControlBO> // 调试
  reconditionList: Array<DeviceControlBO> // 检修
  deviceSubSystemList: Array<DeviceSysVO> = [] // 设备子系统

  isFull = false // 是否全屏
  isConfigPageShow = false // 是否显示配置弹窗
  isUpgradeShow = false // 是否显示升级弹窗
  isConfigDataChange = false // 当前的配置信息是否发生了改变

  // ---------------------------------------- Watch ----------------------------------------------------
  @Watch('isConfigPageShow')
  onIsConfigPageShowChange(val: boolean) {
    // 当"配置信息窗口"关闭且“配置信息”发生变更,才重新获取数据
    if (!val && this.isConfigDataChange) {
      this.getData(this.deviceInfo.DeviceSn) // 重新获取数据
      this.onRefreshClick() // 刷新
    }
  }

  // 1-1-1、从配置信息 deviceConfigs 中筛选出“控制模式”(即手/自动)
  @Watch('deviceConfigs')
  onDeviceConfigsChange(configData: Array<DeviceConfigVO>) {
    for (const i of configData) {
      // 获取“控制模式”,从设备的配置信息中筛选出“控制模式”的配置信息，若同时配置了CTRL_MODE, CTRL_MODE_CHECK，忽略 CTRL_MODE_CHECK
      if ([CTRL_MODE, CTRL_MODE_CHECK].indexOf(i.Category) > -1) {
        Object.assign(this.ctrlModeConf, i)
        this.$set(this.ctrlModeConf, 'val', '')
        this.$set(this.ctrlModeConf, 'isLoading', true)
      }
      // 获取设备版本信息
      if (DEVICE_VERSION === i.Category) {
        this.deviceVersionConf = i
        if (this.$mqtt_device_data[this.deviceInfo.DeviceNo]) {
          this.deviceVersionConf.val = this.$mqtt_device_data[this.deviceInfo.DeviceNo].data[i.DefineKey] || ''
        }
      }
    }
    this.setMqttDeviceData()
  }

  // 实时处理设备传递过来的数据
  @Watch('$mqtt_device_data')
  onMqttDeviceDataChange(newValue) {
    // 绑定设备控制数据
    this.messageArrived(this.controlFormatList)(newValue)
    // 绑定"设备版本"的值
    if (this.deviceVersionConf) {
      this.deviceVersionConf.val = newValue[this.deviceInfo.DeviceNo].data[this.deviceVersionConf.DefineKey] || ''
    }
    // 绑定控制模式值（即调试中的手自动）
    const { DefineKey, DefineFormat, DefineType } = this.ctrlModeConf
    let ctrlModeStatuVal = newValue[this.deviceInfo.DeviceNo].data[DefineKey]
    ctrlModeStatuVal = $mqttData.outFormat({ Format: DefineFormat, DataType: DefineType }, ctrlModeStatuVal)
    this.$set(this.ctrlModeConf, 'val', ctrlModeStatuVal)
    this.$set(this.ctrlModeConf, 'isLoading', false)
    // 绑定自定运行模式的值（目前仅支持两级模式）
    this.activeAutoRunModelId = null // 清空激活的自动模式
    this.autoRunModel.forEach(ele => {
      const subAutoRunMode = ele.Child.find(subEle => {
        this.$set(subEle, 'isLoading', false)
        this.$set(subEle, 'disabled', false)
        if (String(newValue[this.deviceInfo.DeviceNo].data[subEle.Key]) === String(subEle.Value)) {
          this.activeAutoRunModelId = subEle.Id
          return true
        }
      })
      if (subAutoRunMode) {
        this.parentAutoRunModelId = ele.Id
      }
    })
    // 绑定自定义模式的值（目前仅支持顶级模式）
    this.selectCustomRunModel = this.defaultCustomRunModel // 清空选择的自定义模式
    this.startUpCustomRunModel = null
    this.customRunsModel.forEach(ele => {
      this.$set(ele, 'isLoading', false)
      this.$set(ele, 'disabled', false)
      if (String(newValue[this.deviceInfo.DeviceNo].data[ele.Key]) === String(ele.Value)) {
        this.selectCustomRunModel = ele
        this.startUpCustomRunModel = ele
      }
    })
  }

  /**
   * 2、根据 controlFormatList 生成对应模式数据
   */
  @Watch('controlFormatList')
  onControlFormatListChange(controlFormatList: Array<DeviceControlBO>) {
    const accessoryList = this.deviceAccessory
    // 为配件新增控制数据字段
    for (const i in accessoryList) {
      accessoryList[i].ControlData = []
      accessoryList[i].layout = { xs: 24, sm: 24, md: 12, lg: 12 }
      controlFormatList.forEach((element, index) => {
        // 根据配件ID（AccessoryId）把控制数据存放到配件（AccessoryList）的ControlData中
        // 同时过滤掉非 DATA_TYPE_STRING 、 DATA_TYPE_DATETIME、DATA_TYPE_SELECT 类型的数据
        if (
          element.AccessoryId === accessoryList[i].Id &&
          (element.componentDataType === DATA_TYPE_STRING || element.componentDataType === DATA_TYPE_DATETIME || element.componentDataType === DATA_TYPE_SELECT)
        ) {
          Object.assign(accessoryList[i], JSON.parse(element.SequenceOut)) // 配件的位置信息
          // accessoryList[i].i = accessoryList[i].Id // 覆盖由模板生成过来的配件的位置信息{ i: '', x: '', y: '', w:'',h:'' }中的 i 属性
          // accessoryList[i].isResizable = true
          accessoryList[i].ControlData.push(controlFormatList[index])
        }
      })
    }
    // 自定义：过滤掉控制项为空的配件
    this.customRunList = accessoryList.filter(accessory => {
      return accessory.ControlData.length > 0
    })
    // 调试
    this.debugList = controlFormatList.filter(ele => {
      return ele.componentDataType === DATA_TYPE_BOOLEAN && ele.AutoControl === false
    })
    // 检修
    this.reconditionList = controlFormatList.filter(ele => {
      return ele.componentDataType === DATA_TYPE_BOOLEAN && ele.AutoControl === true
    })

    this.setMqttDeviceData()
  }

  @Watch('deviceInfo.DeviceSn')
  async onDeviceInfoChange(newVal) {
    this.getData(newVal)
  }

  // ---------------------------------------- Computed ----------------------------------------------------

  /**
   * 是否选择了某一自定义模式
   */
  get isSelectCustomRunModel() {
    return !!this.selectCustomRunModel
  }

  /**
   * 是否启动了某一自定义模式
   */
  get isStartUpCustomRunModel() {
    return !!(this.startUpCustomRunModel && this.selectCustomRunModel.Id === this.startUpCustomRunModel.Id)
  }

  // -------------------------------- 组件生命周期 ---------------------

  async created() {
    // 1、获取数据
    this.getData(this.deviceInfo.DeviceSn)
  }

  // -------------------------------- 数据获取函数 ---------------------

  /**
   * 根据设备序列号获取设备的数据
   * @param {string} deviceSn 设备序列号
   */
  getData(deviceSn: string) {
    this.getDeviceConfig(deviceSn)
    this.getRunModel(this.deviceInfo.TypeId)
    this.getSubSystem(deviceSn)
    this.onControlFormatListChange(this.controlFormatList)
  }

  /**
   * 从 vuex 中获取设备的控制数据，并重新调用 onMqttDeviceDataChange 方法
   */
  setMqttDeviceData() {
    // 当设备在线时，且$mqtt_device_data中有当前设备的数据时，手动设置控制量的值
    if (this.deviceState === 'onLine' && this.$mqtt_device_data[this.deviceInfo.DeviceNo]) {
      this.onMqttDeviceDataChange(this.$mqtt_device_data)
    }
  }

  /**
   * 1-1、根据设备序列号获取设备的配置信息（1-1-1）
   * @param {string} deviceSn 设备序列号
   */
  getDeviceConfig(deviceSn: string) {
    DeviceApi.getDeviceInfo(deviceSn)
      .then((res: DeviceVO) => {
        // 1-1-1、保存设备配置信息，此时会调用 onDeviceConfigsChange 方法
        this.deviceConfigs = res.ConfigData
      })
      .catch(err => {
        this.$message.error(`根据deviceSn=${deviceSn}获取设备配置失败:${String(err)}`)
      })
  }
  /**
   * 1-2、根据设备类型获取设备的自动模式（目前仅支持两级模式）和自定义模式（目前仅支持顶级的自定义模式）
   * @param {string} deviceSn 设备类型
   */
  getRunModel(typeId: number) {
    this.hasCustomRunModel = false
    DeviceTypeApi.getTypeSchema(String(typeId))
      .then((result: { List: Array<RunModelBO> }) => {
        const autoRunModel: Array<RunModelBO> = []
        const customRunsModel: Array<RunModelBO> = []
        result.List.forEach(ele => {
          if (String(ele.SchemaType) === TYPE_AUTO_SCHEMA) {
            // 自动模式
            autoRunModel.push({
              ...ele,
              isLoading: false,
              disabled: false
            })
          } else {
            this.hasCustomRunModel = true
            // 自定义模式
            customRunsModel.push({
              ...ele,
              isLoading: false,
              disabled: false
            })
          }
        })
        this.autoRunModel = autoRunModel
        this.customRunsModel = customRunsModel
        // 若自定义模式为空时，显示默认的自定义模式
        if (customRunsModel.length <= 0) {
          this.customRunsModel = [this.defaultCustomRunModel]
          this.selectCustomRunModel = this.defaultCustomRunModel
        }
        if (autoRunModel.length <= 0 && this.activeName === 'autoRun') {
          this.activeName = 'debug'
        }
      })
      .catch(errMsg => {
        console.error(errMsg)
        this.$message.error(String(errMsg))
      })
    // {"0":"标准负荷","1":"高负荷","2":"低负荷","3":"水量不足"}
    // this.autoRunModel = [
    //   {
    //     Name: '高负荷',
    //     Value: '1',
    //     Child: [
    //       { Name: '高总氮', Value: '1-1', Child: [] },
    //       { Name: '高COD', Value: '1-2', Child: [] },
    //       { Name: '高磷', Value: '1-3', Child: [] },
    //       { Name: '高SS', Value: '1-4', Child: [] }
    //     ]
    //   },
    //   {
    //     Name: '标准负荷',
    //     Value: '2',
    //     Child: [{  Name: '设计负荷', Value: '2-1', Child: [] }]
    //   },
    //   {
    //     Name: '低负荷',
    //     Value: '3',
    //     Child: [{ Name: '低污染', Value: '3-1', Child: [] }, {  Name: '高污染', Value: '3-2', Child: [] }]
    //   },
    //   {
    //     Name: '水量不足',
    //     Value: '4',
    //     Child: [
    //       { Name: '低水量', Value: '4-1', Child: [] },
    //       { Name: '超低水量', Value: '4-2', Child: [] },
    //       { Name: '间歇性运行水量', Value: '4-3', Child: [] }
    //     ]
    //   }
    // ]
  }
  /**
   * 1-3、根据设备序列号获取设备子系统
   * @param {string} deviceSn 设备序列号
   */
  getSubSystem(deviceSn: string) {
    DeviceSysApi.getDeviceSystemList(deviceSn)
      .then(res => {
        this.deviceSubSystemList = res.List
        if (this.deviceSubSystemList.length === 0) {
          this.activeName = 'debug'
        }
      })
      .catch(errMsg => {
        console.error(errMsg)
        this.$message.error(String(errMsg))
      })
  }

  // -------------------------------- 设备控制 ---------------------

  // mqtt消息处理函数
  messageArrived(ControlData: Array<DeviceControlBO>) {
    return message => {
      const deviceNo = this.deviceInfo.DeviceNo
      // // 处理那些数据标识有误的控制项
      // for (let i in data) {
      //   let { ControlData } = data[i]
      // }
      for (const dataKey in ControlData) {
        ControlDataBindMqttData(ControlData[dataKey], message, deviceNo)
        // let { displayKey } = ControlData[dataKey]
        // if (message[this.deviceInfo.DeviceNo]['data'][displayKey] !== undefined) {
        //   ControlData[dataKey].disableTitle = '数据下发中...'
        //   ControlData[dataKey].DataValue = message[deviceNo]['data'][displayKey]
        //   ControlData[dataKey].historyValue[message[deviceNo]['ts']] = message[deviceNo]['data'][displayKey]
        //   ControlData[dataKey].disabled = false
        // } else {
        //   ControlData[dataKey].disableTitle = '数据标识不存在'
        // }
        // ControlData[dataKey].isLoading = false
      }
    }
  }
  // 设备控制
  async switchChange(item: DeviceControlBOPick, groupName = '') {
    const value = item // as DeviceControlBO
    value.isLoading = true
    value.disabled = true
    const mqttDataObj: MqttDataCtrlVO = {
      dataKey: value.dataType,
      displayKey: value.displayKey,
      dataName: `${groupName}${value.DataName}`,
      dataValueOld: this.$mqtt_device_data[this.deviceInfo.DeviceNo].data[value.displayKey], // 原始值
      dataValue: value.DataValue // 要变更的值
    }
    const { IsAccess, Message, data } = await DeviceControlApi.controlleDevice(this.deviceInfo, mqttDataObj)
    if (!IsAccess) {
      this.$message.error(Message)
    }
    this.$store.commit('$vuexSetMqttDeviceData', data)
  }

  // 控制模式切换（调试下手自定切换）
  onCtrlModeChange(value) {
    const { DefineKey, DefineFormat, DefineType, Name } = this.ctrlModeConf
    const ctrlModeStatuVal = $mqttData.inFormat({ Format: DefineFormat, DataType: DefineType }, value)
    this.ctrlModeConf.val = ctrlModeStatuVal
    this.ctrlModeConf.isLoading = true
    this.switchChange({ isLoading: false, disabled: false, dataType: DefineKey, displayKey: DefineKey, DataValue: ctrlModeStatuVal, DataName: Name })
  }

  /**
   * 自动运行下和自定义运行下，各种模式切换
   * @param {RunModelBO} val 各种模式
   * @param {boolean} isActived 该模式是否已经激活
   */
  async runModelSelect(item: RunModelBO, isActived: boolean) {
    // isLoading 防止多次下发, isActived 防止多次启动
    if (!item.isLoading && !isActived) {
      this.$set(item, 'isLoading', true)
      this.$set(item, 'disabled', true)
      const mqttDataObj: MqttDataCtrlVO = {
        dataKey: item.Key,
        displayKey: item.Key,
        dataName: item.Name,
        dataValueOld: this.$mqtt_device_data[this.deviceInfo.DeviceNo].data[item.Key], // 原始值
        dataValue: item.Value // 要变更的值
      }
      const { IsAccess, Message, data } = await DeviceControlApi.controlleDevice(this.deviceInfo, mqttDataObj)
      // 是否有权限控制设备
      if (!IsAccess) {
        this.$message.error(Message)
      }
      this.$store.commit('$vuexSetMqttDeviceData', data)
    }
  }

  // ----------------- 下拉组件事件 -----------------
  handleCommand(command) {
    this[`on${command}Click`]()
  }
  // 全屏切换
  @Emit('onFullClick')
  onFullClick() {
    this.isFull = !this.isFull
    return this.isFull
  }
  // 保存为模板
  onSaveAsTemplateClick() {
    this.$prompt('请输入模板名称', this.$t('saveAs').toString() + this.$t('template').toString(), {
      cancelButtonClass: 'el-button--cancel',
      inputValidator: value => {
        const validate = $validate.lengthLimt(3, 20)
        return validate.validate(value) ? true : validate.rule().message
      }
    })
      .then(obj => {
        const data: DeviceTypeDTO = {
          TempName: (obj as MessageBoxInputData).value,
          IsStandard: false,
          DeviceSn: this.deviceInfo.DeviceSn,
          TypeId: this.deviceInfo.TypeId
        }
        DeviceTypeApi.typeTemplateAdd(data)
          .then(result => {
            this.$message.success(result.Message)
          })
          .catch(errMsg => {
            this.$message.error(String(errMsg))
            console.error(errMsg)
          })
      })
      .catch(err => {
        console.error(err)
      })
  }
  // 设备升级
  onDeviceUpgradeClick() {
    if (this.deviceVersionConf.val) {
      this.isUpgradeShow = true
    } else {
      this.$message.warning('获取不到设备的版本号，暂时无法升级')
    }
  }
  // 打开配置窗口
  onConfigPageClick() {
    this.isConfigPageShow = true
  }

  onRefreshClick() {
    // 调用父组件（src\views\common\modules\deviceControl\index.vue） 方法
    this.$emit('getControlleDataByMqtt')
    this.$emit('getData', this.deviceInfo.DeviceSn)
  }
}
</script>
<style lang="scss" module>
@import '~@assets/scss/variables.scss';
@import '~@assets/scss/mixins.scss';

// 自定义
@mixin custom-run-model() {
  &.custom-run-model {
    .tab-pane-title {
      justify-content: space-between;
    }
    .accessory-item-wrap {
      display: flex;

      flex-basis: 100%;
      flex-direction: row;
      flex-wrap: wrap;
      padding: 0 $spacing-large-size;
      // background: $white;
      .accessory-item {
        flex-basis: 100%;
        // padding: $spacing-size 0;
        border-bottom: 1px dotted;
        display: flex;
        align-items: center;
        &:last-child {
          border-bottom: none;
        }
        .accessory-name-wrap {
          flex-shrink: 0;
          // flex-basis: 20%;
          width: 20%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-right: $spacing-large-size;
          .accessory-name {
            display: inline-block;
            // flex-basis: 50%;
            font-size: $font-medium;
            @include text-overflow();
          }
          .accessory-name-icon {
            // flex-basis: 50%;
            text-align: center;
            font-size: $font-small;
          }
        }
        .accessory-control {
          // flex-basis: 80%;
          flex-grow: 1;
          display: flex;
          flex-wrap: wrap;
          // justify-content: space-around;
          .control-item {
            // flex-basis: 50%;
            width: 50%;
            display: flex;
            align-items: center;
            padding: 0 $spacing-size;
            margin: $spacing-small-size 0;
            border-right: 1px solid;
            &:last-child,
            &:nth-child(2n) {
              border-right: none;
            }
            &:last-child:first-child {
              width: 100%;
              flex-grow: 1;
              // .control-item-name {
              //   text-align: center;
              // }
            }
            .control-item-name {
              flex-grow: 1;
              font-size: $font-medium;

              text-align: center;
              @include text-overflow();
            }
            .set-and-now-input {
              width: 160px;
              flex-shrink: 0;
            }
          }
        }
      }
    }
  }
}
// 按钮
@mixin ctrl-btns() {
  $btn-width: 120px;
  $btn-height: 40px;
  // 控制按钮
  .control-btn {
    cursor: pointer;
    display: inline-block;
    box-shadow: $box-shadow;
    border-radius: $radius-size;
    background-color: $white;
    width: $btn-width; // 18%;
    height: $btn-height;
    line-height: $btn-height;
    margin: $spacing-small-size;
    padding: 0 $spacing-size;
    text-align: center;
    @include text-overflow();
    &.disabled {
      cursor: not-allowed;
      &:hover {
        border-color: $element-danger-color;
        color: $element-danger-color;
      }
    }
  }
  .tab-pane-title {
    .control-btn {
      margin-top: 0;
      margin-bottom: 0;
      width: $btn-width;
      height: $btn-height;
      border-radius: $btn-width;
    }
  }
  // 启动按钮（自定义运行下）
  .run-btn {
    cursor: pointer;
    height: $btn-height;
    line-height: 25px;
    padding: 5px;
    border: 2px solid hsla(0, 0%, 100%, 0.5);
    border-radius: 50%;
    text-align: center;
    &.disabled {
      cursor: not-allowed;
      &:hover {
        border-color: $element-danger-color;
        color: $element-danger-color;
      }
    }
  }
}
// ---------------------- 布局 --------------------
.control-mode-wrap {
  height: 100%;
  .abs-header {
    position: absolute;
    text-align: right;
    z-index: 1;
    padding-right: 20px;
    width: 100%;
    height: 40px;
    line-height: 40px;
    .abs-header-btn {
      margin-left: 0.5em;
    }
  }
}
.control-mode {
  .tab-pane {
    height: 100%;
    overflow: auto;
    display: flex;
    flex-direction: column;
    align-content: flex-start;
    overflow: hidden;
    .tab-pane-title {
      height: 70px;
      flex-shrink: 0;
      border-bottom: 1px solid;
      display: flex;
    }
    .tab-pane-scroll {
      height: 100%;
      flex-grow: 1;
      margin: $spacing-size 0 $spacing-size * 2 0;
      .tab-pane-content {
        overflow: auto;
        display: flex;
        flex-wrap: wrap;
        padding-top: $spacing-size;
        &:after {
          content: '';
          flex: auto;
        }
      }
    }
    // 自定义运行
    @include custom-run-model();
    // 按鈕
    @include ctrl-btns();
    .no-data {
      width: 100%;
      line-height: 2;
      text-align: center;
    }
  }
  &.off-line {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
