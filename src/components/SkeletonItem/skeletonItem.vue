<!--
 * @Author: jiapeng.Zheng
 * @Date: 2019-06-26 14:29:25
 * @LastEditors: jiapeng.Zheng
 * @LastEditTime: 2019-09-06 15:56:27
 * @Description: 列表骨架屏
 -->
<template>
  <div :class="['skeleton-item']" v-loading="isCreated">
    <template v-if="isCreated">
      <div v-for="i in dataLn" :key="i" :class="[itemClass, 'item', 'body-item']" :style="{ height: itemHeight + 'px' }"></div>
    </template>
    <slot v-else></slot>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import $document from '@helper/document'

@Component({})
export default class SkeletonItem extends Vue {
  @Prop({ default: true })
  isCreated: boolean
  @Prop({ default: 10 })
  dataLn: number
  @Prop({ default: 'body-item' })
  itemClass: string

  itemHeight = 100

  // mounted() {}
  mounted() {
    const parentElementHeight = document.querySelector('.skeleton-item').parentElement.clientHeight
    const $item = document.querySelector('.skeleton-item .item')
    if ($item) {
      const itemMarginBottom = $document.getStyle($item, 'marginBottom').replace('px', '')
      this.itemHeight = parentElementHeight / this.dataLn - itemMarginBottom
    }
  }
}
</script>
<style lang="scss" scoped>
@keyframes skeleton-stripes {
  from {
    background-position: -468px 0;
  }
  to {
    background-position: 468px 0;
  }
}
.skeleton-item {
  .item {
    cursor: default;
    &,
    &:hover {
      // background: linear-gradient(to right, #eeeeee 8%, #dddddd 18%, #eeeeee 33%);
      background-size: 800px 104px;
      animation: skeleton-stripes 1s linear infinite;
    }
  }
}
</style>
