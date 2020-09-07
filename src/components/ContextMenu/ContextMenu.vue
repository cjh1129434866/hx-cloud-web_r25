<!--
 * @Author: jiapeng.Zheng
 * @Date: 2018-11-26 15:33:11
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-31 09:16:47
 * @Description: 右键菜单
 -->
<template>
  <div class="context-menu-wrap" v-show="isShow" @click="isShow = false" @contextmenu.prevent="isShow = false">
    <div class="context-menu" :style="{ top: contextMenuConfig.top, left: contextMenuConfig.left }">
      <span v-for="(item, index) of contextMenuData" :key="index" class="menu-item" @click="itemClick(item)">
        <icon v-if="item.icon" class="icons" :name="item.icon"></icon>
        {{ item.itemName }}
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'context-menu',
  props: {
    contextMenuData: {
      require: true,
      type: Array,
      default() {
        return []
      }
    },
    contextMenuConfig: {
      require: true,
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      isShow: false,
      activeData: {}
    }
  },
  methods: {
    menuShow(activeData) {
      this.isShow = true
      this.activeData = activeData
    },
    itemClick(item) {
      this.$emit('item-click', item, this.activeData)
      this.isShow = false
    }
  }
}
</script>
<style type="text/css" lang="scss">
@import '~@assets/scss/variables.scss';
.context-menu-wrap {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  .context-menu {
    position: absolute;
    display: inline-block;
    width: 120px;
    border: 1px solid;
    box-shadow: $box-shadow;
    .menu-item {
      cursor: pointer;
      display: block;
      padding: 5px 5px 5px 15px;
    }
  }
}
</style>
