<!--
 * @Author: jiapeng.Zheng
 * @Date: 2019-06-26 14:29:25
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-04-03 10:47:46
 * @Description:
 -->
<template>
  <div class="app-device-image">
    <div v-if="showWay === '1'" class="carousel-image" :style="`height:${height}`">
      <!-- <div class="static-info">
        <div class="static-info-item" :title="deviceInfo.Address">
          <i class="el-icon-picture click-btn" :title="$t('clicks') + $t('edits') + $t('device') + $t('image')" @click="openImgDialog"></i>
          {{ deviceInfo.Address }}
        </div>
        <div class="static-info-item" :title="deviceInfo.DeviceName">{{ deviceInfo.DeviceName }}</div>
        <div class="static-info-item" :title="deviceTypeName">{{ deviceTypeName }}</div>
        <div class="static-info-item">
          <el-popover ref="useTimePopover" placement="bottom-end" v-model="isEditUseTime">
            <el-date-picker v-model="editUseTimeData" type="date" placeholder="选择日期" :clearable="false" @change="onUseTimeChange"></el-date-picker>
          </el-popover>
          <i class="el-icon-date click-btn" :title="$t('clicks') + $t('edits') + $t('deviceUseTime')" v-popover:useTimePopover></i>
          {{ $utils.dayConvert(deviceInfo.UseTime, 'YYYY年MM月DD日创建') }}
        </div>
      </div> -->
      <el-carousel ref="carousel" :height="height" :style="`height:${height}`" indicator-position="none" :autoplay="false">
        <el-carousel-item v-for="(image, index) in imageList" :key="index">
          <div class="div-img" :style="`background-image:url(${image.url})`"></div>
          <!-- <img :src="image.url" class="device-image" :alt="image.PictureName" :title="image.PictureName" style="width:100%;height:100%"> -->
        </el-carousel-item>
        <el-carousel-item :key="imageList.length" v-if="imageList.length <= 0">
          <!-- 暂无图片 -->
          <no-img class="no-img" :style="`height:${height}`" :isAddBtn="true" @addBtnClick="openImgDialog"></no-img>
        </el-carousel-item>
        <el-carousel-item :key="imageList.length" v-else>
          <!-- 新增、编辑图片 -->
          <div class="no-data">
            {{ $t('adds') + '/' + $t('edits') + $t('device') + $t('image') }}
            <i @click="openImgDialog" :title="$t('clicks') + $t('adds') + '/' + $t('edits') + $t('device') + $t('image')" class="click-btn el-icon-edit"></i>
          </div>
        </el-carousel-item>
      </el-carousel>
      <!-- 修改图片 -->
      <img-cropper-dialog
        v-model="isChangeImgVisible"
        :option="{ title: $t('upload') + $t('image') }"
        :form-data="editImgData"
        :img-list="imageList"
        image-category="device"
        @upload-success="uploadImgSuccess"
        @img-change="onImgChange"
        @img-del="onImgDel"
      ></img-cropper-dialog>
    </div>
    <div v-else class="vertical-image">
      <div class="vertical-item-wrap" v-for="(image, index) in imageList" :key="index">
        <!-- <div class="img-title text-title">
          <span>{{image.PictureName}}</span>
        </div>-->
        <div class="image-view-btn el-icon-view" @click="onViewImageClick(image)"></div>
        <div class="vertical-item">
          <span class="img-name">{{ image.PictureName }}</span>
          <img :src="image.url" class="device-image" :alt="image.PictureName" :title="image.PictureName" style="width:100%;height:100%" />
        </div>
      </div>
      <!-- 全屏查看设备类型图片弹窗 -->
      <el-dialog :visible="isImageViewDialogVisible" :fullscreen="true" class="edit-dialog" :close-on-click-modal="false" :show-close="false">
        <img v-if="viewImg && viewImg.url" class="device-image" :src="viewImg.url" :alt="viewImg.PictureName" :title="viewImg.PictureName" style="width:100%;height:100%" />
      </el-dialog>
    </div>
  </div>
