<!--
 * @Author: jiapeng.Zheng
 * @Date: 2019-06-26 14:29:25
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-05-19 14:36:40
 * @Description: 设备控制-报警
 -->
<template>
  <notice-list
    :deviceInfo="deviceInfo"
    :deviceSn="deviceInfo.DeviceSn"
    :deviceNo="deviceInfo.DeviceNo"
    :deviceWarnResetConf="deviceWarnResetConf"
    :isOnline="isOnline"
    :warnTypeId="warnTypeId"
    class="device-info-components app-device-error"
    ref="noticeList"
  ></notice-list>
</template>
<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator'

import NoticeList from '@views/notice/list.vue'

import DeviceApi from '@helper/apis/device.js'
import { DEVICE_WARN_RESET } from '@constants/deviceConfig/index.js'

@Component({ components: { NoticeList } })
export default class WarnModule extends Vue {
  /**
   * 设备信息
   */
  @Prop({
    default() {
      return { DeviceSn: '' }
    }
  })
  deviceInfo: DeviceVO
  @Prop({ default: 'offLine' })
  deviceState: DeviceStateBO

  warnTypeId = '0'
  deviceWarnResetConf: DeviceConfigVO = null

  get isOnline() {
    return this.deviceState === 'onLine'
  }

  @Watch('deviceInfo.DeviceSn')
  onDeviceInfoChange(newVal) {
    this.getNoticeData(newVal)
    this.getWarnResertConfig(newVal)
  }

  created() {
    this.getNoticeData(this.deviceInfo.DeviceSn)
    this.getWarnResertConfig(this.deviceInfo.DeviceSn)
  }

  getNoticeData(deviceSn: string) {
    const $noticeList = this.$refs.noticeList as any
    if ($noticeList) {
      $noticeList.searchForm.deviceSn = deviceSn
      // $noticeList.searchForm.typeId = this.warnTypeId
      $noticeList.handleRefresh()
    }
  }

  getWarnResertConfig(deviceSn: string) {
    DeviceApi.getDeviceInfo(deviceSn)
      .then((res: DeviceVO) => {
        for (const i of res.ConfigData) {
          // 获取设备版本信息
          if (DEVICE_WARN_RESET === i.Category) {
            this.deviceWarnResetConf = i
          }
        }
      })
      .catch(err => {
        this.$message.error(`根据deviceSn=${deviceSn}获取设备配置失败:${String(err)}`)
      })
  }
}
</script>
<style lang="scss">
@import '~@assets/scss/variables.scss';
@import '~@assets/scss/mixins.scss';
// 设备报警
.app-device-error {
  height: 100%;
  position: relative;
  padding: 0;
  margin: 0;
  width: auto;
  overflow: auto;
  .el-card {
    border: 0;
    box-shadow: none;
    margin-bottom: 0;
    border-radius: 0;
    &.search-card {
      .el-card__body {
        padding-bottom: 0;
        @include flex-title-between;
      }
    }
  }
}
</style>
