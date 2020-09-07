<!--
 * @Author: jiapeng.Zheng
 * @Date: 2019-08-12 08:49:40
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-04-09 17:38:56
 * @Description: 统计信息
 -->

<template>
  <div class="statistic-info">
    <template v-if="deviceSn === '0'">
      <!-- 流量统计 -->
      <div class="info-card" v-loading="totalStatsLoading" @mouseenter="onMouseenter($refs.wave1)" @mouseleave="onMouseleave($refs.wave1)">
        <div class="card-background"></div>
        <div class="card-background-icon wave-1 monitor" :style="{ background: 'linear-gradient(to right, #04ffe4, #048ad3)' }"></div>
        <!-- <canvas-waves class="card-background" ref="wave1" :waveProp="[{ direction: 'toRight', startColor: '#04ffe4', stopColor: '#048ad3' }]"></canvas-waves> -->
        <div class="card-title">
          <icon name="panel/monitor" :linearGradient="{ id: 'monitor', direction: 'toRight', startColor: '#04ffe4', stopColor: '#048ad3' }"></icon>
        </div>
        <div class="card-content">
          <EasyScrollbar class="content-scrollbar" :barOption="barOption">
            <div class="content-item" v-for="(item, key) in deviceFlowStats" :key="key">
              <span class="item-name" :title="item.Name">{{ item.Name }}</span>
              <template v-if="item.Num">
                <span class="item-value" :title="item.Num + item.Unit">{{ $utils.bigNumberFormat(item.Num) }}</span>
                <span class="item-unit">{{ item.Unit }}</span>
              </template>
              <template v-else>
                <span class="item-value">未知</span>
                <span class="item-unit"></span>
              </template>
            </div>
          </EasyScrollbar>
        </div>
      </div>
      <!-- 状态统计 -->
      <div class="info-card" @mouseenter="onMouseenter($refs.wave2)" @mouseleave="onMouseleave($refs.wave2)">
        <div class="card-background"></div>
        <div class="card-background-icon wave-2 state" :style="{ background: 'linear-gradient(to right, #6a78f2, #ab5bd6)' }"></div>

        <!-- <canvas-waves class="card-background" ref="wave2" :waveProp="[{ direction: 'toRight', startColor: '#6a78f2', stopColor: '#ab5bd6' }]"></canvas-waves> -->
        <div class="card-title">
          <icon name="panel/state" :linearGradient="{ id: 'state', direction: 'toRight', startColor: '#6a78f2', stopColor: '#ab5bd6' }"></icon>
        </div>
        <div class="card-content">
          <EasyScrollbar class="content-scrollbar" :barOption="barOption">
            <div class="content-item" v-for="item in deviceStateStats" :key="item.Id">
              <span class="item-name" :title="item.Name + '设备'">{{ item.Name }}设备</span>
              <span class="item-value" :style="{ color: item.Color }" :title="item.Num + item.Unit">{{ $utils.bigNumberFormat(item.Num, 0) }}</span>
              <span class="item-unit">{{ item.Unit }}</span>
            </div>
          </EasyScrollbar>
        </div>
      </div>
      <!-- 类型统计 -->
      <div class="info-card" @mouseenter="onMouseenter($refs.wave3)" @mouseleave="onMouseleave($refs.wave3)">
        <div class="card-background"></div>
        <div class="card-background-icon wave-3 controlMode" :style="{ background: 'linear-gradient(to right, #eb8970, #ff5e8d)' }"></div>

        <!-- <canvas-waves class="card-background" ref="wave3" :waveProp="[{ direction: 'toRight', startColor: '#eb8970', stopColor: '#ff5e8d' }]"></canvas-waves> -->
        <div class="card-title">
          <icon name="menu/controlMode" :linearGradient="{ id: 'controlMode', direction: 'toRight', startColor: '#eb8970', stopColor: '#ff5e8d' }"></icon>
        </div>
        <div class="card-content">
          <EasyScrollbar class="content-scrollbar" :barOption="barOption">
            <div class="content-item" v-for="(item, key) in deviceTypeStats" :key="key">
              <span class="item-name" :title="item.TypeName">{{ item.TypeName }}</span>
              <span class="item-value" :title="item.Num">{{ $utils.bigNumberFormat(item.Num, 0) }}</span>
              <span class="item-unit">台</span>
            </div>
          </EasyScrollbar>
        </div>
      </div>
    </template>
    <template v-else>
      <!-- 单台设备的监控 -->
      <div class="info-card" v-loading="devicInfoLoading">
        <div class="card-background"></div>
        <div class="card-background-icon monitor"></div>
        <div class="card-title">
          <span @click="isSimCardShow = true">
            <icon name="panel/monitor" :linearGradient="{ id: 'monitor', direction: 'toRight', startColor: '#04ffe4', stopColor: '#048ad3' }"></icon>
          </span>
        </div>
        <div class="card-content">
          <EasyScrollbar class="content-scrollbar" :barOption="barOption">
            <div class="monitor-wrap">
              <template v-if="_monitorData.length > 0">
                <monitor
                  class="content-item"
                  v-for="itemData in _monitorData"
                  :key="itemData.Id"
                  :data="itemData"
                  :dataKey="itemData.Id"
                  :title="itemData.DataName"
                  :disabled="itemData.disabled"
                  v-model="itemData.DataValue"
                ></monitor>
              </template>
              <template v-else>
                <div class="no-data">{{ $t('nodata') }}</div>
              </template>
            </div>
          </EasyScrollbar>
          <sim-card-info v-model="isSimCardShow" :deviceInfo="deviceInfo"></sim-card-info>
        </div>
      </div>
    </template>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'

