<!--
 * @Author: jiapeng.Zheng
 * @Date: 2019-06-26 14:29:25
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-26 13:58:27
 * @Description: 首页-左侧列表
 -->
<template>
  <div class="panel panel-block">
    <div :class="['panel-title', $style['panel-title']]">
      <!-- 搜索框 -->
      <template v-for="(value, name) in projectType">
        <div v-if="activeTitle === name" :class="[$style['body-item-search'], 'body-item-search']" :key="name">
          <el-input
            v-if="activeItemData.id"
            v-model="projectTypeSearch[value.ID + '_sub'].name"
            :placeholder="`请输入名称`"
            :inputStyle="{ border: 'none' }"
            @keydown.enter.native="onSearchEnter"
            @change="onSearchChange"
          >
            <span :class="[$style['input-icon'], $style['prefix-icon']]" slot="prefix" @click="onPrefixIconClick"><icon :class="[$style['icon']]" name="panel/list"></icon></span>
            <span :class="[$style['input-icon'], $style['suffix-icon']]" slot="suffix">
              <span @click="onSearchEnter"><icon :class="[$style['icon']]" name="panel/search"></icon></span>
              <!-- <span @click="$router.go(-1)"><icon :class="[$style['icon']]" name="panel/return"></icon></span> -->
              <span @click="$vueRouterGenerator.goBackByHistoryPath($route.fullPath)"><icon :class="[$style['icon']]" name="panel/return"></icon></span>
            </span>
          </el-input>
          <el-input
            v-else
            v-model="projectTypeSearch[value.ID].name"
            :placeholder="`请输入${projectType[activeTitle].NAME}名称`"
            :inputStyle="{ border: 'none' }"
            @keydown.enter.native="onSearchEnter"
            @change="onSearchChange"
          >
            <span :class="[$style['input-icon'], $style['prefix-icon']]" slot="prefix" @click="onPrefixIconClick"><icon :class="[$style['icon']]" name="panel/list"></icon></span>
            <span :class="[$style['input-icon'], $style['suffix-icon']]" slot="suffix">
              <span @click="onSearchEnter"><icon :class="[$style['icon']]" name="panel/search"></icon></span>
            </span>
          </el-input>
        </div>
      </template>
      <!-- 列表的分类：项目、站场、设备 -->
      <div v-if="!isActive" :class="[$style['title-item-wrap'], 'title-item-wrap']">
        <template v-for="(value, name) in projectType">
          <div :class="[$style['title-item'], 'title-item', { active: activeTitle === name }]" :key="name" @click="onTitleClick(name)">
            <div :class="[$style['item-icon']]" class="item-icon">
              <icon :class="[$style['icons']]" :name="value.icon"></icon>
            </div>
            <span :class="[$style['item-name']]" class="item-name">
              {{ value.NAME }}
            </span>
          </div>
        </template>
      </div>
      <!-- 列表被选中项目的名称(设备位于最底层，没有下一级内容（客户client下有项目、项目project下有项目或站场、站场station下有设备）) -->
      <div :class="[$style['title-name-wrap'], 'title-name-wrap']">
        <span :class="[$style['title-name'], 'title-name']">
          <span :class="[$style['name']]" :title="`${isActive ? activeItemData.name : '全部' + projectType[activeItemData.dataType].NAME} (${pageParam.DataCount})`"
            >{{ isActive ? activeItemData.name : '全部' + projectType[activeItemData.dataType].NAME }} ({{ pageParam.DataCount }})</span
          >
        </span>
        <span :class="[$style['more-btn'], 'more-btn']" @click="onMoreClick">{{ $t('more') }}</span>
      </div>
    </div>
    <div :class="['panel-body', $style['panel-body'], { [$style['is-active']]: isActive }]">
      <EasyScrollbar :class="['content-scrollbar']" :barOption="barOption" ref="listScrollbar">
        <keep-alive>
          <component
            :is="projectTypeComponent[projectType[activeTitle].ID]"
            :pageSize="pageSize"
            :pageNo="pageNo"
            :activeItemData="activeItemData"
            :activeDevice="activeDevice"
            :hoverItemId="hoverItemId"
            :isScroll="isScroll"
            :listStyle="$style"
            @onPageParamChange="pageParamChange"
            @onPageDataChange="pageDataChange"
            @onDataListChange="dataListChange"
            @onItemClick="itemClick"
            @onItemHover="itemHover"
            :ref="`${activeTitle}_Component`"
          ></component>
        </keep-alive>
      </EasyScrollbar>

      <el-pagination
        small
        background
        :class="[$style['body-item-pagination']]"
        layout="prev, pager, next"
        :total="pageParam.DataCount"
        :page-size="pageParam.PageSize"
        :current-page="pageParam.PageNo"
        :pager-count="5"
        :hide-on-single-page="true"
        @current-change="onPageNoChange"
      ></el-pagination>

      <!-- <transition
          :enter-active-class="`animated slideIn${enterDirections} ${$style['itemAnimationClass']}`"
          :leave-active-class="`animated slideOut${leftDirections} ${$style['itemAnimationClass']}`"
        >

        </transition> -->
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Emit, Watch } from 'vue-property-decorator'
// import * as projectType from '@constants/projectType'
import { _CLIENT, _PROJECT, _STATION, _DEVICE, DATA_CATEGORY } from '@constants/projectType'
import { BAR_OPTION } from '@constants/easyScrollbarConfig/index.js'
import ClientItem from './clientItem'
import ProjectItem from './projectItem'
import StationItem from './stationItem'
import DeviceItem from './deviceItem'
import $_ from '@helper/lodash.js'
import { $vueRouterGenerator } from '@helper'
const { bindEvent } = require('@helper/document').default

