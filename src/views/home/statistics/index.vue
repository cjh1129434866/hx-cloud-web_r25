<!--
 * @Author: jiapeng.Zheng
 * @Date: 2019-06-26 14:29:25
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-04-07 11:12:50
 * @Description: 首页右侧统计图
 -->
<template>
  <div class="statistics-view-wrap">
    <!-- 标题 -->
    <div class="statistics-title">
      <span class="title-name">
        <!-- {{ $t('statistical') }} -->
        <template v-if="deviceInfo && deviceInfo.DeviceName">
          当前{{ dataCategory.device.NAME }}：
          {{ deviceInfo.DeviceName }}
        </template>
        <template v-else-if="activeItemData && activeItemData.name">
          当前{{ dataCategory[activeItemData.dataType].NAME }}：
          {{ activeItemData.name }}
        </template>
        <template v-else>{{ $t('statistical') }}</template>
      </span>
      <span class="title-btn" @click="isAddDialogShow = true">
        <icon class="click-btn" name="panel/addSquare"></icon>
      </span>
    </div>
    <EasyScrollbar class="statistics-content content-scrollbar" :barOption="barOption" ref="statScrollbar">
      <div class="statistics-content-body">
        <!-- 统计信息 -->
        <statistics-info
          class="statistic-info"
          :projectId="staParams.projectId"
          :deviceSn="staParams.deviceSn"
          :deviceInfo="deviceInfo"
          :controlFormatList="controlFormatList"
        ></statistics-info>
        <!-- 报警通知 -->
        <notice-view ref="noticeView" class="notice-view" :activeItemData="activeItemData" :projObj="{ Id: staParams.projectId }" :deviceSn="staParams.deviceSn"></notice-view>
        <!-- 统计图表 -->
        <statistics-view
          class="statistics-views"
          ref="statisticsView"
          :statTitle="nowTitle"
          :params="staParams"
          :layoutStyle="layoutStyle"
          :staType="['deviceControl']"
          :statShowLevel="statShowLevel"
          @stat-view="viewMoreStat"
          @stat-click="statClick"
          @onChartDataSuccess="onChartDataSuccess"
        >
          <template slot="topStat"></template>
        </statistics-view>
      </div>
    </EasyScrollbar>
    <!-- 统计图显示与否的弹窗 -->
    <el-dialog
      :visible="isAddDialogShow"
      class="add-dialog-wrap"
      custom-class="add-dialog"
      top="0"
      :modal-append-to-body="false"
      :close-on-click-modal="false"
      @close="isAddDialogShow = false"
    >
      <div slot="title" class="title-tab">
        <span class="tab-item" v-for="(item, key) in statTypeConfig" :key="key" @click="activeStatsTab = item.key" :class="[{ actived: activeStatsTab === item.key }]">
          <icon class="tab-item-icon" :name="item.icon"></icon>
          <span class="tab-item-name">{{ item.name }}</span>
        </span>
        <!-- <span class="tab-item" @click="activeStatsTab = 'monitor'" :class="[{ actived: activeStatsTab === 'monitor' }]">
          <icon class="tab-item-icon" name="panel/monitor"></icon>
          <span class="tab-item-name">监测</span>
        </span>
        <span class="tab-item" @click="activeStatsTab = 'state'" :class="[{ actived: activeStatsTab === 'state' }]">
          <icon class="tab-item-icon" name="panel/state"></icon>
          <span class="tab-item-name">状态</span>
        </span>-->
      </div>
      <div class="dialog-content-wrap">
        <EasyScrollbar class="content-scrollbar" :barOption="barOption">
          <div class="dialog-content">
            <template v-if="Object.keys(staData).findIndex(e => staData[e].displayType === activeStatsTab) === -1">
              <div class="no-data">暂无{{ statTypeConfig[activeStatsTab].name }}类型数据</div>
            </template>
            <template v-else v-for="(item, key) in staData">
              <el-checkbox :key="key" v-if="item.displayType === activeStatsTab" v-model="item._isShow" :title="item.statName" @change="onStatsShowChange(item)">{{
                item.statName
              }}</el-checkbox>
            </template>
          </div>
        </EasyScrollbar>
      </div>
    </el-dialog>
    <!-- 统计图表"查看更多"弹窗 -->
    <statistics-view-dialog
      v-model="isStatisticsViewShow"
      :viewStaData="staDataDetails.viewStaData"
      :projectId="staDataDetails.projectId"
      :deviceSn="staParams.deviceSn"
      :deviceInfo="deviceInfo"
      :statShowLevel="statShowLevel"
    ></statistics-view-dialog>
  </div>