import SimCardInfo from '@views/home/statistics/simCardInfo.vue'
import { DECIVE_ONLINE_TIME } from '@constants/index'
import { BAR_OPTION } from '@constants/easyScrollbarConfig/index.js'
import ThemeColor from '@constants/theme/color.js'
import { DATA_TYPE_ENUM, DATA_TYPE_MONITOR } from '@constants/dataTypeConfig/index.js'

import $_ from '@helper/lodash.js'
import $utils from '@helper/utils.js'
import DeviceApi from '@helper/apis/device.js'
import StatisticsApi from '@helper/apis/statistics'

@Component({ components: { SimCardInfo } })
export default class StatisticsInfo extends Vue {
  /**
   * activeItemInfo组件下子组件的类型，根据 activeTitle 切换不同的子组件
   */
  @Prop() projectId: string
  @Prop() deviceSn: string
  @Prop({
    default() {
      return {}
    }
  })
  deviceInfo: DeviceVO
  @Prop({
    default() {
      return []
    }
  })
  controlFormatList: Array<DeviceControlBO>

  isSimCardShow = false
  /**
   * EasyScrollbar 滚动条配置
   */
  barOption = BAR_OPTION
  /**
   * 当前统计信息包含的设备（主要用来统计设备的在线/离线）
   */
  deviceData: Array<DeviceOverViewDataBO> = []

  totalStatsLoading = true
  // deviceFlowStats
  /**
   * 设备流量统计
   */
  deviceFlowStats: { [propName: string]: DeviceStatsDataBO } = {
    // 0F1771：总水量（累积值）的数据定义，暂时写死
    '0F1771': { Id: '0F1771', Name: '水量', Num: 0, Color: '', Unit: '' },
    // 0C0731：总电量（非三相电表。累积值）的数据定义，暂时写死
    '0C0731': { Id: '0C0731', Name: '电量', Num: 0, Color: '', Unit: '' },
    // 0K18D1 ：总电量（三相电表。累积值）的数据定义，暂时写死
    '0K18D1': { Id: '0K18D1', Name: '三相电表电量', Num: 0, Color: '', Unit: '' }
  }

  /**
   * 设备状态统计
   */
  deviceStateStats: { [propName: string]: DeviceStatsDataBO } = {
    online: { Id: 'online', Name: '在线', Num: 0, Color: '', Unit: '台' },
    offline: { Id: 'offline', Name: '离线', Num: 0, Color: '', Unit: '台' }
  }
  /**
   * 设备类型统计
   */
  deviceTypeStats: Array<{ TypeName: string; TypeId: number; Num: number }> = []

  devicInfoLoading = true

  created() {
    this.getStatsData(this.projectId)
  }

