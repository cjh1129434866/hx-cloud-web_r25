<!--
 * @Author: jiapeng.Zheng
 * @Date: 2019-08-30 16:46:36
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-05-22 17:34:06
 * @Description: 子系统
 -->

<template>
  <div :class="[$style['device-sub-system']]">
    <template v-if="!subSystem.Accessories.length">{{ $t('nodata') }}</template>
    <template v-else>
      <div :class="[_$style['tab-pane-content']]">
        <Iswitch
          :skinCof="{ style: '1', activeClass: 'active' }"
          :class="[_$style['control-btn'], 'control-btn', { [_$style['disabled']]: itemData.disabled }]"
          v-for="(itemData, index) in switchCtrlData"
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
      </div>
      <div :class="[_$style['tab-pane'], _$style['custom-run-model'], 'custom-run-model']">
        <div :class="[_$style['tab-pane-content']]">
          <div :class="[_$style['accessory-item-wrap'], 'accessory-item-wrap']">
            <div :class="[_$style['accessory-item'], 'accessory-item']" v-for="item in stringAccList" :key="item.Id">
              <span :class="[_$style['accessory-name-wrap'], 'accessory-name-wrap']" :title="item.Name">
                <span :class="[_$style['accessory-name']]">{{ item.Name }}</span>
                <icon :class="[_$style['accessory-name-icon'], 'accessory-name-icon']" name="menu/double-arrow-right"></icon>
              </span>
              <div :class="[_$style['accessory-control'], 'accessory-control']">
                <div :class="[_$style['control-item'], 'control-item']" v-for="ctrlData in item.ControlData" :key="ctrlData.DataKey">
                  <span :class="[_$style['control-item-name'], 'control-item-name']" :title="ctrlData.DataName">{{ ctrlData.DataName }}</span>
                  <set-and-now-input
                    :class="[_$style['set-and-now-input'], { [_$style['disabled']]: ctrlData.disabled }]"
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
      </div>

      <div :class="[$style['monitor-wrap']]">
        <monitor
          :class="[$style['content-item']]"
          class="content-item"
          v-for="itemData in monitorCtrlData"
          :key="itemData.Id"
          :data="itemData"
          :dataKey="itemData.Id"
          :title="itemData.DataName"
          :disabled="itemData.disabled"
          v-model="itemData.DataValue"
        ></monitor>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
// import { Component, Prop, Watch, Vue } from 'vue-property-decorator'
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

import { DATA_TYPE_STRING, DATA_TYPE_BOOLEAN } from '@constants/dataTypeConfig/index.js'
import { ControlDataFormat, ControlDataBindMqttData } from '../utils/index'
import DeviceControlApi from '@helper/apis/deviceControl'

@Component({})
export default class SubSystem extends Vue {
  /**
   * 子系统
   */
  @Prop({
    required: true,
    default() {
      return {}
    }
  })
  subSystem: DeviceSysVO
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
      return {}
    }
  })
  ctrlModeConf: DeviceConfigVO
  @Prop({
    default() {
      return {}
    }
  })
  _$style

  /**
   * 包含字符类型控制数据的配件
   */
  stringAccList: Array<DeviceAccessoryVO> = []
  /**
   * 开关类型控制数据
   */
  switchCtrlData: Array<DeviceControlBO> = []
  /**
   * 监控类型控制数据
   */
  monitorCtrlData: Array<DeviceControlBO> = []

  @Watch('subSystem')
  onSubSystemChange(nv: DeviceSysVO) {
    this.stringAccList = []
    this.switchCtrlData = []
    this.monitorCtrlData = []

    nv.Accessories.forEach(acc => {
      const stringCtrlData: Array<DeviceControlBO> = []
      acc.List.forEach(ctrl => {
        const ctrlDataFormat = ControlDataFormat(ctrl, this.deviceInfo.DeviceNo)
        ctrlDataFormat.isAssCtrlModel = false // 子系统暂不受手、自动的影响
        if (ctrlDataFormat.componentDataType === DATA_TYPE_BOOLEAN) {
          this.switchCtrlData.push(ctrlDataFormat)
        } else if (ctrlDataFormat.componentDataType === DATA_TYPE_STRING) {
          stringCtrlData.push(ctrlDataFormat)
        } else {
          this.monitorCtrlData.push(ctrlDataFormat)
        }
      })
      if (stringCtrlData.length) {
        this.stringAccList.push({
          Id: acc.Id,
          Name: acc.Name,
          ControlData: stringCtrlData,
          layout: null
        })
      }
    })
  }
  // 实时处理设备传递过来的数据
  @Watch('$mqtt_device_data')
  onMqttDeviceDataChange(message) {
    const deviceNo = this.deviceInfo.DeviceNo
    this.switchCtrlData.forEach(ele => {
      ControlDataBindMqttData(ele, message, deviceNo)
    })
    this.monitorCtrlData.forEach(ele => {
      ControlDataBindMqttData(ele, message, deviceNo)
    })
    this.stringAccList.forEach(acc => {
      acc.ControlData.forEach(ctrl => {
        ControlDataBindMqttData(ctrl, message, deviceNo)
      })
    })
  }

  created() {
    this.onSubSystemChange(this.subSystem)
    // 当设备在线时，且$mqtt_device_data中有当前设备的数据时，手动设置控制量的值
    if (this.deviceState === 'onLine' && this.$mqtt_device_data[this.deviceInfo.DeviceNo]) {
      this.onMqttDeviceDataChange(this.$mqtt_device_data)
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
}
</script>

<style lang="scss" module>
@import '~@assets/scss/variables.scss';
@import '~@assets/scss/mixins.scss';

.device-sub-system {
  .monitor-wrap {
    padding: 10px;
    display: flex;
    .content-item {
      padding: 0 10px;
      flex-basis: 25%;
      @include text-overflow();
    }
  }
}
</style>