</template>
<script lang="ts">
import { Component, Watch, Vue, Prop } from 'vue-property-decorator'
import { _DEVICE, _CLIENT, DATA_CATEGORY, _PROJECT, _STATION } from '@constants/projectType'
import { BAR_OPTION } from '@constants/easyScrollbarConfig/index.js'
import {
  STAT_TYPE_CONFIG,
  STAT_TYPE_CHECK,
  USERCONFIG_STATS_KEY,
  STAT_SHOW_LEVEL_DEVICE,
  STAT_SHOW_LEVEL_STATION,
  STAT_SHOW_LEVEL_PROJECT,
  STAT_SHOW_LEVEL_ALL
} from '@constants/statisticsConfig/index.js'

import statisticsView from '@views/common/modules/statisticsView.vue'
import statisticsViewDialog from '@views/common/modules/statisticsViewDialog.vue'
import statisticsInfo from '@views/home/statistics/info.vue'
import noticeView from '@views/common/modules/noticeView.vue'

import { $utils, $vueRouterGenerator } from '@helper'
/**
 * 统计面板组件的 style
 */
type StatLyoutStyle = {
  id: string
  panelStyle: { width?: string; height?: string }
}

type StatParams = {
  projectId: string
  deviceSn: string
}

@Component({
  components: {
    statisticsView,
    statisticsViewDialog,
    statisticsInfo,
    noticeView
  }
})
export default class Statistics extends Vue {
  @Prop({
    default() {
      return {
        id: '',
        name: '',
        urlParam: '',
        fromPath: {
          fullPath: [],
          fullPathName: '',
          fullPathID: ''
        },
        dataType: null,
        data: {}
      }
    }
  })
  activeItemData: HomeListItemDataBO<any>
  /**
   * activeItemInfo组件下子组件的类型，根据 activeTitle 切换不同的子组件
   */
  @Prop() activeTitle: HomeListType

  @Prop({
    default() {
      return []
    }
  })
  controlFormatList: Array<DeviceControlBO>

  /**
   * 统计图表的数量
   */
  get statPanelNum() {
    return Object.keys(this.staData).length + Number(!!this.activeItemData.id)
  }

  /**
   * EasyScrollbar 滚动条配置
   */
  barOption = BAR_OPTION
  /**
   * 统计类型配置
   */
  statTypeConfig = STAT_TYPE_CONFIG

  layoutStyle: StatLyoutStyle = {
    id: 'panel',
    panelStyle: {}
  }

  dataCategory = DATA_CATEGORY

  /**
   * 是否显示新增弹窗
   */
  isAddDialogShow = false

  /**
   * 新增弹窗中激活的tab
   */
  activeStatsTab: number = STAT_TYPE_CHECK // 监测

  /**
   * 是否显示详细的统计信息
   */
  isStatisticsViewShow = false

  staParams: StatParams = {
    projectId: '',
    deviceSn: ''
  }
  deviceInfo: DeviceVO = null
  nowTitle: string = this.activeItemData.name
  staDataDetails: HomeStatDet = { projectId: '', viewStaData: {} } // 统计数据
  staData: HomeStatData = {} // 统计数据
  statShowLevel = STAT_SHOW_LEVEL_ALL // 统计层级

