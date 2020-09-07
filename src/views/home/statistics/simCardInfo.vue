<!--
 * @Author: jiapeng.Zheng
 * @Date: 2019-09-29 16:46:19
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-05-19 15:07:48
 * @Description:
 -->
<template>
  <el-dialog :visible="isVisible" width="30%" class="edit-dialog" :close-on-click-modal="false" :show-close="false">
    <span slot="title" class="el-dialog__title">{{ deviceInfo && deviceInfo.DeviceNo }} info</span>
    <div v-loading="isLoading">
      <div style="padding:10px" v-for="(v, k) in simCard" :key="k">{{ k }} : {{ v }}</div>
    </div>
    <span slot="footer">
      <el-button type="cancel" @click="isVisible = false"> {{ $t('cancel') }}</el-button>
      <el-button type="primary" @click="isVisible = false"> {{ $t('confirm') }}</el-button>
    </span>
  </el-dialog>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Emit } from 'vue-property-decorator'

import DeviceControlApi from '@helper/apis/deviceControl'

@Component({})
export default class SimCardInfo extends Vue {
  @Prop({ default: false }) value: boolean
  @Prop({
    default() {
      return { DeviceSn: '', DeviceNo: '' }
    }
  })
  deviceInfo: DeviceVO

  isLoading = false
  isVisible = false
  simCard = {}
  simCardIdKey = '0C0A21'

  @Watch('value')
  onValuceChange(newVal) {
    this.isVisible = newVal
  }

  @Emit('input')
  @Watch('isVisible')
  onIsVisibleChange(newVal) {
    if (newVal) {
      this.getControlleDataByMqtt()
    }
    return newVal
  }

  getControlleDataByMqtt() {
    try {
      this.isLoading = true
      // 获取设备控制数据，（主动获取设备控制数据，防止超时）
      DeviceControlApi.getDeviceData(this.deviceInfo.DeviceNo, 'info', message => {
        this.simCard = message.info
        this.isLoading = false
        // this.$store.commit('$vuexSetMqttDeviceData', message)
      })
    } catch (e) {
      this.isLoading = false
      this.$message.error(String(e))
    }
  }

  // onSureClick() {
  //   this.isVisible = false
  // }
  // onClose() {
  //   this.isVisible = false
  // }
}
</script>

<style type="text/css" lang="scss"></style>