  @Watch('projectId')
  onProjectIdChange(nv: string) {
    // console.log(nv, od)
    this.getStatsData(nv)
  }
  @Watch('deviceSn')
  onDeviceSnChange() {
    this.getStatsData(this.projectId)
  }

  @Watch('deviceData')
  onDeviceDataChange(nv: Array<DeviceOverViewDataBO>) {
    this.deviceStateStats.online.Num = 0
    this.deviceStateStats.online.Color = ThemeColor[this.$theme]['online']
    this.deviceStateStats.offline.Num = 0
    this.deviceStateStats.offline.Color = ThemeColor[this.$theme]['offline']
    nv.forEach(({ Online }: DeviceOverViewDataBO) => {
      let isOnline = false // 是否在线
      if (!$_.isNil(Online)) {
        isOnline = $utils.dateCompare(new Date(), new Date(Online), 'ms') < DECIVE_ONLINE_TIME
      }
      if (isOnline) {
        this.deviceStateStats.online.Num += 1
      } else {
        this.deviceStateStats.offline.Num += 1
      }
    })
  }

  @Watch('$theme')
  onThemeChange(newVal) {
    this.deviceStateStats.online.Color = ThemeColor[newVal]['online']
    this.deviceStateStats.offline.Color = ThemeColor[newVal]['offline']
  }

  get _monitorData() {
    this.devicInfoLoading = false
    return this.controlFormatList.filter(ele => {
      return ele.componentDataType === DATA_TYPE_MONITOR || ele.componentDataType === DATA_TYPE_ENUM
    })
  }

  @Watch('_monitorData')
  onMonitorDataChange() {
    if (this.$mqtt_device_data[this.deviceInfo.DeviceNo]) {
      this.onMqttDeviceDataChange(this.$mqtt_device_data)
    }
  }

  @Watch('$mqtt_device_data')
  onMqttDeviceDataChange(newValue) {
    for (const dataKey in this.controlFormatList) {
      const { displayKey } = this.controlFormatList[dataKey]
      if (newValue[this.deviceInfo.DeviceNo]['data'][displayKey] !== undefined) {
        this.controlFormatList[dataKey].disableTitle = ''
        this.controlFormatList[dataKey].DataValue = newValue[this.deviceInfo.DeviceNo]['data'][displayKey]
        this.controlFormatList[dataKey].historyValue[newValue[this.deviceInfo.DeviceNo]['ts']] = newValue[this.deviceInfo.DeviceNo]['data'][displayKey]
        this.controlFormatList[dataKey].disabled = false
      } else {
        this.controlFormatList[dataKey].disableTitle = '数据标识不存在'
      }
      this.controlFormatList[dataKey].isLoading = false
    }
  }

  /**
   * 根据 项目/站场ID 获取统计信息
   * @param {string} projectId  项目/站场ID
   */
  getStatsData(projectId: string) {
    this.getWarnStatistics(projectId)
    this.getTypeData(projectId)
    this.getTotalStatsData(projectId)
  }
  /**
   * 根据 项目/站场ID 获取报警分类统计的个数
   * @param {string} projectId  项目/站场ID
   */
  getWarnStatistics(projectId) {
    if (this.deviceSn === '0') {
      StatisticsApi.getWarnStatistics(projectId === '0' ? undefined : projectId)
        .then(res => {
          const list: Array<DeviceStatsDataBO> = res.List
          list.forEach(ele => {
            this.$set(this.deviceStateStats, String(ele.Id), {
              ...ele,
              Color: this.$commonParam.warnTypeDict[ele.Id].Color,
              Unit: '台'
            })
          })
        })
        .catch(e => {
          console.error('获取报警分类统计失败：', e)
          this.$message.error('获取报警分类统计失败')
        })
    }
  }
  /**
   * 根据 项目/站场ID 获取设备类型统计
   * @param {string} projectId  项目/站场ID
   */
  getTypeData(projectId) {
    // 只统计项目、站场下的设备类型，具体的设备只有一种类型，没有统计的必要
    if (this.deviceSn === '0') {
      DeviceApi.getDeviceOverView(projectId)
        .then(res => {
          this.deviceData = res.Data // 项目/站场下的所有设备，用于判断在线设备的数量(onDeviceDataChange)
          this.deviceTypeStats = res.TypeData // 项目/站场下各种设备类型统计
        })
        .catch(e => {
          console.error('获取设备类型统计信息失败：', e)
          this.$message.error('获取设备类型统计信息失败')
        })
    }
  }

