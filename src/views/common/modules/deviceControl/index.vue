<!--
 * @Author: jiapeng.Zheng
 * @Date: 2019-06-26 14:29:25
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-05-19 15:07:58
 * @Description: 设备控制（其中包含：首页、工艺、模式、报警 4个模块）
 -->
<template>
  <div :class="['device-control', $style['device-control'], { [$style['full-screen']]: isFull, [$style['isFull']]: isFull }]">
    <div :class="[$style['module-tool-btns']]">
      <!-- 只有“模式”模块下有刷新按钮 -->
      <!-- <span v-if="showModuleIndex === 2" class="text-link" @click="getControlleDataByMqtt">{{ $t('refreshs') }} </span>
      <span v-if="showModuleIndex !== 0 && showModuleIndex !== 1" class="text-link" >{{ $t('disposed') }} </span>
      <span
        v-if="showModuleIndex !== 0 && showModuleIndex !== 1"
        class="text-link"
        @click="
          () => {
            isFull = !isFull
          }
        "
        >{{ isFull ? $t('reduce') : $t('full') }}</span
      > -->
    </div>
    <div :class="[$style['module'], 'module']">
      <component
        :is="moduleLists[showModuleIndex].component"
        :deviceInfo="deviceInfo"
        :deviceState="deviceState"
        :controlFormatList="controlFormatList"
        :deviceAccessory="deviceAccessory"
        @onFullClick="
          flag => {
            isFull = flag
          }
        "
        @getData="getData"
        @getControlleDataByMqtt="getControlleDataByMqtt"
      ></component>
    </div>
    <div :class="['module-tab', $style['module-tab']]">
      <div
        v-for="(m, index) in moduleLists"
        :key="index"
        :style="{ width: `${100 / moduleLists.length}%` }"
        :class="['tab-item', $style['tab-item'], { active: showModuleIndex === index }]"
        @click="
          () => {
            showModuleIndex = index
          }
        "
      >
        <icon :name="m.icon" :class="[$style['icon']]"></icon>
        <span>{{ m.name }}</span>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Watch, Emit, Vue } from 'vue-property-decorator'

import { DECIVE_ONLINE_TIME, DECIVE_RECOVERY_TIME } from '@constants/index'

import HomeModule from './homeModule.vue'
import TechnologyModule from './technologyModule.vue'
import ControlModelModule from './controlModelModule.vue'
import WarnModule from './warnModule.vue'

import { ControlDataFormat } from './utils/index'
import { $utils } from '@helper'
import DeviceControlApi from '@helper/apis/deviceControl'
import DeviceApi from '@helper/apis/device.js'
import DeviceAccessoryApi from '@helper/apis/deviceAccessory.js'

@Component({ components: { HomeModule, TechnologyModule, ControlModelModule, WarnModule } })
export default class DeviceControl extends Vue {
  /**
   * 设备信息
   */
  @Prop({
    default() {
      return { DeviceNo: '' }
    }
  })
  deviceInfo: DeviceVO

  isFull = false // 是否全屏
  topicIndex: number | null = null // 订阅的主题索引
  hasTopicArrive = false // 在超时时间内是否有数据到达，用于手动刷新整个控制项
  lastDataTime = '' // 最新一条数据到达的时间
  deviceState: DeviceStateBO = 'onLine' // 设备状态，默认在线
  thisInterval: number | null = null
  // $style = {} // 开启 css module 后会在计算属性computed中引入该变量$style，在这里定义是为了解决开发时页面频繁刷新导致获取不到 $style 的bug

  get moduleLists(): Array<ModuleBO> {
    return [
      { name: this.$t('HomePage').toString(), icon: 'menu/home', component: HomeModule },
      { name: this.$t('technology').toString(), icon: 'menu/technology', component: TechnologyModule },
      { name: this.$t('mode').toString(), icon: 'menu/controlMode', component: ControlModelModule },
      { name: this.$t('alert').toString(), icon: 'notice/alert', component: WarnModule }
    ]
  }
  // 默认显示哪一个模块
  showModuleIndex = 2
  /**
   * 原始控制量
   */
  controlList: Array<DeviceControlVO> = []
  /**
   * 格式化后的控制量
   */
  controlFormatList: Array<DeviceControlBO> = []
  /**
   * 配件
   */
  deviceAccessory: Array<DeviceAccessoryVO> = []

