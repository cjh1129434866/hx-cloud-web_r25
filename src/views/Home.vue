<!--
 * @Author: jiapeng.Zheng
 * @Date: 2019-06-26 14:29:25
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2019-12-30 15:48:48
 * @Description:
 -->
<template>
  <div class="module-content home-content">
    <el-row :gutter="10" class="home-module">
      <!-- 列表 -->
      <el-col class="panel-list-wrap">
        <home-list
          class="panel-list"
          :activeItemId="activeItemId"
          :activeTitle="activeTitle"
          :activeDevice="$route.query"
          :hoverItemId="hoverItemId"
          @titleClick="onTitleClick"
          @itemClick="onItemClick"
          @itemHover="onItemHover"
          @itemChange="onItemChange"
          @pageDataChange="onPageDataChange"
        ></home-list>
      </el-col>
      <!-- 地图、设备图片&视频、设备控制等内容 -->
      <el-col class="panel-content-wrap">
        <div class="panel panel-block">
          <div class="panel-body">
            <home-content
              :activeItemData="activeItemData"
              :activeTitle="activeTitle"
              :pageData="pageData"
              :hoverItemId="hoverItemId"
              @onMarkClick="onItemClick"
              @onMarkHover="onMarkHover"
              @onControlFormatListChange="onControlFormatListChange"
            ></home-content>
          </div>
        </div>
      </el-col>
      <!-- 统计图 -->
      <el-col class="panel-stat-wrap sub-row-wrap">
        <div class="sub-row-body">
          <statistics :activeItemData="activeItemData" :activeTitle="activeTitle" :controlFormatList="controlFormatList"></statistics>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script lang="ts">
import { Route } from 'vue-router'
import { Component, Watch, Vue } from 'vue-property-decorator'

import { DATA_CATEGORY } from '@constants/projectType'
import { $vueRouterGenerator } from '@helper'
import HomeList from '@views/home/list/list.vue'
import HomeContent from '@views/home/content/index'
import Statistics from '@views/home/statistics/index.vue'

@Component({
  components: {
    HomeList,
    HomeContent,
    Statistics
  }
})
export default class Home extends Vue {
  projectType: DataCategoryBO = DATA_CATEGORY
  hoverItemId: string | number = ''
  /**
   * 格式化后的控制量
   */
  controlFormatList: Array<DeviceControlBO> = []
  /**
   * 被激活的title，默认激 project（即项目）title
   */
  activeTitle: HomeListType = DATA_CATEGORY.project.key
  activeItemId = ''
  activeItemData: HomeListItemDataBO<any> = {
    id: this.activeItemId,
    name: '',
    urlParam: '',
    moreLink: '',
    fromPath: {
      fullPath: [],
      fullPathName: '',
      fullPathID: ''
    },
    dataType: DATA_CATEGORY.project.key,
    data: {}
  }

  pageData: HomeListDataBO = []
  homePath = '/common/home'

  @Watch('$route')
  onRouteChange(val: Route) {
    this.setRouteParam(val.params)
    this.$nextTick(() => {
      const $statistics = document.querySelector('.sub-row-body .easy-scrollbar__wrap') // this.$refs.statistics as Element
      $statistics.scrollTop = 0 // 将滚动条置顶
    })
  }

  /* ************************************ 组件的生命周期 ************************************ */
  created() {
    this.setRouteParam(this.$route.params)
  }
  // mounted() {}
  updated() {
    this.hideAddressBar()
  }
  destroyed() {
    this.showAddressBar()
  }

  /* ************************************ 组件本身的事件 ************************************ */
  hideAddressBar() {
    if (this.$isMobile) {
      const $html: HTMLElement = document.querySelector('html')
      const $moduleContent: HTMLElement = document.querySelector('.module-content')
      $moduleContent.style.height = 'auto'
      $html.style.height = $moduleContent.clientHeight + 40 + 'px'
      $html.style.overflowY = 'auto'
    }
  }
  showAddressBar() {
    if (this.$isMobile) {
      const $html: HTMLElement = document.querySelector('html')
      const $moduleContent: HTMLElement = document.querySelector('.module-content')
      $moduleContent.style.height = '100%'
      $html.style.height = ''
      $html.style.overflowY = ''
    }
  }

  setRouteParam(routeParam: HomePageRouteParam) {
    const { activeTitle, activeItemId } = routeParam
    this.activeTitle = this.projectType[activeTitle] ? activeTitle : this.projectType.project.key
    this.activeItemId = activeItemId
  }

