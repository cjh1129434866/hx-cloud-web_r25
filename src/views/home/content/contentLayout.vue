<!--
 * @Author: jiapeng.Zheng
 * @Date: 2019-06-26 14:29:25
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-04-02 17:26:26
 * @Description: 首页中部内容布局
 -->
<template>
  <div :class="[$style['home-content'], 'home-content']">
    <div :class="[$style['ratio-wrap'], { [$style['isNoDevice']]: !isDevice }]">
      <div :class="$style['ratio-block']">
        <content-map
          :class="[$style['content-map']]"
          :isDevice="isDevice"
          :deviceInfo="deviceInfo"
          :mapDataType="mapDataType"
          :mapData="mapData"
          :itemData="itemData"
          :hoverItemId="hoverItemId"
          @onMarkClick="markClick"
          @onMarkHover="markHover"
        ></content-map>
        <template v-if="isDevice">
          <content-media :class="[$style['content-media']]" :deviceInfo="deviceInfo"></content-media>
        </template>
      </div>
    </div>
    <template v-if="isDevice">
      <device-control :class="[$style['content-control']]" :deviceInfo="deviceInfo" @onControlFormatListChange="controlFormatListChange"></device-control>
    </template>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Emit } from 'vue-property-decorator'
import DeviceControl from '@views/common/modules/deviceControl/index.vue'
import ContentMedia from './contentMedia.vue'
import ContentMap from './contentMap.vue'

@Component({ components: { ContentMedia, ContentMap, DeviceControl } })
export default class ContentLayout extends Vue {
  /**
   * 地图数据
   */
  @Prop({ default: [] })
  mapData
  /**
   * 数据类别：项目、站场、设备
   */
  @Prop()
  mapDataType: HomeListType
  /**
   * 激活的项目/站场
   */
  @Prop({
    default() {
      return {}
    }
  })
  itemData: HomeListTypeBO
  /**
   * 激活的设备
   */
  @Prop()
  deviceInfo: DeviceVO

  /**
   * 是否设备页：若是设备页则显示“控制模块”、“设备图片”、“设备摄像头”
   */
  @Prop({ default: false })
  isDevice: boolean
  /**
   * 被 hover 的 item 的ID
   */
  @Prop({ default: '' })
  hoverItemId: string

  // $style = {} // 开启 css module 后会在计算属性computed中引入该变量$style，在这里定义是为了解决开发时页面频繁刷新导致获取不到 $style 的bug

  @Emit('markClick')
  markClick(item) {
    return item
  }
  @Emit('markHover')
  markHover(id: string | number) {
    return id
  }
  @Emit('controlFormatListChange')
  controlFormatListChange(data: Array<DeviceControlBO>) {
    return data
  }
}
</script>
<style lang="scss" module>
@import '~@assets/scss/variables.scss';
// .home-content {
//   display: grid;
//   grid-gap: $spacing-size;
//   height: 100%;
//   grid-template-columns: 1fr 1fr;
//   grid-template-rows: 50% calc(50% - #{$spacing-size});
//   grid-template-areas:
//     'map media'
//     'control control';
//   .content-map {
//     &.isNoDevice {
//       grid-column: map-start / media-end;
//       grid-row: map-start / control-end;
//     }
//   }
//   .content-media {
//   }
//   .content-control {
//     grid-column: control-start / control-end;
//     height: 100%;
//   }
// }
$aspectRatio: 37.5%; // 长宽比 = 4:3

.home-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  .ratio-wrap {
    position: relative;
    // 为了使 图片的长宽比为4:3，使高度为0，用百分比的padding-bottom撑起高度；
    // 百分比的padding-bottom是以宽度为基准的；
    height: 0;
    padding-bottom: $aspectRatio;
    z-index: 1; // 防止被 .content-control 的 负margin-top 遮挡
    width: 100%;
    margin-bottom: $spacing-size;
    .ratio-block {
      position: absolute;
      height: 100%;
      width: 100%;
      display: flex;
      .content-map {
        width: 50%;
        margin-right: $spacing-small-size;
      }
      .content-media {
        width: 50%;
        margin-left: $spacing-small-size;
      }
    }
    // isNoDevice 占据首页中部内的全部内容
    &.isNoDevice {
      width: 100%;
      height: 100%;
      padding-bottom: 0;
      margin-bottom: 0;
      .ratio-block {
        .content-map {
          width: 100%;
          margin-right: 0;
        }
      }
    }
  }
  .content-control {
    // 由于 .ratio-wrap 使用padding-bottom撑起高度，
    // 为了使该高度充满剩余的空间（height: 100%）,使用相同高度的负 margin-top 抵消 .ratio-wrap 的 padding-bottom
    height: 100%;
    margin-top: calc(#{-$aspectRatio} - #{$spacing-size}); // 抵消 .ratio-wrap 的 padding-bottom
    padding-top: calc(#{$aspectRatio} + #{$spacing-size}); // 抵消 .ratio-wrap 的 padding-bottom
    flex-grow: 1;
  }
}
</style>