const enum Directions {
  Left = 'Left',
  Right = 'Right'
}

@Component({
  components: {
    ClientItem,
    ProjectItem,
    StationItem,
    DeviceItem
  }
})
export default class HomeList extends Vue {
  @Prop({ default: '' }) activeItemId: string
  /**
   * 当前子组件 item 的类型，根据 activeTitle 切换不同的子组件
   */
  @Prop() activeTitle: HomeListType
  @Prop({
    default() {
      return { _activeDevice: '' }
    }
  })
  activeDevice: HomePageRouteQuery
  @Prop({ default: '' })
  hoverItemId: string | number

  // $style = {} // 开启 css module 后会在计算属性computed中引入该变量$style，在这里定义是为了解决开发时页面频繁刷新导致获取不到 $style 的bug

  /**
   * EasyScrollbar 滚动条配置
   */
  barOption = BAR_OPTION
  isScroll = false
  pageSize = 10
  pageNo = 1
  projectType: DataCategoryBO = DATA_CATEGORY
  $scrollWrap
  /**
   * 滚动内容距离顶部的高度
   */
  easyScrollbarTop = {
    [_CLIENT.key]: 0,
    [_PROJECT.key]: 0,
    [_STATION.key]: 0,
    [_DEVICE.key]: 0
  }
  /**
   * 各个 item 的组件
   */
  projectTypeComponent = {
    [_CLIENT.ID]: ClientItem,
    [_PROJECT.ID]: ProjectItem,
    [_STATION.ID]: StationItem,
    [_DEVICE.ID]: DeviceItem
  }

  /**
   * 各个 item 的查询参数
   */
  projectTypeSearch: { [propName: string]: HomeListSearchBO } = {
    [_CLIENT.ID]: { name: '' },
    [_CLIENT.ID + '_sub']: { name: '' },
    [_PROJECT.ID]: { name: '' },
    [_PROJECT.ID + '_sub']: { name: '' },
    [_STATION.ID]: { name: '' },
    [_STATION.ID + '_sub']: { name: '' },
    [_DEVICE.ID]: { name: '' },
    [_DEVICE.ID + '_sub']: { name: '' }
  }
  /**
   * 各个 item 的数据
   */
  homeData: HomeDataBO = {
    [_CLIENT.key]: [],
    [_PROJECT.key]: [],
    [_STATION.key]: [],
    [_DEVICE.key]: []
  }
  pageData: HomeListDataBO = []
  pageDataObj: HomeDataBO = {}
  pageParamObj: { [propName: string]: PageVO } = {}
  pageParam: PageVO = { DataCount: 0, PageCount: 0, PageNo: 0, PageSize: 0 }

  get subCompAttrKey() {
    const activeItemData = this.activeItemData.data as ProjectVO
    const _activeDevice = activeItemData._activeDeviceData ? activeItemData._activeDeviceData.DeviceSn : ''
    return this.genSubCompAttrKey(this.activeTitle, this.activeItemId, _activeDevice)
  }

  @Watch('subCompAttrKey', { immediate: true })
  onSubCompAttrKey(key: string) {
    this.pageParam = this.pageParamObj[key] || this.pageParam
    this.pageData = this.pageDataObj[key] || this.pageData
  }
  @Watch('pageData')
  onPageDataChange(val: HomeListDataBO) {
    this.$emit('pageDataChange', val)
  }
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

