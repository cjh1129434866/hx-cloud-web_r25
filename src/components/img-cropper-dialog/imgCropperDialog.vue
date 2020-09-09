<!--
 * @Author: jiapeng.Zheng
 * @Date: 2019-01-24 14:32:57
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-04-03 11:27:25
 * @Description: 图片裁剪模块
 -->
<template>
  <el-dialog :visible="isVisible" @close="onClose" class="edit-dialog img-upload-dialog" ref="imgEditDialog" :close-on-click-modal="false" :show-close="false">
    <span slot="title" class="el-dialog__title">{{ option.title }}</span>
    <el-form class="form-group" :inline="true" v-if="imgList.length > 0">
      <el-form-item label="服务器图片">
        <el-select v-model="activeImgId" filterable @change="onServerImgChange">
          <el-option v-for="(item, index) in imgList" :key="index" :label="item.PictureName" :value="item.Id"> </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="danger" @click="onServerImgDel">{{ $t('deletes') }}</el-button>
      </el-form-item>
      <el-form-item><el-checkbox v-model="isCover" title="封面图的比例是5:1，非封面图的比例是2.5:1">封面图</el-checkbox></el-form-item>
    </el-form>
    <el-row :span="5">
      <el-col :xs="12" :sm="12" :md="12" :lg="12">
        <div class="vue-cropper-wrap">
          <vue-cropper
            ref="cropper"
            :img="fillForm.Picture"
            :info="cropperOption.info"
            :autoCrop="cropperOption.autoCrop"
            :centerBox="cropperOption.centerBox"
            :fixed="cropperOption.fixed"
            :fixedNumber="cropperOption.fixedNumber"
            @realTime="realTime"
          ></vue-cropper>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :md="12" :lg="12">
        <div class="show-preview">
          <div :style="previews.div" class="preview" :class="imageCategory">
            <img :src="previews.url" :style="previews.img" />
          </div>
        </div>
      </el-col>
    </el-row>
    <el-row>
      <el-upload
        ref="upload"
        class="img-upload-btn"
        accept="image/*"
        :action="imgFilePostUrl"
        :data="fillForm"
        :show-file-list="false"
        :auto-upload="false"
        :multiple="false"
        :on-change="localImgChange"
      >
        <el-button type="primary">
          <icon name="panel/image"></icon>
          {{ $t('selects') + $t('local') + $t('image') }}
        </el-button>
      </el-upload>
      <el-button class="img-rotate-btn" type="primary" @click="refreshCrop">
        <icon name="sync"></icon>
      </el-button>
      <el-button class="img-rotate-btn" type="primary" @click="rotateLeft">
        <icon name="panel/arrow-rotate-left"></icon>
      </el-button>
      <el-button class="img-rotate-btn" type="primary" @click="rotateRight">
        <icon name="panel/arrow-rotate-right"></icon>
      </el-button>
    </el-row>
    <span slot="footer">
      <el-button type="cancel" @click="isVisible = false">{{ $t('cancel') }}</el-button>
      <el-button type="primary" @click="onSureClick">{{ $t('confirm') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { UPLOAD_CONFIG } from '@constants/index'
export default {
  name: 'img-cropper-dialog',

  props: {
    value: {
      type: Boolean,
      required: true
    },
    option: {
      type: Object,
      default() {
        return { title: '编辑' }
      }
    },
    // 要裁剪的图片类型，不同类型的图片有不同的上传接口、图片大小限制等等
    imageCategory: {
      type: String,
      required: true
    },
    // 当前要裁剪的图片
    formData: {
      type: Object,
      required: true
    },
    imgList: {
      type: Array,
      default() {
        return []
      }
    },
    method: {
      type: String,
      default: 'post'
    }
  },

  data() {
    return {
      isVisible: false,
      isValidate: true,
      isCover: true,
      activeImgId: '',
      imgFileConfig: '', // 根据图片类型 imageCategory 从上传配置 UPLOAD_CONFIG 中获取当前类型图片的配置信息
      imgFilePostUrl: '', // 根据 imgFileConfig 拼接的上传接口
      // https://github.com/xyxiao001/vue-cropper
      cropperOption: {
        outputType: 'jpg', // 裁剪生成图片的格式
        info: true, // 裁剪框的大小信息
        autoCrop: true, // 是否默认生成截图框
        centerBox: false, // 截图框是否被限制在图片里面
        fixed: true, // 是否开启截图框宽高固定比例
        fixedNumber: [1, 1] // 截图框的宽高比例 [宽度, 高度]
      },
      previews: {},
      fillForm: this.formData
    }
  },

  computed: {},

  watch: {
    value(newVal) {
      this.isVisible = newVal
      if (newVal) {
        this.$nextTick(() => {
          document.body.appendChild(this.$refs.imgEditDialog.$el)
        })
      } else {
        document.body.removeChild(this.$refs.imgEditDialog.$el)
      }
      // if (newVal) {
      //   this.fillForm = JSON.parse(JSON.stringify(this.formData))
      // }
    },
    formData(newVal) {
      this.fillForm = JSON.parse(JSON.stringify(newVal))
      this.activeImgId = this.fillForm.Id
      this.$nextTick(() => {
        this.refreshCrop()
      })
    },
    'fillForm.sn'(v) {
      // 当图片的序号为0时，默认为封面图
      this.isCover = v === 0
    },
    isCover(value) {
      // 封面图的比例为5:1
      this.cropperOption.fixedNumber = value ? [5, 1] : this.imgFileConfig.fixedNumber
    }
  },

  created() {
    const imgFileConfig = UPLOAD_CONFIG[`${this.imageCategory}ImageCof`]
    if (imgFileConfig) {
      this.imgFileConfig = imgFileConfig
      this.imgFilePostUrl = imgFileConfig.url || UPLOAD_CONFIG.url
      this.cropperOption.fixedNumber = imgFileConfig.fixedNumber
    } else {
      console.error(`@constants/index : UPLOAD_CONFIG["${this.imageCategory}ImageCof"] is undefined`)
    }
  },

  methods: {
    // 实时预览函数
    realTime(data) {
      this.previews = data
    },
    rotateLeft() {
      this.$refs.cropper.rotateLeft()
    },
    rotateRight() {
      this.$refs.cropper.rotateRight()
    },
    refreshCrop() {
      // console.log(this.fillForm.Picture, !this.fillForm.Picture)
      // // fix: 隐藏二次加载时，Picture 为空时的 img
      // if (!this.fillForm.Picture) {
      //   const $cropperImg = document.querySelectorAll('.vue-cropper-wrap .cropper-box-canvas')[0]
      //   $cropperImg.style.display = 'none'
      // }
      this.$refs.cropper.refresh()
    },
    clearCrop() {
      this.$refs.cropper.clearCrop()
    },
    /**
     * 加载本地图片
     * @param {Object} file     本地文件属性
     */
    localImgChange(file /** fileList */) {
      const { type, size } = this.imgFileConfig
      const isImage = type.indexOf(file.raw.type) > -1
      const isLtM = file.size / 1024 / 1024 < size
      if (!isImage) {
        this.$message.error(`图片类型有误，只支持${type}类型的图片，请重新选择图片!`)
      }
      if (!isLtM) {
        this.$message.error(`图片大小不能超过${size}${this.imgFileConfig.unit}!`)
      }
      this.isValidate = isImage && isLtM
      if (this.isValidate) {
        // fix：解决升级到element-ui@2.13.0后upload组件的on-change事件的file参数丢失url
        this.fillForm.Picture = window.URL.createObjectURL(new Blob([file.raw])) // file.url
        this.fillForm.PictureName = file.name
        this.$emit('img-change', this.fillForm)
      }
    },
    /**
     * 服务器图片 change 事件
     * @param {String} val 服务器图片Id
     */
    onServerImgChange(val) {
      const serverImg = this.imgList.find(value => {
        return value.Id === val
      })
      this.fillForm = serverImg
      this.$emit('img-change', this.fillForm)
    },
    // 服务器图片删除事件
    onServerImgDel() {
      this.$emit('img-del', this.activeImgId)
    },
    onClose() {
      this.isVisible = false
      this.$emit('input', this.isVisible)
    },
    onSureClick() {
      if (this.isValidate && this.fillForm.Picture) {
        this.$refs.cropper.getCropBlob(data => {
          const img = window.URL.createObjectURL(data)
          const param = new FormData()
          for (const i in this.fillForm) {
            if (i === 'sn' && this.isCover) {
              param.append(i, 0)
            } else {
              param.append(i, this.fillForm[i])
            }
          }
          // 更新文件后缀名称
          this.fillForm.PictureName = this.$utils.updateFileSuffix(this.fillForm.PictureName, this.cropperOption.outputType)

          param.append('file', data, this.fillForm.PictureName)
          this.$apis.file
            .uploadImage(this.imgFilePostUrl, param, this.method)
            .then(result => {
              this.$emit('upload-success', img)
              this.$message.success(result.message)
              this.onClose()
            })
            .catch(errMsg => {
              this.$message.error(errMsg)
              console.error(errMsg)
            })
        })
      } else {
        this.$message.warning(this.$t('pleaseSelect') + this.$t('image'))
      }
    }
  }
}
</script>

<style type="text/css" lang="scss">
.img-upload-dialog {
  .el-form {
    .el-form-item {
      margin-bottom: 0; // 重置 .el-form-item 的 margin-bottom
    }
    .el-form-item__label {
      width: auto; // 重置因为 theme-element.scss 中 .el-dialog .el-form-item__label 被改变的 width
    }
    .el-form-item__content {
      margin-left: 0; // 重置因为 theme-element.scss 中 .el-dialog .el-form-item__content 被改变的 margin-left
    }
  }

  .vue-cropper-wrap {
    height: 300px;
  }
  .show-preview {
    display: flex;
    justify-content: center;
    flex: 1;
    .preview {
      overflow: hidden;
      background-color: black;
      margin-left: 20px;
      &.avatar {
        border-radius: 50%;
      }
    }
  }
  .img-upload-btn {
    display: inline-block;
    margin-right: 10px;
  }
  .img-rotate-btn {
    .icon {
      margin: 0;
    }
  }
}
</style>
