<!--
 * @Author: jiapeng.Zheng
 * @Date: 2018-12-26 09:52:16
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-04-03 10:36:26
 * @Description:
 -->
<!-- 摄像头编辑 -->
<template>
  <el-form class="device-video-edit" :model="fillForm" :rules="rules" ref="fillForm">
    <el-form-item label="种类" prop="ApiUrl">
      <el-select v-model="fillForm.ApiUrl" placeholder="请选择摄像头类型">
        <el-option v-for="item in cameraTypes" :label="item.Name" :value="item.ApiUrl" :key="item.Id"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="Appkey" prop="Appkey">
      <el-input v-model="fillForm.Appkey"></el-input>
    </el-form-item>
    <el-form-item label="Secret" prop="Secret">
      <el-input v-model="fillForm.Secret"></el-input>
    </el-form-item>
    <el-form-item label="名称" prop="VideoName">
      <el-input v-model="fillForm.VideoName"></el-input>
    </el-form-item>
    <el-form-item label="通道号" prop="Channel">
      <el-input v-model.number="fillForm.Channel"></el-input>
    </el-form-item>
    <el-form-item label="序列号" prop="VideoSn">
      <el-input v-model="fillForm.VideoSn"></el-input>
    </el-form-item>
    <el-form-item label="加密密码" prop="SecurityCode">
      <el-input v-model="fillForm.SecurityCode"></el-input>
    </el-form-item>
    <el-form-item label="视频地址" prop="Url">
      <el-input v-model="fillForm.Url"></el-input>
    </el-form-item>
  </el-form>
</template>

<script>
// import { PANEL_CONFIG, DEVICE_VIDEO_PANEL } from '@constants/panelConfig'
// const refreshComponent = PANEL_CONFIG[DEVICE_VIDEO_PANEL].component // 要刷新的面板deviceBaseData
export default {
  name: 'device-video-panel-edit',

  props: {
    // 面板是否打开
    isVisible: {
      type: Boolean,
      required: true,
      default: false
    },
    pdata: {
      type: Object,
      required: true
    },
    editVideo: {
      type: Object,
      default: null
    }
  },

  data() {
    return {
      // deviceSn: '',
      videoData: [],
      isEdit: false, // 判断下拉选中的是新增Or编辑
      fillForm: {
        Id: '',
        panelId: '',
        DeviceSn: '',
        VideoName: '',
        Channel: 1,
        VideoSn: '',
        SecurityCode: '',
        Url: '',
        ApiUrl: '', // 萤石摄像头获取token的url
        Appkey: '', // 萤石摄像头AppKey
        Secret: '' // 萤石摄像头Secret
      },
      cameraTypes: [{ Id: 0, Name: '萤石', ApiUrl: 'https://open.ys7.com/api/lapp/token/get' }],
      rules: {
        VideoName: [
          {
            required: true,
            message: '请输入视频名称',
            trigger: 'blur'
          },
          {
            min: 3,
            max: 10,
            message: '长度在 3 到 10 个字符',
            trigger: 'blur'
          }
        ],
        Channel: [
          {
            required: true,
            type: 'number',
            message: '视频通道号必须是数字',
            trigger: 'blur' // 如果你用数字校验，也用了v-model.number，你原来的校验规则里，如果有trigger: 'blur'，需要去掉。
          }
        ],
        VideoSn: [
          {
            required: true,
            message: '请输入视频设备序列号',
            trigger: 'blur'
          }
        ],
        SecurityCode: [
          {
            required: true,
            message: '请输入视频加密密码',
            trigger: 'blur'
          }
        ],
        Url: [
          {
            required: true,
            message: '请输入视频地址',
            trigger: 'blur'
          }
        ],
        ApiUrl: [
          {
            required: true,
            message: '请选择摄像头类型',
            trigger: 'blur'
          }
        ],
        Appkey: [
          {
            required: true,
            message: '请输入AppKey',
            trigger: 'blur'
          }
        ],
        Secret: [
          {
            required: true,
            message: '请输入Secret',
            trigger: 'blur'
          }
        ]
      }
    }
  },

  computed: {},

  watch: {
    isVisible(newVal) {
      if (newVal) {
        this.resetForm()
      }
    }
  },

  // created() {},

  mounted() {
    this.resetForm()
  },

  // updated() {},

  methods: {
    resetForm() {
      this.isEdit = !!this.editVideo
      if (!this.isEdit) {
        // 新增
        this.$refs.fillForm.resetFields()
      } else {
        // 编辑
        this.fillForm = JSON.parse(JSON.stringify(this.editVideo))
      }
      this.fillForm.panelId = this.pdata.panelId
      this.fillForm.DeviceSn = this.pdata.DeviceSn
      // 强制重置ApiUrl，因为目前只有萤石摄像头可选且接口不会返回ApiUrl
      this.fillForm.ApiUrl = this.cameraTypes[0].ApiUrl
    },

    // // 更新videoPanel.vue
    // refreshVideoPanel(close) {
    //   // 是否关闭更新videoPanelEdit.vue
    //   if (close) {
    //     // 若关闭，则调用父组件panelTypeAdd.vue的关闭方法onSureClickCallBack
    //     this.$emit('onSureClickCallBack', close)
    //   } else {
    //     // 若不关闭，则调用父组件panelTypeAdd.vue的刷新方法refreshPanel
    //     this.$emit('refreshPanel', { refreshComponent })
    //   }
    // },
    // 必须存在，因为其父组件panelAddType提交时会调用该方法
    onSureClick() {
      this.$refs.fillForm.validate(valid => {
        if (!valid) return
        // let { Id } = this.fillForm
        if (this.isEdit) {
          // 更新
          this.$apis.video
            .updateDeviceVideo(this.fillForm)
            .then(result => {
              this.$emit('onSureClickCallBack')
              this.$message.success(result.Message)
              // this.refreshVideoPanel(true)
            })
            .catch(errMsg => {
              this.$message.error(errMsg)
              console.error(errMsg)
            })
        } else {
          // 新增
          this.$apis.video
            .deviceVideoAdd(this.fillForm)
            .then(result => {
              this.$emit('onSureClickCallBack')
              this.$message.success(result.Message)
              // this.refreshVideoPanel(true)
            })
            .catch(errMsg => {
              this.$message.error(errMsg)
              console.error(errMsg)
            })
        }
      })
    },
    // 必须存在，因为其父组件panelAddType取消时会调用该方法
    onClose() {
      // this.resetForm()
    }
  }
}
</script>
<style type="text/css" lang="scss">
.device-video-edit.el-form {
  .el-form-item {
    margin-bottom: 1rem;
  }
}
</style>