  get isActive() {
    return !!this.activeItemData.id && this.activeTitle !== _DEVICE.key
  }

  /**
   * item 切换时的进入的方向
   */
  enterDirections: Directions = Directions.Right
  /**
   * item 切换时的离开的方向
   */
  leftDirections: Directions = Directions.Left

  /**
   * 当组件切换时, 用 easyScrollbarTop 保存滚动条的位置覆盖当前滚动条的位置
   */
  @Watch('activeTitle', { immediate: true })
  onActiveTitleChnage(val: HomeListType, oldVal: HomeListType) {
    this.activeItemData.dataType = val
    this.activeItemData.moreLink = `/common/app/${val}`
    if (val && oldVal) {
      this.enterDirections = this.projectType[val].I - this.projectType[oldVal].I > 0 ? Directions.Right : Directions.Left
      this.leftDirections = this.projectType[val].I - this.projectType[oldVal].I > 0 ? Directions.Left : Directions.Right
    }
    // 等待滚动条组件更新渲染完才手动改变滚动条的位置
    this.$nextTick(() => {
      if (this.$scrollWrap) {
        this.$scrollWrap.scrollTop = this.easyScrollbarTop[`${val}${this.activeItemId}`]
      }
    })
  }

  @Watch('activeItemId', { immediate: true })
  onActiveItemIdChange(val: string) {
    this.activeItemData.id = val
    this.$nextTick(() => {
      if (this.$scrollWrap) {
        this.$scrollWrap.scrollTop = this.easyScrollbarTop[`${this.activeTitle}${val}`]
      }
      this.getItemInfo(val)
    })
  }
  @Watch('activeDevice')
  onActiveDeviceChange() {
    // 当 activeDevice 改变时候，重新加载数据:
    //  确保当由选中站场下的设备返回到当前站场这一层级时（此时 activeItemId 不会发生改变），
    //  能够通过重新加载数据清空 activeItemData.data._activeDeviceData 同时重置其中的路由参数 activeItemData.urlParam 、activeItemData.moreLink
    this.activeItemData.id = this.activeItemId
    this.getItemInfo(this.activeItemId)
  }

  /* ************************************ 组件的生命周期 ************************************ */
  // created() {}

  mounted() {
    if (this.isScroll) {
      const $listScrollbar = this.$refs.listScrollbar as Vue
      this.$scrollWrap = $listScrollbar.$el.querySelector('.easy-scrollbar__wrap')
      bindEvent(
        this.$scrollWrap,
        'scroll',
        // 节流
        $_.throttle(e => {
          this.onItemScroll(e) // 滚动加载更多数据
        }, 500)
      )
    }
  }
  /* ************************************ 组件本身的方法 ************************************ */
  /**
   * 根据 activeTitle 、activeItemId、urlParam 生成 subCompAttrKey
   * @param {HomeListType} activeTitle
   * @param {string} activeItemId
   * @param {string} _activeDevice
   */
  genSubCompAttrKey(activeTitle: HomeListType, activeItemId: string, _activeDevice: string) {
    return `${activeTitle}${activeItemId}${_activeDevice}`
    // return `${this.activeTitle}${this.activeItemId}${this.activeItemData.urlParam}`
  }

  /* ************************************ 组件本身的事件 ************************************ */
  /**
   * 搜索框的 Change 事件
   * @param {string} string 名称
   * @description 只有当"名称"为空时才重新查询
   */
  onSearchChange(val: string) {
    if (!val) {
      this.onSearchEnter()
    }
  }
  onPrefixIconClick(e) {
    e.stopPropagation() // 组件事件的冒泡，主要是为了阻止绑定在 Frame.vue 组件中 main 元素上的 onHideMenuClick 方法
    // 非常粗暴的调用 Frame.vue 组件的 onToggleMenuClick，若组件的嵌套布局发生改变，则该方法会失效
    const $frame = this.$root.$children[0].$children[0] as any
    if (typeof $frame.onToggleMenuClick === 'function') {
      $frame.onToggleMenuClick()
    } else {
      console.error('获取不到 Frame.vue 组件的 onToggleMenuClick 方法，可能是组件的嵌套布局发生改变!')
    }
  }

  /**
   * 查看更多
   */
  onMoreClick() {
    const name = this.activeItemData.name || '全部' + this.projectType[this.activeItemData.dataType].NAME
    $vueRouterGenerator.goToPage(this.activeItemData.moreLink, name, null)
  }