  @Watch('deviceInfo.DeviceNo')
  async onDeviceInfoChange(newVal, oldVal) {
    // 销毁旧设备的主题
    if (oldVal && this.topicIndex) {
      this.destroyTopic(oldVal, this.topicIndex)
    }
    // 重新订阅新设备的主题
    if (newVal) {
      this.topicIndex = await this.subscribeTopic(newVal)
    }
    // 重新获取数据
    this.getData(this.deviceInfo.DeviceSn)
  }
  @Watch('$mqttIsConnect')
  async onMqttIsConnectChange(newValue) {
    // 当mqtt连接成功时才订阅主题
    if (newValue === true) {
      this.topicIndex = await this.subscribeTopic(this.deviceInfo.DeviceNo)
    }
  }
  @Watch('$mqtt_device_data')
  onMqttDeviceDataChange(message) {
    this.hasTopicArrive = true // 能获取到数据
    const dataTime = $utils.mqttReceiveDateFormat(message[this.deviceInfo.DeviceNo]['ts'])
    this.lastDataTime = dataTime
    // 数据的有效时间是否在4分钟(DECIVE_ONLINE_TIME)内
    this.deviceState = $utils.dateCompare(Date.now(), dataTime, 'ms') <= DECIVE_ONLINE_TIME ? 'onLine' : 'offLine' // 设备在线
  }
  @Watch('deviceState')
  onDeviceStateChange(nv: DeviceStateBO) {
    // 手动获取数据（deviceState === unknown）时，开启定时器，判断 DECIVE_RECOVERY_TIME 时间内是否有数据到达
    if (nv === 'unknown') {
      // 设置定时器
      let timeOutId: number | null = setTimeout(() => {
        clearTimeout(timeOutId)
        timeOutId = null
        // 若在规定的时间 DECIVE_RECOVERY_TIME 内还未回复则表示为离线
        if (!this.hasTopicArrive) {
          this.deviceState = 'offLine' // 设备离线（超时）
          // this.$message.warning('暂时获取不到设备控制数据')
        }
      }, DECIVE_RECOVERY_TIME)
    }
  }

  // 遍历格式化控制量controlList,生成符合前端需求的数据格式 controlFormatList
  @Watch('controlList')
  @Emit('onControlFormatListChange')
  onControlListChange(controlList: Array<DeviceControlVO>) {
    const controlFormatList: DeviceControlBO[] = []
    // 遍历格式化控制量
    controlList.forEach(element => {
      const ctrl: DeviceControlBO = ControlDataFormat(element, this.deviceInfo.DeviceNo)
      controlFormatList.push(ctrl)
    })
    this.controlFormatList = controlFormatList
    return controlFormatList
  }

  // -------------------------------- 生命周期 ---------------------------------------
  async created() {
    this.getData(this.deviceInfo.DeviceSn)
    // 每隔 DECIVE_ONLINE_TIME 判断最后一条数据的时间(lastDataTime)是否超过 DECIVE_ONLINE_TIME 规定的值，从而判断设备是否在线
    this.thisInterval = setInterval(() => {
      if (this.lastDataTime) {
        this.deviceState = $utils.dateCompare(Date.now(), this.lastDataTime, 'ms') <= DECIVE_ONLINE_TIME ? 'onLine' : 'offLine' // 设备在线
      }
    }, DECIVE_ONLINE_TIME)
    if (!this.topicIndex) {
      this.topicIndex = await this.subscribeTopic(this.deviceInfo.DeviceNo)
    }
  }

  async activated() {
    // 重新订阅被 deactivated 销毁的主题
    if (!this.topicIndex) {
      this.topicIndex = await this.subscribeTopic(this.deviceInfo.DeviceNo)
    }
  }