  // 根据统计图表的数量自动调整各个统计图的高度、宽度
  @Watch('statPanelNum', { immediate: true })
  onStatPanelNumChange() {
    this.$nextTick(() => {
      const $statisticsView: any = this.$refs.statisticsView
      $statisticsView.eChartsResize()
    })
  }
  /**
   * @deprecated 若要获取某个“设备”下的统计信息，则 deviceSn 不能为 "0"(此时会自动忽略 projectId)
   * @deprecated 若要获取某个“项目/站场”下的统计信息，则 projectId 不能为 "0" 且 deviceSn 必须为 "0"
   * @deprecated 若要获取所有的统计信息，则 deviceSn 和 projectId 必须同时为 "0"
   */
  @Watch('activeItemData')
  onActiveItemDataChange(val: HomeListItemDataBO<any>) {
    this.nowTitle = this.activeItemData.name
    if (_DEVICE.key === this.activeItemData.dataType) {
      // 设备选项卡
      // 获取设备选项卡下某个设备的统计信息
      this.deviceInfo = val.data
      this.staParams = {
        deviceSn: val.id || '0',
        projectId: '0'
      }
      // 判断是否激活了设备选项卡下的某一设备
      if (!val.id) {
        this.statShowLevel = STAT_SHOW_LEVEL_ALL
      } else {
        this.statShowLevel = STAT_SHOW_LEVEL_DEVICE
      }
    } else if (val.data && val.data._activeDeviceData) {
      // 获取站场下某个设备的统计信息
      this.nowTitle = (val.data as ProjectVO)._activeDeviceData.DeviceName
      this.deviceInfo = (val.data as ProjectVO)._activeDeviceData
      this.staParams = {
        deviceSn: (val.data as ProjectVO)._activeDeviceData.DeviceSn,
        projectId: val.id || '0'
      }
      this.statShowLevel = STAT_SHOW_LEVEL_DEVICE
    } else if (_CLIENT.key === this.activeItemData.dataType) {
      // 获取某个“客戶”下的统计信息
      this.deviceInfo = null
      this.staParams = {
        deviceSn: '0',
        projectId: '0'
      }
      this.statShowLevel = STAT_SHOW_LEVEL_ALL
      // this.clientId =  val.id || '0' // 注：目前暂不支持获取客户的统计信息
    } else {
      // 获取某个“项目/站场”下的统计信息
      this.deviceInfo = null
      this.staParams = {
        deviceSn: '0',
        projectId: val.id || '0'
      }
      if (!val.id) {
        this.statShowLevel = STAT_SHOW_LEVEL_ALL
      } else {
        if (_PROJECT.key === this.activeItemData.dataType) {
          this.statShowLevel = STAT_SHOW_LEVEL_PROJECT
        }
        if (_STATION.key === this.activeItemData.dataType) {
          this.statShowLevel = STAT_SHOW_LEVEL_STATION
        }
      }
    }
  }

  @Watch('activeTitle')
  onActiveTitleChange() {
    this.$nextTick(() => {
      const statScrollbar = this.$refs.statScrollbar as IEasyScrollbar
      statScrollbar.update() // 手动更新滚动条
      const $noticeView = this.$refs.noticeView as any
      $noticeView.initTableScroll()
    })
  }

  /* ************************************ 组件的生命周期 ************************************ */
  // created() {}
  // mounted() {}
  /* ************************************ 组件本身的事件 ************************************ */
  onStatsShowChange(item) {
    // ------------------------ 保存配置 ------------------------
    const $userConfig = JSON.parse(JSON.stringify(this.$userConfig))
    $userConfig[USERCONFIG_STATS_KEY] = $userConfig[USERCONFIG_STATS_KEY] || {}
    $userConfig[USERCONFIG_STATS_KEY][item.id] = item._isShow
    this.$store.commit('$vuexSetUserConfig', $userConfig)
    this.$nextTick(() => {
      const { _echartData, _echartsId, _showInitMethod } = item
      const $statisticsView: any = this.$refs.statisticsView
      // 只有 id = _echartsId 的元素存在时才生成具体的统计图
      if (document.getElementById(_echartsId)) {
        $statisticsView[_showInitMethod](_echartsId, _echartData, {})
      }
      $statisticsView.eChartsResize()
    })
  }
  /* ************************************ 组件本身的事件（会调用子组件 projectTypeComponent 的方法） ************************************ */
  /* ************************************* 子组件与当前组件通信的事件 ************************************* */
  /**
   * 查看更多统计数据
   * @param {Boolean} isView 是否显示更多统计弹窗
   * @param {Object}  data 统计数据
   */
  viewMoreStat(isView: boolean, data: HomeStatData) {
    this.isStatisticsViewShow = isView
    this.staDataDetails.viewStaData = data
    this.staDataDetails.projectId = this.staParams.projectId
  }
  statClick(data: HomeStatData) {
    console.log(data)
    this.onMoreClick()
  }
  /**
   * statistics-view 组件统计数据加载成功
   */
  onChartDataSuccess(data: HomeStatData, typeData) {
    this.staData = Object.assign({}, data, typeData)
  }