  /* ************************************ 组件本身的事件（会调用子组件 projectTypeComponent 的方法） ************************************ */
  /**
   * 搜索框的 Enter 事件
   * @description 只有当用户按下回车键时才去查询数据
   */
  async onSearchEnter() {
    let searchForm: HomeListSearchBO
    if (this.activeItemData.id) {
      searchForm = this.projectTypeSearch[this.projectType[this.activeTitle].ID + '_sub']
    } else {
      searchForm = this.projectTypeSearch[this.projectType[this.activeTitle].ID]
    }
    const $projectTypeComponent = this.$refs[this.activeTitle + '_Component'] as HomeItemRefs
    if (this.$scrollWrap) {
      // 查询前先把列表的内容置顶
      this.$scrollWrap.scrollTop = 0
    }
    // 调用子组件的查询方法
    await ($projectTypeComponent as HomeItem<HomeListTypeBO>).searchData(searchForm)
    const statScrollbar = this.$refs.listScrollbar as IEasyScrollbar
    statScrollbar.update()
  }
  /**
   * 分页组件页码改变事件
   */
  async onPageNoChange(val: number) {
    const $projectTypeComponent = this.$refs[this.activeTitle + '_Component'] as HomeItemRefs
    // 调用子组件的“加载更多”方法
    await ($projectTypeComponent as HomeItem<HomeListTypeBO>).loadPageData(val, this.pageSize)
  }
  /**
   * item 滚动事件，用于异步加载列表数据
   * @description 记录下当前子组件每次滚动时的位置
   */
  async onItemScroll(e: Event) {
    const $scrollWrap = e.target as HTMLElement
    // 保存当前滚动条的位置
    this.easyScrollbarTop[`${this.activeTitle}${this.activeItemId}`] = $scrollWrap.scrollTop
    // 计算列表中最后一个项目的位置信息、和列表可视区域的高度
    const $listItem = document.querySelectorAll(`.${this.$style['body-item']}`)
    const $lastItem = $listItem[$listItem.length - 1]
    const lastItemBound = $lastItem.getBoundingClientRect()
    // 通过判断最后一个项目距离顶部的高度是否为列表可视区域的一半，是就自动加载更多数据
    if (lastItemBound.top / 2 < $scrollWrap.clientHeight) {
      const $projectTypeComponent = this.$refs[this.activeTitle + '_Component'] as HomeItemRefs
      // 调用子组件的“加载更多”方法
      await ($projectTypeComponent as HomeItem<HomeListTypeBO>).loadMoreData()
      // 等待加载完更多数据后，更新滚动条组件
      const statScrollbar = this.$refs.listScrollbar as IEasyScrollbar
      statScrollbar.update()
    }
  }

  /***
   * 获取激活的item信息
   */
  async getItemInfo(itemId: string) {
    const $projectTypeComponent = this.$refs[this.activeTitle + '_Component'] as HomeItemRefs
    // console.log('getItemInfo', this.activeItemData.dataType, this.$refs, $projectTypeComponent)
    if ($projectTypeComponent) {
      const itemInfo = await ($projectTypeComponent as HomeItem<HomeListTypeBO>).getItemDataInfo(itemId, this.activeDevice._activeDevice)
      if (itemInfo) {
        this.itemChange(itemInfo)
        this.$emit('itemChange', itemInfo)
      }
    }
  }

  /* ************************************* 子组件与当前组件通信的事件 ************************************* */
  /**
   * 保存各个类型的子组件传递过来的数据
   */
  dataListChange(dataList: HomeListDataBO) {
    this.homeData[this.activeTitle] = dataList
  }
  /**
   * 保存各个组件传递过来的分页参数
   */
  pageParamChange(key: SubCompAttrKeyObjBO, val: PageVO) {
    const subCompAttrKey = this.genSubCompAttrKey(key.activeTitle, key.activeItemId, key._activeDevice)
    this.pageParamObj[subCompAttrKey] = val
    this.pageParam = val
  }
  /**
   * 保存各个组件传递过来的分页数据
   */
  pageDataChange(key: SubCompAttrKeyObjBO, val: HomeListDataBO) {
    const subCompAttrKey = this.genSubCompAttrKey(key.activeTitle, key.activeItemId, key._activeDevice)
    this.pageDataObj[subCompAttrKey] = val
    this.pageData = val
  }

  /* ************************************* 当前组件与父组件通信的事件 ************************************* */
  @Emit('titleClick')
  onTitleClick(i: string) {
    return i
  }
  // 注：该方法也是子组件与当前组件通信的事件
  @Emit('itemClick')
  itemClick(itemData: HomeListItemDataBO<HomeListTypeBO>) {
    this.activeItemData = itemData
    return itemData
  }
  @Emit('itemHover')
  itemHover(itemId: string) {
    // this.hoverItemId = itemId
    return itemId
  }

