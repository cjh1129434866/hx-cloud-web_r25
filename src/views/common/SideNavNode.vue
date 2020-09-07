<!--
 * @Author: jiapeng.Zheng
 * @Date: 2018-08-23 16:54:23
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-31 14:12:42
 * @Description: 左侧菜单
 -->
<template>
  <div class="side-nav-node">
    <!-- 1、没有子菜单,且是顶级菜单 -->
    <template v-if="!isContainMore(model) && isTop">
      <!-- 顶级菜单的名称 -->
      <div class="side-nav-node-nopopover" @click="onMenuItemClick(model)" :title="model.title[$currentLang]">
        <icon v-if="model.icon" :name="model.icon"></icon><span class="side-nav-node-name">{{ model.title[$currentLang] }}</span>
      </div>
    </template>

    <!-- 有子菜单 -->
    <template v-if="isContainMore(model)">
      <!-- 2、拥有子菜单的菜单项目，且是顶级菜单(isTop) -->
      <el-popover v-if="isTop" popper-class="menu-popover" placement="right-start" trigger="hover" :visible-arrow="false" transition="menu-popover">
        <!-- 顶级菜单名称 -->
        <div class="side-nav-node-popover" slot="reference" :title="model.title[$currentLang]">
          <icon v-if="model.icon" :name="model.icon"></icon><span class="side-nav-node-name">{{ model.title[$currentLang] }}</span>
        </div>
        <!-- 2-1、顶级菜单的子级菜单 -->
        <el-menu unique-opened theme="dark" :collapse="true" :router="false" :default-active="$route.path">
          <!-- 当前菜单项目下的子菜单 -->
          <template v-for="(item, index) in model.children">
            <el-submenu :key="index" :index="item.id">
              <!-- 顶级菜单下的各个子级菜单（即二级菜单）名称 -->
              <template slot="title">
                <icon v-if="item.icon" :name="item.icon"></icon
                ><span class="side-nav-node-name" :title="item.title[$currentLang]" @click="onMenuItemClick(item)">{{ item.title[$currentLang] }}</span>
              </template>
              <!-- 2-1-1、子菜单递归调用自身组件，循环生成树形结构的菜单（即递归生成剩余的菜单项,isTop必须为false才能正常递归） -->
              <side-nav-node :model="item" @menuItemClick="menuItemClickCallBack" :isTop="false"></side-nav-node>
            </el-submenu>
          </template>
        </el-menu>
      </el-popover>
      <!-- 2-1-1、拥有子菜单的菜单项目，且不是顶级菜单（即二级菜单开始递归调用） -->
      <template v-else>
        <!-- 当前菜单项目下的子菜单 -->
        <template v-for="(item, index) in model.children">
          <el-submenu :key="index" :index="item.id">
            <template slot="title">
              <icon v-if="item.icon" :name="item.icon"></icon
              ><span class="side-nav-node-name" :title="item.title[$currentLang]" @click="onMenuItemClick(item)">{{ item.title[$currentLang] }}</span>
            </template>
            <!-- 子菜单递归调用自身组件，循环生成树形结构的菜单 -->
            <side-nav-node :model="item" :key="index" @menuItemClick="menuItemClickCallBack" :isTop="false"></side-nav-node>
          </el-submenu>
        </template>
      </template>
    </template>
  </div>
</template>

<script>
export default {
  name: 'side-nav-node',

  props: {
    model: {
      type: Object,
      required: true,
      default: () => {
        return {}
      }
    },
    isTop: {
      type: Boolean,
      required: true,
      default: false
    }
  },

  methods: {
    isContainMore(model) {
      return model.children && model.children.length
    },

    onMenuItemClick(item) {
      // 只有无子菜单的菜单项点击时才可以跳转页面
      if (!this.isContainMore(item)) {
        this.$router.push(item.path)
        // 暂无菜单不可点击
        if (item.path !== '') {
          // 必须先向路由 push 路径，才设置激活的路由名称，因为路由的导航守卫中也会设置激活的路由
          this.$store.commit('$vuexSetActiveMenu', { path: item.path, title: { ...item.title } }) // 使用用户自定义的菜单名称覆盖路由默认名称
          // 保存当前激活的路径
          this.$store.commit('$vuexAddHistoryPath', { path: item.path, parentPath: null, title: item.title })
        }
        this.menuItemClickCallBack()
      }
    },

    menuItemClickCallBack() {
      this.$emit('menuItemClick')
    }
  }
}
</script>
