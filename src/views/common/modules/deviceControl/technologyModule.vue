<!--
 * @Author: jiapeng.Zheng
 * @Date: 2019-06-26 14:29:25
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-04-07 11:00:11
 * @Description:
 -->
<template>
  <div :class="$style['technologyModule']">
    <!--  -->
    <div :class="$style['abs-header']">
      <span class="text-link" @click="onFullClick">{{ isFull ? $t('reduce') : $t('full') }}</span>
    </div>
    <el-carousel v-if="imgList.length > 0" style="height:100%" height="100%" indicator-position="none" :autoplay="false">
      <el-carousel-item v-for="(image, index) in imgList" :key="index" :class="$style['technologyModule_item']">
        <img :src="image.url" :class="$style['technologyModule_item_img']" :alt="image.ImageName" :title="image.ImageName" />
      </el-carousel-item>
    </el-carousel>
    <div v-else :class="$style['no-data']">{{ $t('nodata') }}</div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Watch, Emit, Vue } from 'vue-property-decorator'
import ImageApi from '@helper/apis/image.js'

@Component({})
export default class TechnologyModule extends Vue {
  /**
   * 设备信息
   */
  @Prop({
    default() {
      return { TypeId: 0 }
    }
  })
  deviceInfo: DeviceVO

  imgList: Array<DeviceTypeImageVO> = []
  isFull = false

  @Watch('deviceInfo.TypeId')
  async onDeviceInfoChange(newVal) {
    this.getTypeImg(newVal)
  }

  // 全屏切换
  @Emit('onFullClick')
  onFullClick() {
    this.isFull = !this.isFull
    return this.isFull
  }

  mounted() {
    this.getTypeImg(this.deviceInfo.TypeId)
  }

  getTypeImg(typeId: number) {
    if (typeId) {
      ImageApi.getTypeImageList(typeId)
        .then((res: AllDataListVO2<DeviceTypeImageVO>) => {
          this.imgList = res.Data
        })
        .catch(err => {
          this.$message.error(String(err))
        })
    }
  }
}
</script>
<style lang="scss" module>
@import '~@assets/scss/variables.scss';
@import '~@assets/scss/mixins.scss';
.technologyModule {
  height: 100%;
  position: relative;
  .abs-header {
    position: absolute;
    text-align: right;
    z-index: 3;
    width: 100%;
    padding: 10px 20px;
  }
  .technologyModule_item {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .technologyModule_item_img {
      max-width: 100%;
      max-height: 100%;
      padding: 40px;
    }
  }
  .no-data {
    height: 100%;
    @include flex-box-center();
  }
}
</style>