  @Emit('itemChange')
  itemChange(itemData: HomeListItemDataBO<HomeListTypeBO>) {
    this.activeItemData = itemData
    return itemData
  }
}
</script>
<style lang="scss" module>
@import '~@assets/scss/variables.scss';
@import '~@assets/scss/mixins.scss';

$search-border-radius: $radius-size $radius-size 0 0; // 搜索框圆角
$search-input-icon-size: $font-medium; // 搜索框icon的大小，16px;
$search-input-height: 50px; // 搜索框的高度

$panel-item-wrap-height: 100px; // 项目分类的高度
$panel-item-height: 50px; // 项目分类中各个item的高度
$panel-item-icon-height: 20px; // 项目分类中各个item中icon的高度

.panel-title {
  position: relative; // 解决相邻的 .panel-body 层 margin 负值被覆盖引起的层级(z-index)问题
  flex-grow: 1;
  .body-item-search,
  .title-item-wrap,
  .title-name-wrap {
    flex-basis: 100%;
  }
  // 搜索框
  .body-item-search {
    border-radius: $search-border-radius;
    margin-bottom: $spacing-size;
    font-size: $search-input-icon-size;
    .input-icon {
      cursor: pointer;
      position: absolute;
      height: 100%;
      top: 0;
      display: flex;
      align-items: center;
      span {
        .icon {
          margin-right: 1em;
        }
      }
      &.prefix-icon {
        left: 0;
        margin-left: $spacing-medium-size;
      }
      &.suffix-icon {
        right: 0;
        margin-right: $spacing-medium-size;
        span {
          &:first-child::after {
            content: '';
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translateY(-50%);
            height: 20px;
            width: 1px;
          }
          &:last-child {
            &::after {
              display: none;
            }
            .icon {
              margin-right: 0;
            }
          }
        }
      }
    }
    input {
      font-size: $font-default;
      height: $search-input-height;
      border-radius: $search-border-radius;
      padding: 0 $spacing-medium-size * 2 + $search-input-icon-size;
    }
  }
  // 分类
  .title-item-wrap {
    display: flex;
    justify-content: space-around;
    border-radius: $radius-size;
    padding: $spacing-size $spacing-medium-size;
    margin-bottom: $spacing-size;
    height: $panel-item-wrap-height;
    .title-item {
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-direction: column;
      .item-icon {
        height: $panel-item-height;
        width: $panel-item-height;
        border-radius: 50%;
        text-align: center;
        .icons {
          font-size: $panel-item-icon-height;
          height: 100%;
          margin: 0;
        }
      }
      .item-name {
        // height: 100%;
        font-size: $font-default;
        display: flex;
        align-items: flex-end;
      }
    }
  }
  // 标题
  .title-name-wrap {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 0 $spacing-medium-size;
    margin-top: $spacing-medium-size;
    font-size: $search-input-icon-size;
    .title-name {
      display: flex;
      // font-size: $search-input-icon-size;
      @include text-overflow();
      .name {
        font-weight: bold;
        @include text-overflow();
      }
    }
    .more-btn {
      font-size: $font-small;
      flex-shrink: 0;
    }
  }
}

// 标题搜索框高度
$panel-title-search-height: $search-input-height + $spacing-size;
// 标题分类区域高度
$panel-tiele-item-height: $panel-item-wrap-height + $spacing-size;
// 标题名称高度
$panel-title-name-height: $search-input-icon-size + $spacing-medium-size;

.panel-body {
  padding: $spacing-medium-size $spacing-medium-size $spacing-medium-size * 2 $spacing-medium-size;
  border-top: none;
  height: calc(100% - #{$panel-title-search-height + $panel-tiele-item-height + $panel-title-name-height});
  display: flex;
  flex-direction: column;
  .body-item-pagination {
    text-align: center;
    margin-top: $spacing-size;
  }
  &.is-active {
    height: calc(100% - #{$panel-title-search-height + $panel-title-name-height});
  }
  .body-item {
    padding: $spacing-medium-size 0;
    display: flex;
    align-items: center;
    border-bottom: 1px solid;
    .body-item-name {
      @include text-overflow();
    }
    .tag {
      margin: 0 0.5em;
    }
  }
  .body-nodata-text,
  .body-more-btn {
    text-align: center;
    height: 20px;
  }
}
.itemAnimationClass {
  // position: absolute;
  // width: 100%;
}
</style>
