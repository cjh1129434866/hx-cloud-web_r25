<!--
 * @Author: jiapeng.Zheng
 * @Date: 2019-06-26 14:29:25
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-04-08 17:25:44
 * @Description:
 -->
<template>
  <div class="app-device-video">
    <div class="title text-title">{{ $t('deviceVideo') }}</div>

    <video-player :videoList="videoList" @onAddClick="onAddClick" @onDelClick="onDelClick" @onEditClick="onEditClick"></video-player>

    <el-dialog :visible="isVisible" v-if="videoPanelId" width="20%" class="edit-dialog" :close-on-click-modal="false" :show-close="false" ref="videoEditDialog">
      <span slot="title" class="el-dialog__title">{{ $t('edits') + $t('deviceVideo') }}</span>

      <video-panel-edit
        :isVisible="isVisible"
        :pdata="pdata"
        :editVideo="editVideo"
        ref="videoPanelEdit"
        @onSureClickCallBack="onSureClickCallBack(false)"
        @refreshPanel="onSureClickCallBack(true)"
      ></video-panel-edit>
      <span slot="footer">
        <el-button type="cancel" @click="isVisible = false">{{ $t('cancel') }}</el-button>
        <el-button type="primary" @click="onSureClick">{{ $t('confirm') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { DEVICE_VIDEO_PANEL } from '@constants/panelConfig'
// import videoPoster from '@img/videocam_black.png'

let self

export default {
  name: 'app-device-video',

  props: {
    deviceSn: {
      required: true,
      type: String
    },
    deviceInfo: {
      type: Object
    },
    height: {
      type: String,
      default: '200px'
    }
  },

  components: {
    videoPanelEdit: resolve => require.ensure([], () => resolve(require('@views/device/videoPanelEdit')), 'videoPanelEdit')
  },

  data() {
    return {
      isVisible: false,
      videoList: [], // 摄像头的配置
      playerFlag: 'myPlayer',
      pdata: {},
      editVideo: null
    }
  },
  watch: {
    deviceSn() {
      this.init()
    },
    isVisible(val) {
      if (val) {
        this.$nextTick(() => {
          document.body.appendChild(this.$refs.videoEditDialog.$el)
        })
      } else {
        document.body.removeChild(this.$refs.videoEditDialog.$el)
      }
    }
  },
  computed: {
    videoPanelId() {
      return this.$store.getters['devicePanel/getPanelId'](DEVICE_VIDEO_PANEL)
    }
  },

  created() {
    self = this
    this.init()
  },

  methods: {
    init() {
      // this.pdata = { ...this.deviceInfo, panelId: this.videoPanelId }
      // --------------摄像头-----------------------
      this.$apis.video
        .getDeviceVideo(this.deviceSn)
        .then(result => {
          this.videoList = result.list
        })
        .catch(errMsg => {
          self.$message.error(String(errMsg))
        })
    },

    // 删除摄像头
    onDelClick(id) {
      this.$apis.video
        .deleteDeviceVideo(id, this.deviceSn)
        .then(result => {
          this.$message.success(result.Message)
          this.init()
        })
        .catch(errMsg => {
          self.$message.error(errMsg)
        })
    },

    onEditClick(item) {
      this.isVisible = true
      this.editVideo = item
    },

    // 添加，新增摄像头前必须保证摄像头面板已经存在
    onAddClick() {
      if (this.videoPanelId) {
        this.pdata = { ...this.deviceInfo, panelId: this.videoPanelId }
        this.isVisible = true
        this.editVideo = null
      } else {
        // 添加摄像头面板
        this.$apis.panel
          .addPanel(DEVICE_VIDEO_PANEL, this.$t('deviceVideo'), this.deviceSn)
          .then(res => {
            this.$store.commit('devicePanel/addPanel', res)
            this.pdata = { ...this.deviceInfo, panelId: res.Id }
            // this.pdata.panelId = res.Id
            // this.refreshPanel() // 刷新panel.vue
            // this.$emit('handRefresh')
            this.isVisible = true
            this.editVideo = null
          })
          .catch(errMsg => {
            this.$message.error(String(errMsg))
            console.error(errMsg)
          })
        // this.$message.error(`${this.$t('deviceProdParm')}面板不存在`)
      }
    },
    onSureClick() {
      this.$refs.videoPanelEdit.onSureClick()
    },
    onSureClickCallBack(isVisible) {
      console.log('onSureClickCallBackonSureClickCallBack', isVisible)
      this.isVisible = isVisible
      this.init()
    }
  }
}
</script>
<style lang="scss">
@import '~@assets/scss/variables.scss';
.app-device-video {
  margin: 0 $spacing-size 5px $spacing-size;
  .title {
    // display: inline-block;
    display: none; // 等待修复
    width: 100%;
    padding: 6px 0 6px $spacing-size;
    margin-bottom: 5px;
  }
  .video-btn-wrap {
    // margin-bottom: $spacing-size;
    position: absolute;
    font-size: 50px;
    z-index: 1;
    width: 100%;
    text-align: center;
    top: 50%;
    transform: translateY(-50%);
    .video-btn {
      cursor: pointer;
      display: inline;
      .icon {
        margin: 0;
      }
    }
  }
  .no-data {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>