  /* ************************** 子组件与当前组件通信的事件 ************************************* */
  onTitleClick(activeTitle: HomeListType) {
    $vueRouterGenerator.goToPage(`${this.homePath}/${activeTitle}`, '')
  }
  /**
   * 1、子组件 home-list 手动点击 item 后传递过来的信息
   * 2、子组件 home-content 手动点击 mark 后传递过来的信息
   */
  onItemClick(itemData: HomeListItemDataBO<any>) {
    this.activeItemData = itemData
    let toPath = `${this.homePath}/${itemData.dataType}`
    let toTitleKey = itemData.name
    let fromPath: any = itemData.fromPath
    const isReplace = false

    if (itemData.id) {
      toPath += `/${itemData.id}`
    }
    const activeDeviceData = (itemData.data as ProjectVO)._activeDeviceData // 站场下被激活的设备信息
    // 判断点击的是否是某站场下的设备，是就补全路径添,同时修改激活的路由名称
    if (activeDeviceData && activeDeviceData.DeviceSn && DATA_CATEGORY.station.key === itemData.dataType) {
      itemData.fromPath.fullPath.push('/common/home/station/')
      itemData.fromPath.fullPathName += `/${itemData.name}`
      itemData.fromPath.fullPathID += `/${itemData.id}`
      toPath += itemData.urlParam
      toTitleKey = activeDeviceData.DeviceName
      // isReplace = true
    }
    if (DATA_CATEGORY.device.key === itemData.dataType) {
      // console.log('isReplace')
      // isReplace = false
      fromPath = `${this.homePath}/${itemData.dataType}` // 重置 fromPath ，确保当选中设备选项卡下的设备时，点击返回按钮能够会到首页
    }

    $vueRouterGenerator.goToPage(toPath, toTitleKey, fromPath, isReplace)
    // if (itemData.id) {
    //   $vueRouterGenerator.goToPage(`${this.homePath}/${itemData.dataType}/${itemData.id}${itemData.urlParam}`, itemData.name, itemData.fromPath)
    // } else {
    //   $vueRouterGenerator.goToPage(`${this.homePath}/${itemData.dataType}`, itemData.name, itemData.fromPath)
    // }
  }
  /**
   * 子组件 home-list 手动hover item 后传递过来的 item 的ID
   */
  onItemHover(itemId: string) {
    this.hoverItemId = itemId
  }
  /**
   * 子组件 home-list 根据 activeItemId 获取到的 item 数据
   */
  onItemChange(itemData: HomeListItemDataBO<any>) {
    this.activeItemData = itemData
  }
  /**
   * 子组件 home-list 传递过来的分页数据
   */
  onPageDataChange(pageData: HomeListDataBO) {
    this.pageData = pageData
  }

  /**
   * 子组件 home-content 传递过来的 hover
   */
  onMarkHover(id: string | number) {
    this.hoverItemId = id
  }

  /**
   * 子组件 home-content 传递过来的 controlFormatList
   */
  onControlFormatListChange(data: Array<DeviceControlBO>) {
    this.controlFormatList = data
  }
}
</script>
<style type="text/css" lang="scss">
@import '~@assets/scss/variables.scss';
@import '~@assets/scss/mixins.scss';

$el-row-gutter: $spacing-size;

// $panle-list-width: 350px + $el-row-gutter; // 左侧列表宽度
// $stat-width: 260px; // 右侧单个统计图宽度
// $panel-stat-width: ($stat-width + $spacing-size) * 2; // 右侧统计图宽度

.module-content.home-content {
  height: 100%;
  // 在 module-content 的原来的 padding 大小（$module-content-padding）上减掉5px（$spacing-small-size）
  // 因为class为 home-module 的 el-row 组件的 gutter 属性为 10，其子元素 el-col 会被强制设置有5px（gutter/2）的padding的行内样式
  // 又 el-row 会被强制设置-5px的 margin-left 和 margin-right 来抵消 el-col 的 5px padding-left 和 padding-right
  // 故只要改变 module-content 的 padding-top 和 padding-bottom 的大小
  padding: {
    top: $module-content-padding - $el-row-gutter/2; // 减掉 5px
    bottom: $module-content-padding - $el-row-gutter/2; // 减掉 5px
  }
  // min-height: 500px;
  .home-module {
    height: 100%;
    display: flex;
    flex-wrap: wrap;
    .el-col {
      height: 100%;
      .panel {
        height: 100%;
      }
      // 左侧列表
      &.panel-list-wrap {
        // width: $panle-list-width;
        .panel-list {
          padding: $spacing-size;
          padding-top: $spacing-large-size;
        }
        // .el-input-group__prepend {
        //   background-color: $white;
        // }
      }
      // 中间内容
      &.panel-content-wrap {
        // width: calc(100% - #{$panle-list-width + $panel-stat-width});
        .panel {
          padding: 0;
          .panel-body {
            height: 100%;
          }
        }
      }
      // 右侧统计图
      &.panel-stat-wrap {
        height: 100%;
        .statistics-view-wrap {
          height: 100%;
        }
        // 包含row模块的 el-col
        &.sub-row-wrap {
          // // 该模块下的各个子模块有自己的padding
          // padding: {
          //   top: 0;
          //   bottom: 0;
          // }
          // margin-bottom: $spacing-size;
          .sub-row-body {
            height: 100%;
          }
          .panel-body {
            height: calc(100% - #{$font-default});
          }
          // .el-row {
          //   // height: 100%;
          //   .el-col {
          //     @include count_panel-statistics-view_height();
          //   }
          // }
        }
      }
    }
  }
}
</style>
