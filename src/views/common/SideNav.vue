<!--
 * @Author: jiapeng.Zheng
 * @Date: 2018-12-14 17:38:06
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-31 16:49:50
 * @Description: 左侧菜单
 -->
<template>
  <nav>
    <div class="sidenav" ref="sidenav">
      <EasyScrollbar class="sidenav-scrollbar" :barOption="barOption">
        <template v-for="(item, index) in sideNav">
          <side-nav-node :model="item" :key="index" @menuItemClick="menuItemClickCallBack" :isTop="true"></side-nav-node>
        </template>
      </EasyScrollbar>
    </div>
  </nav>
</template>

<script>
import SideNavNode from '@views/common/SideNavNode'
import { $vueRouterGenerator } from '@helper'
import { BAR_OPTION } from '@constants/easyScrollbarConfig/index.js'

export default {
  name: 'side-nav',

  props: {},

  data() {
    return {
      useVueRouter: false, // 是否使用 vue-router 的模式，启用该模式会在激活导航时以 index 作为 path 进行路由跳转
      // 滚动条属性
      barOption: BAR_OPTION,
      topMenuBak: {},
      topMenu: [],
      sideNav: [],
      defaultOpeneds: [] // 当前打开的submenu的 key 数组
    }
  },
  watch: {
    IsAdmin(newVal) {
      this.getMenuData(newVal)
    }
  },
  methods: {
    onToggleMenuClick() {
      this.$emit('toggleMenuClick')
    },
    menuItemClickCallBack() {
      this.$emit('toggleMenuClick')
    },
    async getMenuData(IsAdmin) {
      const { sideNav, topMenu } = $vueRouterGenerator.menuInit(this.$store.state.$userMenu, IsAdmin)
      this.sideNav = sideNav
      this.topMenu = topMenu
    },
    async menuOpen(index) {
      // 非管理员才需动态增加子菜单
      if (!this.IsAdmin) {
        const { isNeedRendered, sideNav, topMenu } = await $vueRouterGenerator.addSubMenu(index, this.topMenu, this.sideNav)
        // 是否需要重新渲染菜单
        if (isNeedRendered === true) {
          this.sideNav = sideNav
          this.topMenu = topMenu
        }
      }
    }
  },
  components: {
    SideNavNode
  },
  async mounted() {
    this.getMenuData(this.IsAdmin)
  }
}
</script>