  deactivated() {
    this.destroyTopic(this.deviceInfo.DeviceNo, this.topicIndex)
  }
  destroyed() {
    this.destroyTopic(this.deviceInfo.DeviceNo, this.topicIndex)
    clearInterval(this.thisInterval)
    this.thisInterval = null
  }

  // -------------------------------- 组件本身的方法 ---------------------------------------

  getData(deviceSn: string) {
    this.getAccessoryAndControlItem(deviceSn)
  }

  /**
   * 根据设备序列号获取设备的配件和控制数据
   * @param {string} deviceSn 设备序列号
   */
  getAccessoryAndControlItem(deviceSn: string) {
    // 获取设备配件
    DeviceAccessoryApi.getAllDeviceAccessory(deviceSn)
      .then((res: { AccessoryList: Array<DeviceAccessoryVO> }) => {
        this.deviceAccessory = res.AccessoryList
        DeviceApi.getDeviceControlData(deviceSn)
          .then((res: AllDataListVO<DeviceControlVO>) => {
            this.controlList = res.list
          })
          .catch(err => {
            this.$message.error(`根据deviceSn=${deviceSn}获取设备控制量失败:${String(err)}`)
          })
      })
      .catch(err => {
        this.$message.error(`根据deviceSn=${deviceSn}获取设备配件失败:${String(err)}`)
      })
  }

  /**
   * 订阅主题
   */
  async subscribeTopic(deviceNo: string) {
    let topicIndex
    if (this.$mqttIsConnect) {
      this.hasTopicArrive = false // 订阅设备之前，把 hasTopicArrive 置为false
      // 订阅设备状态，为了实时更新设备状态（服务器2分钟返回1次数据）
      topicIndex = await DeviceControlApi.subscribeAllDeviceData(deviceNo, message => {
        this.$store.commit('$vuexSetMqttDeviceData', message)
      })
      // 订阅成功后，主动通过mqtt获取设备数据，防止两分钟内无数据上来时页面呈现 loading 状态
      this.getControlleDataByMqtt()
    }

    return topicIndex
  }
  /**
   * 销毁订阅的主题
   */
  destroyTopic(deviceNo: string, topicIndex?: number) {
    if (topicIndex !== null) {
      DeviceControlApi.destroyedDevicePubMessageArrived(deviceNo, [topicIndex])
    }
    this.topicIndex = null
  }

  /**
   * 通过mqtt获取控制数据，可用于手动刷新
   */
  getControlleDataByMqtt() {
    try {
      this.hasTopicArrive = false
      this.deviceState = 'unknown' // 手动设置当前状态为 unknown ,由于 watch 监听了 deviceState , 此时会启动定时器用来判断设备规定时间内是否返回了数据

      // this.$forceUpdate()
      // 获取设备控制数据，（主动获取设备控制数据，防止超时）
      // let onceTopicIndex = await
      DeviceControlApi.getAllDeviceData(this.deviceInfo.DeviceNo, message => {
        this.$store.commit('$vuexSetMqttDeviceData', message)
      })
      // 保存订阅的主题索引
      // this.topicObj[this.deviceInfo.DeviceNo].push(onceTopicIndex)
    } catch (e) {
      this.$message.error(String(e))
    }
  }
}
</script>
<style lang="scss" module>
@import '~@assets/scss/variables.scss';
$tab-height: 50px;
.device-control {
  display: flex;
  flex-direction: column;
  position: relative;
  &.full-screen.isFull {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    margin: 0;
    padding: 0;
    height: 100%;
    z-index: $full-screen-index;
  }
  .module-tool-btns {
    position: absolute;
    height: 42px;
    line-height: 42px;
    margin-right: 1em;
    z-index: 5;
    right: 0;
  }
  .module {
    height: calc(100% - #{$tab-height});
  }
  .module-tab {
    cursor: pointer;
    display: flex;
    // border-top: 5px solid;
    height: $tab-height; //+ 5px;
    font-size: $font-medium;
    .tab-item {
      padding: $spacing-medium-size;
      display: flex;
      align-items: center;
      justify-content: center;
      .icon {
        font-size: 20px;
        margin-right: 10px;
      }
    }
  }
}
</style>