</template>
<script>
import { IMAGE_URL, UPLOAD_CONFIG } from '@constants/index'
import { DEVICE_IMAGE_PANEL } from '@constants/panelConfig'
export default {
  name: 'app-device-image',

  props: {
    deviceSn: {
      type: String,
      required: true
    },
    deviceTypeName: {
      type: String
    },
    deviceInfo: {
      type: Object
    },
    showWay: {
      type: String,
      default: '1'
    },
    height: {
      type: String,
      default: '298px'
    }
  },

  data() {
    return {
      imageList: [],
      isImageDialogVisible: false,
      isImageViewDialogVisible: false,
      isChangeImgVisible: false,
      viewImg: {},
      filePostUrl: UPLOAD_CONFIG.deviceImageCof.url || UPLOAD_CONFIG.url,
      fileConfig: UPLOAD_CONFIG.deviceImageCof,
      fileData: {},
      editImgData: { Picture: '', PictureName: '' },
      isEditUseTime: false,
      editUseTimeData: null
    }
  },

  computed: {
    imgPanelId() {
      return this.$store.getters['devicePanel/getPanelId'](DEVICE_IMAGE_PANEL)
    }
  },
  watch: {
    deviceInfo(nv) {
      if (nv) {
        this.init()
      }
    }
  },
  components: {},
  created() {
    this.init()
  },

  methods: {
    async init() {
      this.editUseTimeData = this.deviceInfo.UseTime
      // --------------工艺流程图-----------------------
      try {
        this.imageList = []
        let result
        if (this.showWay === '1') {
          result = await this.$apis.image.getDeviceImage(this.deviceSn)
          result = result.list
        } else {
          result = await this.$apis.image.getTypeImageList(this.deviceInfo.TypeId)
          result = result.Data
        }
        for (const image of result) {
          this.imageList.push({
            url: `${IMAGE_URL}${image.url}`,
            Id: image.Id, // img-cropper-dialog 组件需要的参数
            Picture: `${IMAGE_URL}${image.url}`, // img-cropper-dialog 组件需要的参数
            PictureName: image.ImageName, // img-cropper-dialog 组件需要的参数
            imageName: image.ImageName, // 上传设备图片所需的参数
            deviceSn: this.deviceInfo.DeviceSn // 上传设备图片所需的参数
          })
        }
      } catch (errMsg) {
        console.error(errMsg)
        this.$message.error(String(errMsg))
      } finally {
        this.$emit('deviceImageSuccess')
        this.$nextTick(() => {
          this.$refs.carousel.setActiveItem(0)
        })
      }
    },
    async onUseTimeChange(useTime) {
      if (this.editUseTimeData !== this.deviceInfo.UseTime) {
        this.$apis.device
          .updateDeviceUseTime(this.deviceInfo.DeviceSn, useTime)
          .then(data => {
            this.deviceInfo.UseTime = useTime
            this.$message.info(data.Message)
          })
          .catch(err => {
            this.$message.error(err)
          })
          .fin(() => {
            this.isEditUseTime = false
          })
      }
    },
    /**
     * 项目图片修改
     */
    onEditImgClick() {
      this.editImgData = { Picture: '', PictureName: '', deviceSn: this.deviceInfo.DeviceSn }
      if (this.imageList.length > 0) {
        const imgData = this.imageList[this.imageList.length - 1]
        this.editImgData = imgData
      }
      this.editImgData.panelId = this.imgPanelId // this.panelObj.Id // 上传图片所需的参数,该参数在初始化期间无法获取，只能在当前阶段赋值
      this.isChangeImgVisible = true
    },
    // 图片修改成功回调
    uploadImgSuccess() {
      this.init()
    },
    // 图片 chang 事件
    onImgChange(fileData) {
      const editImgData = Object.assign({}, this.editImgData, fileData)
      // 覆盖图片名称
      editImgData.imageName = fileData.PictureName // 上传图片所需的参数，根据 img-cropper-dialog 组件返回的参数图片参数覆盖原图片的参数
      this.editImgData = editImgData
    },
    // 打开图片编辑窗口
    openImgDialog() {
      // 判断图片面板是否存在
      if (this.imgPanelId) {
        // 若存在，直接编辑图片
        this.onEditImgClick()
      } else {
        // 若不存在，则先添加添加图片面板再添加图片
        this.$apis.panel
          .addPanel(DEVICE_IMAGE_PANEL, this.$t('device') + this.$t('image'), this.deviceSn)
          .then(res => {
            this.$store.commit('devicePanel/addPanel', res)
            // this.$emit('handRefresh')
            this.onEditImgClick()
          })
          .catch(errMsg => {
            this.$message.error(errMsg)
            console.error(errMsg)
          })
      }
    },
    //  文件列表移除文件时的钩子
    onImgDel(fileId) {
      this.$apis.image
        .deleteDeviceImage({ id: fileId, deviceSn: this.deviceSn })
        .then(async () => {
          await this.init() // 重新加载数据，会改变 imageList
          this.onEditImgClick() // 等待数据重新加载后再改变 editImgData
        })
        .catch(errMsg => {
          this.init()
          this.$message.error(errMsg)
          console.error(errMsg)
        })
    },
    onViewImageClick(imgUrl) {
      this.isImageViewDialogVisible = true
      this.viewImg = imgUrl
    }
  }
}
</script>
<style lang="scss">
@import '~@assets/scss/variables.scss';
@import '~@assets/scss/mixins.scss';
.app-device-image {
  margin: 0px $spacing-size;
  .carousel-image {
    .el-carousel__item {
      display: block;
    }
    .static-info {
      display: block;
      position: absolute;
      z-index: 10;
      font-size: $font-small;
      background-color: rgba(0, 0, 0, 0.5);
      color: $white;
      margin: 5px;
      max-width: 33.34%;
      .static-info-item {
        @include text-overflow();
        cursor: default;
        display: block;
        height: 21px;
        line-height: 21px;
        padding: 0 5px;
        border-bottom: 1px solid rgba(216, 216, 216, 1);
        &:last-child {
          border-bottom: none;
        }
      }
    }
  }
  .vertical-image {
    .img-name {
      display: inline-block;
      padding-bottom: 15px;
      font-weight: bold;
    }
    .vertical-item-wrap {
      margin-bottom: $spacing-small-size;
      // .vertical-image 下最后一个 .vertical-item-wrap 类型（div）的元素是 edit-dialog，故选择最后第二个
      &:nth-last-of-type(2) {
        margin-bottom: 0;
      }
      .img-title {
        // text-align: center;
        padding: 6px 0 6px $spacing-size;
        margin-bottom: 5px;
      }
      .image-view-btn {
        display: none;
        position: absolute;
        right: 15px;
        margin-top: 5px;
      }
      .vertical-item {
        background-color: $white;
        padding: 20px;
      }
      &:hover {
        .image-view-btn {
          cursor: pointer;
          display: inline-block;
        }
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
