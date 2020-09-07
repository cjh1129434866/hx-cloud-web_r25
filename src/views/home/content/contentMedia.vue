<!--
 * @Author: jiapeng.Zheng
 * @Date: 2019-06-26 14:29:25
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-04-08 17:21:14
 * @Description: 首页-设备-图片/视频
 -->
<template>
  <div class="content-media">
    <div class="media-switch-btn">
      <span
        :class="[{ active: activePanel === deviceImagePanel }]"
        @click="
          () => {
            activePanel = deviceImagePanel
          }
        "
        >{{ $t('image') }}</span
      >
      <span
        :class="[{ active: activePanel === deviceVideoPanel }]"
        @click="
          () => {
            activePanel = deviceVideoPanel
          }
        "
        >{{ $t('video') }}</span
      >
    </div>
    <!-- 设备图片 -->
    <device-info-img
      v-show="activePanel === deviceImagePanel"
      class="device-media-info"
      :deviceSn="deviceInfo.DeviceSn"
      :deviceInfo="deviceInfo"
      :deviceTypeName="$commonParam.deviceTypeNameDict[deviceInfo.TypeId]"
      @handRefresh="onHandRefresh"
      @deviceImageSuccess="onDeviceImageSuccess"
      :height="`100%`"
    ></device-info-img>
    <!-- 摄像头 -->
    <device-Info-video
      v-if="activePanel === deviceVideoPanel"
      class="device-media-info"
      :deviceSn="deviceInfo.DeviceSn"
      :deviceInfo="deviceInfo"
      @handRefresh="onHandRefresh"
      :height="`100%`"
    ></device-Info-video>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { DEVICE_IMAGE_PANEL, DEVICE_VIDEO_PANEL } from '@constants/panelConfig'
// import DevicePanelApi from '@helper/apis/panel.js'
import deviceInfoImg from '@views/device/deviceInfoImg.vue'
import deviceInfoVideo from '@views/device/deviceInfoVideo.vue'

@Component({ components: { deviceInfoImg, deviceInfoVideo } })
export default class ContentMedia extends Vue {
  @Prop()
  deviceInfo: DeviceVO

  deviceImagePanel = DEVICE_IMAGE_PANEL
  deviceVideoPanel = DEVICE_VIDEO_PANEL
  activePanel = DEVICE_IMAGE_PANEL

  async created() {
    // // ---------------设备面板面板----------------------
    // const panels = await DevicePanelApi.getDevicePanels(this.deviceInfo.DeviceSn)
    // this.panelList = panels.list
  }
  onHandRefresh() {
    // TO-DO
  }
  onDeviceImageSuccess() {
    // TO-DO
  }
}
</script>
<style lang="scss" scoped>
@import '~@assets/scss/variables.scss';
.content-media {
  position: relative;
  font-size: $font-small;
  .media-switch-btn {
    position: absolute;
    top: 1em;
    z-index: 10;
    right: 1em;
    & > span {
      margin-left: 1em;
      border-radius: 1em;
      padding: 0.25em 1em;
    }
  }
  .device-media-info {
    margin: 0;
    height: 100%;
  }
}
</style>