  /**
   * 根据 项目/站场ID 获取累计值的统计数据
   * @param {string} projectId  项目/站场ID
   */
  getTotalStatsData(projectId) {
    if (this.deviceSn === '0') {
      // 清空累计值统计
      Object.keys(this.deviceFlowStats).forEach(key => {
        this.deviceFlowStats[key].Num = 0 // qin
        this.deviceFlowStats[key].Unit = ''
      })
      this.totalStatsLoading = true
      const totalStatsDataKeys = Object.keys(this.deviceFlowStats) // 要统计的key
      // 获取设备最新一条在线数据
      StatisticsApi.getDeviceOnline(projectId === '0' ? undefined : projectId, totalStatsDataKeys)
        .then(res => {
          const staData = $utils.countDeviceOnline(res.list, totalStatsDataKeys)
          Object.keys(staData).forEach(key => {
            const { Num, Unit } = staData[key]
            this.deviceFlowStats[key].Num = Num
            this.deviceFlowStats[key].Unit = Unit
          })
        })
        .catch(e => {
          console.error('获取累计统计失败：', e)
          this.$message.error('获取累计统计失败')
        })
        .finally(() => {
          this.totalStatsLoading = false
        })
    }
  }

  onMouseenter(childEle) {
    if (childEle) {
      childEle.onMouseenter()
    }
  }
  onMouseleave(childEle) {
    if (childEle) {
      childEle.onMouseleave()
    }
  }
}
</script>
<style lang="scss">
@import '~@assets/scss/variables.scss';
@import '~@assets/scss/mixins.scss';
$module-height: 170px;
$title-height: $spacing-size * 3;
.statistic-info {
  // height: $module-height;
  display: flex;
  .info-card {
    width: 33.33%;
    // height: 100%;
    border-radius: $radius-size/2;
    margin-right: $spacing-size;
    padding: $spacing-size;
    position: relative;
    &:first-child:last-child {
      width: 100%;
      .card-content {
        .monitor-wrap {
          display: flex;
          flex-wrap: wrap;
          .content-item {
            width: 50%;
            padding: 0 $spacing-small-size;
          }
        }
      }
    }
    &:last-child {
      margin-right: 0;
    }
    .card-background {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      z-index: -2;
      background-color: #1a1a1c;
    }
    .card-background-icon {
      width: 100%;
      height: 100%;
      padding: $title-height + $spacing-size 0 $spacing-size * 2 0;
      position: absolute;
      z-index: -1;
      top: 0;
      left: 0;
      $size: $module-height - ($title-height + $spacing-size + $spacing-size * 2);
      -webkit-mask-size: $size;
      -webkit-mask-repeat: no-repeat;
      -webkit-mask-position-x: calc(100% + #{$size/2});
      -webkit-mask-position-y: bottom;
      -webkit-mask-origin: content;
      &.monitor {
        mask-image: url('~@assets/images/icon/monitor.svg');
      }
      &.state {
        mask-image: url('~@assets/images/icon/state.svg');
      }
      &.controlMode {
        mask-image: url('~@assets/images/icon/controlMode.svg');
      }
      &[class*='wave-'] {
        -webkit-mask-position-x: 0;
        -webkit-mask-size: 100%;
        -webkit-mask-origin: border-box;
        @for $i from 1 through 3 {
          &.wave-#{$i} {
            mask-image: url('~@assets/images/icon/wave0#{$i}.svg');
          }
        }
      }
    }
    .card-title {
      margin-bottom: 0;
      .icon {
        font-size: $title-height;
        width: $title-height - $spacing-size; // 减去 padding-bottom
        margin: 0;
        padding-bottom: $spacing-size;
        border-bottom: 1px solid currentColor;
      }
    }
    .card-content {
      height: 100%;
      margin-top: -$title-height + $spacing-small-size;
      padding-top: $title-height;
      font-size: $font-small;
      // display: flex;
      // flex-direction: column;

      .content-item {
        margin-bottom: $spacing-small-size;
        @include text-overflow();
        .item-value {
          font-size: $font-large;
        }
      }
    }
  }
}
</style>