  onMoreClick() {
    const name = this.activeItemData.name || '全部' + this.dataCategory[this.activeItemData.dataType].NAME
    let path = this.activeItemData.moreLink
    const pathQueryObj = $utils.getUrlQuery(path)
    const showway: ListShowWay = 'report'
    pathQueryObj['showway'] = showway
    path = $utils.queryString(path.split('?')[0], pathQueryObj) // 为 moreLink 添加 showway 参数用来判断“查看更多”页面的展示方式
    $vueRouterGenerator.goToPage(path, name, null)
  }
  /**
   * 图形加载成功回调
   */
  /* ************************************* 当前组件与父组件通信的事件 ************************************* */
}
</script>
<style lang="scss">
@import '~@assets/scss/variables.scss';
@import '~@assets/scss/mixins.scss';
.statistics-view-wrap {
  display: flex;
  flex-direction: column;
  .statistics-title {
    margin: $spacing-size 0;
    margin-top: 0;
    padding: $spacing-size;
    font-size: $font-medium;
    height: 40px;
    line-height: 40px - $spacing-size * 2;
    .title-btn {
      float: right;
      font-size: 40px - $spacing-size * 2;
    }
  }
  .statistics-content {
    .statistics-content-body {
      display: flex;
      flex-direction: column;
      // height: 100%;
      height: calc(100% + #{$scrollbar-width});
      .statistic-info,
      .notice-view {
        margin-bottom: $spacing-size;
      }
      .statistic-info {
        // height: 100%;
        min-height: 25%;
        max-height: 50%;
        display: flex;
      }
      .notice-view {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        min-height: 25%;
      }
      .statistics-views {
        margin-top: -5px;
      }
    }
  }
  .add-dialog-wrap .add-dialog {
    @include absolute-center();
    min-width: 760px;
    // top: 50%;
    // width: 40%;
    // transform: translate(-50%, -50%); // el-dialog 设置了 top="50%"
    //
    opacity: 0.8;
    border-radius: $radius-size;
    .el-dialog__header {
      padding: 0;
      $title-height: 40px;
      $scaleCount: 1.3;
      .title-tab {
        width: 360px;
        height: $title-height * $scaleCount; // 40px * 1.3;
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        &::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 22px;
          z-index: -2;
          width: 296px;
          height: 41px;
        }
        .tab-item {
          cursor: pointer;
          position: relative;
          padding: $title-height/2/2 0;
          margin: 0 -0.3em;
          display: inline-flex;
          justify-content: center;
          width: 120px;
          height: $title-height * $scaleCount;
          &::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            z-index: -2;
            border-bottom: none;
            border-radius: 0 0 $radius-size $radius-size;
            // 梯形关键代码
            transform: scale(1, $scaleCount) perspective(0.5em) rotateX(-5deg);
            transform-origin: top;
          }
          .tab-item-icon {
            font-size: $title-height/2;
          }
          .tab-item-name {
            line-height: $title-height/2;
          }
          &.actived {
            &::before {
              z-index: -1;
            }
          }
        }
      }
      .el-dialog__headerbtn {
        position: relative;
        float: right;
        top: 0;
        right: 0;
        font-size: $title-height/2;
        padding: $title-height/2/2;
        padding-right: 0;
        width: 60px;
        &::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          z-index: -2;
          border-bottom: none;
          border-radius: 0 0 0 $radius-size;
          // 梯形关键代码
          transform: scale(1, $scaleCount) perspective(0.5em) rotateX(-5deg);
          transform-origin: top right;
        }
      }
    }
    .el-dialog__body {
      padding: 0;
      .dialog-content-wrap {
        padding: 50px;
        height: 348px;
        .dialog-content {
          display: flex;
          flex-wrap: wrap;
          .el-checkbox {
            margin: 0;
            width: 33.33%;
            margin-bottom: $spacing-size;
            .el-checkbox__label {
              width: calc(100% - 30px);
              display: inline-block;
              line-height: $spacing-large-size;
              vertical-align: middle;
              @include text-overflow();
            }
          }
        }
        .no-data {
          width: 100%;
        }
      }
    }

    .footer-btns {
      padding-bottom: 30px;
      text-align: center;
    }
  }
}
</style>
