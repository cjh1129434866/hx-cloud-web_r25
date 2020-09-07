<!--
 * @Author: jiapeng.Zheng
 * @Date: 2019-02-26 14:08:35
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-04-10 16:36:58
 * @Description: 统计图-查看更多
 -->
<template>
  <el-dialog
    :visible="isVisible"
    :fullscreen="true"
    :lock-scroll="true"
    :modal-append-to-body="false"
    :close-on-click-modal="false"
    :show-close="false"
    class="edit-dialog statistics-view-dialog"
    @close="onClose"
  >
    <span slot="title" class="el-dialog__title">{{ viewStaData.shortTitle }}</span>
    <!-- 搜索 -->
    <el-form class="chart-view-search-form">
      <el-radio-group class="search-form-item" v-model="activeChartType" @change="onRadioChange">
        <el-radio-button v-for="(ele, index) in statShowWays" :key="index" :label="ele.key">
          <icon :name="ele.icon"></icon>
        </el-radio-button>
      </el-radio-group>
      <el-date-picker
        class="search-form-item"
        v-model="searchForm.dateRange"
        type="daterange"
        align="right"
        :clearable="false"
        :placeholder="$t('pleaseSelect') + $t('dateRange')"
        :picker-options="pickerOptions"
      ></el-date-picker>
      <el-button class="search-form-item" type="primary" icon="search" :loading="loading" @click="onSearchClick">{{ $t('search') }}</el-button>
    </el-form>
    <!-- tab -->
    <el-tabs v-model="activeChartIndex" type="card" @tab-click="onTabClick">
      <el-tab-pane v-loading="loading" v-for="(tabItem, chartIndex) in chartArray" :key="chartIndex" :label="tabItem.label" :name="String(chartIndex)">
        <div v-if="!staData.hasData" class="no-data">{{ $t('nodata') }}</div>
        <template v-if="staData.hasData">
          <!-- 图表 -->
          <!-- <div v-show="activeChartType === stat_show_way_chart">
          </div>-->
          <div v-show="activeChartType === stat_show_way_chart" :id="`statistics-chart-view-${tabItem.name}`" class="statistics-chart statistics-chart-view"></div>

          <!-- 表单 -->
          <div class="statistics-table" :ref="`statisticsTable${chartIndex}`" v-show="activeChartType === stat_show_way_table">
            <!-- 表格：固定表头 -->
            <div class="chart-view-table-wrap fixed-head" :ref="`tableHeadWrap${chartIndex}`">
              <table class="chart-view-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{{ $t('sites') }}</th>
                    <th>{{ $t('device') }}</th>
                    <template v-for="(_date, index) in Object.keys(staData[tabItem.dataKey]).sort()">
                      <th :key="`${index}_v`">{{ _date }}</th>
                    </template>
                    <th>总计</th>
                  </tr>
                </thead>
              </table>
            </div>
            <!-- 表格：固定列 -->
            <div class="chart-view-table-wrap fixed-col" :ref="`tableColWrap${chartIndex}`">
              <table class="chart-view-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{{ $t('sites') }}</th>
                    <th>{{ $t('device') }}</th>
                    <!-- 固定列中的隐藏列的表头，为了使固定列的行高和滚动的表格的内容的行高一致 -->
                    <template v-for="(_date, index) in Object.keys(staData[tabItem.dataKey]).sort()">
                      <th :key="`${index}_v`">
                        <div style="visibility:hidden;">{{ _date }}</div>
                      </th>
                    </template>
                    <th>总计</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- 遍历站场 -->
                  <template v-for="(station, stationKey, stationIndex) in staData.station">
                    <!-- 遍历站场中的设备 -->
                    <tr v-for="(device, deviceKey, deviceIndex) in station._deviceObj" :key="`${stationKey}${deviceKey}`">
                      <td
                        v-if="deviceIndex === 0"
                        :rowspan="Object.keys(station._deviceObj).length > 1 ? Object.keys(station._deviceObj).length + 1 : Object.keys(station._deviceObj).length"
                      >
                        {{ stationIndex + 1 }}
                      </td>
                      <td v-if="deviceIndex === 0" :rowspan="Object.keys(station._deviceObj).length">
                        {{ myAllSiteObj[stationKey] ? myAllSiteObj[stationKey].ProjectName : '' }}
                      </td>
                      <td>{{ device.DeviceName }}</td>
                      <!-- 固定列中的隐藏列，为了使固定列的行高和滚动的表格的内容的行高一致 -->
                      <template v-for="(_date, index) in Object.keys(staData[tabItem.dataKey]).sort()">
                        <td :key="`${index}_v`">
                          <div style="visibility:hidden;">
                            {{
                              station[tabItem.dataKey][_date]
                                ? station[tabItem.dataKey][_date].Device[deviceKey]
                                  ? $utils.bigNumberFormat(station[tabItem.dataKey][_date].Device[deviceKey].Values)
                                  : '0'
                                : '0'
                            }}
                            <!-- {{ staData._baseUnit }} -->
                          </div>
                        </td>
                      </template>
                      <!--
                        // 根据时间合计同一设备的值
                        // 不同时间段统计的设备有可能不一致，导致 station[tabItem.dataKey][index].Device[deviceKey] 可能为空
                        // let deviceObj = station[tabItem.dataKey][index].Device[deviceKey]
                      -->
                      <td>
                        {{
                          $utils.bigNumberFormat(
                            Object.keys(station[tabItem.dataKey])
                              .map(index => {
                                return station[tabItem.dataKey][index].Device[deviceKey] ? station[tabItem.dataKey][index].Device[deviceKey].Values : '0'
                              })
                              .reduce((v1, v2) => v1 * 1 + v2 * 1)
                          )
                        }}
                        <!-- {{ staData._baseUnit }} -->
                      </td>
                    </tr>
                    <!-- 各个站场中设备的合计 -->
                    <tr v-if="Object.keys(station._deviceObj).length > 1" :key="`${stationKey}all`">
                      <td colspan="2">合计</td>
                      <template v-for="(_date, index) in Object.keys(staData[tabItem.dataKey]).sort()">
                        <td :key="`${index}_all`">
                          <div>
                            {{ station[tabItem.dataKey][_date] ? $utils.bigNumberFormat(station[tabItem.dataKey][_date].Values) : '0' }}
                            <!-- {{ staData._baseUnit }} -->
                          </div>
                        </td>
                      </template>
                      <!-- 根据时间合计同一站场的值 -->
                      <td>
                        {{
                          $utils.bigNumberFormat(
                            Object.keys(station[tabItem.dataKey])
                              .map(index => station[tabItem.dataKey][index].Values)
                              .reduce((v1, v2) => v1 * 1 + v2 * 1)
                          )
                        }}
                        <!-- {{ staData._baseUnit }} -->
                      </td>
                    </tr>
                  </template>
                  <!-- 所有站场的总计 -->
                  <tr>
                    <td colspan="3">总计</td>
                    <template v-for="(_date, index) in Object.keys(staData[tabItem.dataKey]).sort()">
                      <td :key="`${index}_totla`">
                        <div>
                          {{ staData[tabItem.dataKey][_date] ? $utils.bigNumberFormat(staData[tabItem.dataKey][_date].Values) : '0' }}
                          <!-- {{ staData._baseUnit }} -->
                        </div>
                      </td>
                    </template>
                    <td>
                      {{
                        $utils.bigNumberFormat(
                          Object.keys(staData[tabItem.dataKey])
                            .map(index => staData[tabItem.dataKey][index].Values)
                            .reduce((v1, v2) => v1 * 1 + v2 * 1)
                        )
                      }}
                      <!-- {{ staData._baseUnit }} -->
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <!-- 表格：固定表头和固定列交汇 -->
            <div class="chart-view-table-wrap fixed-col-head-cross" :ref="`tableColHeadWrap${chartIndex}`">
              <table class="chart-view-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{{ $t('sites') }}</th>
                    <th>{{ $t('device') }}</th>
                  </tr>
                </thead>
              </table>
            </div>
            <!-- 表格：正文 -->
            <div class="chart-view-table-wrap table-content" :ref="`tableContentWrap${chartIndex}`">
              <EasyScrollbar class="content-scrollbar" :style="{ height: '100%' }" :ref="`tableScrollbar${chartIndex}`" :barOption="barOption">
                <table class="chart-view-table chart-view-tabless" :ref="`tableContentView${chartIndex}`">
                  <thead>
                    <tr>
                      <th :ref="`tableNumCol${chartIndex}`">#</th>
                      <th :ref="`tableStationNameCol${chartIndex}`">{{ $t('sites') }}</th>
                      <th :ref="`tableDeviceNameCol${chartIndex}`">{{ $t('device') }}</th>
                      <template v-for="(_date, index) in Object.keys(staData[tabItem.dataKey]).sort()">
                        <th :key="`${index}_v`">{{ _date }}</th>
                      </template>
                      <th>总计</th>
                    </tr>
                  </thead>
                  <tbody>
                    <!-- 遍历站场 -->
                    <template v-for="(station, stationKey, stationIndex) in staData.station">
                      <!-- 遍历站场中的设备 -->
                      <tr v-for="(device, deviceKey, deviceIndex) in station._deviceObj" :key="`${stationKey}${deviceKey}`">
                        <td
                          v-if="deviceIndex === 0"
                          :rowspan="Object.keys(station._deviceObj).length > 1 ? Object.keys(station._deviceObj).length + 1 : Object.keys(station._deviceObj).length"
                        >
                          {{ stationIndex + 1 }}
                        </td>
                        <td v-if="deviceIndex === 0" :rowspan="Object.keys(station._deviceObj).length">
                          {{ myAllSiteObj[stationKey] ? myAllSiteObj[stationKey].ProjectName : '' }}
                        </td>
                        <td>{{ device.DeviceName }}</td>
                        <!-- 遍历各个设备中的年月日 -->
                        <template v-for="(_date, index) in Object.keys(staData[tabItem.dataKey]).sort()">
                          <td :key="`${index}_v`">
                            <div>
                              {{
                                station[tabItem.dataKey][_date]
                                  ? station[tabItem.dataKey][_date].Device[deviceKey]
                                    ? $utils.bigNumberFormat(station[tabItem.dataKey][_date].Device[deviceKey].Values)
                                    : '0'
                                  : '0'
                              }}
                              <!-- {{ staData._baseUnit }} -->
                            </div>
                          </td>
                        </template>
                        <!-- 
                            // 根据时间合计同一设备的值
                            // 不同时间段统计的设备有可能不一致，导致 station[tabItem.dataKey][index].Device[deviceKey] 可能为空
                            // let deviceObj = station[tabItem.dataKey][index].Device[deviceKey]
                        -->
                        <td>
                          {{
                            $utils.bigNumberFormat(
                              Object.keys(station[tabItem.dataKey])
                                .map(index => {
                                  return station[tabItem.dataKey][index].Device[deviceKey] ? station[tabItem.dataKey][index].Device[deviceKey].Values : '0'
                                })
                                .reduce((v1, v2) => v1 * 1 + v2 * 1)
                            )
                          }}
                          <!-- {{ staData._baseUnit }} -->
                        </td>
                      </tr>
                      <!-- 各个站场中设备的合计 -->
                      <tr v-if="Object.keys(station._deviceObj).length > 1" :key="`${stationKey}all`">
                        <td colspan="2">合计</td>
                        <template v-for="(_date, index) in Object.keys(staData[tabItem.dataKey]).sort()">
                          <td :key="`${index}_all`">
                            <div>
                              {{ station[tabItem.dataKey][_date] ? $utils.bigNumberFormat(station[tabItem.dataKey][_date].Values) : '0' }}
                              <!-- {{ staData._baseUnit }} -->
                            </div>
                          </td>
                        </template>
                        <!-- 根据时间合计同一站场的值 -->
                        <td>
                          {{
                            $utils.bigNumberFormat(
                              Object.keys(station[tabItem.dataKey])
                                .map(index => station[tabItem.dataKey][index].Values)
                                .reduce((v1, v2) => v1 * 1 + v2 * 1)
                            )
                          }}
                          <!-- {{ staData._baseUnit }} -->
                        </td>
                      </tr>
                    </template>
                    <!-- 所有站场的总计 -->
                    <tr>
                      <td colspan="3">总计</td>
                      <template v-for="(_date, index) in Object.keys(staData[tabItem.dataKey]).sort()">
                        <td :key="`${index}_totla`">
                          <div>
                            {{ staData[tabItem.dataKey][_date] ? $utils.bigNumberFormat(staData[tabItem.dataKey][_date].Values) : '0' }}
                            <!-- {{ staData._baseUnit }} -->
                          </div>
                        </td>
                      </template>
                      <td>
                        {{
                          $utils.bigNumberFormat(
                            Object.keys(staData[tabItem.dataKey])
                              .map(index => staData[tabItem.dataKey][index].Values)
                              .reduce((v1, v2) => v1 * 1 + v2 * 1)
                          )
                        }}
                        <!-- {{ staData._baseUnit }} -->
                      </td>
                    </tr>
                  </tbody>
                </table>
              </EasyScrollbar>
            </div>
          </div>
        </template>
      </el-tab-pane>
    </el-tabs>
    <span slot="footer">
      <el-button type="primary" :disabled="loading" @click="onToExcel">{{ $t('export') }}</el-button>
      <el-button type="cancel" @click="isVisible = false">{{ $t('cancel') }}</el-button>
    </span>
  </el-dialog>
</template>
<script>
// let _this

import * as echarts from 'echarts/lib/echarts' // 引入 echarts 主模块。
import { STAT_SHOW_WAY_CHART, STAT_SHOW_WAY_TABLE, STAT_SHOW_WAY, STAT_SHOW_LEVEL_ALL } from '@constants/statisticsConfig'
import { BAR_OPTION } from '@constants/easyScrollbarConfig/index.js'
import ThemeColor from '@constants/theme/color'
import $_ from '@helper/lodash'
import { TablesToExcel } from '@helper/utils/tableToExcel'

export default {
  name: 'statistics-view-dialog',

  props: {
    value: {
      type: Boolean,
      required: true
    },
    viewStaData: {},
    deviceSn: {
      type: String,
      default: '0'
    },
    deviceInfo: {
      type: Object,
      default() {
        return {}
      }
    },
    projectId: {},
    typeId: {},
    statShowLevel: {
      type: Number,
      require: true,
      default: STAT_SHOW_LEVEL_ALL
    }
  },
  data() {
    return {
      title: '',
      loading: false,
      isVisible: false,
      activeChartIndex: '0',
      chartArray: [
        { label: '日统计', name: 'day', dataKey: 'data' },
        { label: '月统计', name: 'month', dataKey: 'monthData' },
        { label: '年统计', name: 'year', dataKey: 'yearData' }
      ],
      activeChartType: STAT_SHOW_WAY_CHART,
      stat_show_way_chart: STAT_SHOW_WAY_CHART,
      stat_show_way_table: STAT_SHOW_WAY_TABLE,
      statShowWays: STAT_SHOW_WAY, // 统计数据的展示方式数组
      myAllSiteObj: {},
      nullStaData: {
        id: this.viewStaData.id,
        data: {},
        yearData: {},
        monthData: {},
        station: {},
        statName: '',
        unit: '',
        hasData: false
      },
      staData: {},
      searchForm: {
        ...this.$utils.getDateRange({ rangeNumber: 31 }),
        dateRange: [new Date(new Date().setTime(new Date().getTime() - 3600 * 1000 * 24 * 31)), new Date()]
      },
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now() - 8.64e7
        },
        // - 查看更多暂时允许查询超过3个月的数据
        // onPick({ maxDate, minDate }) {
        //   if (maxDate && minDate) {
        //     let range = new Date(maxDate).getTime() - new Date(minDate).getTime()
        //     if (range > SEARCH_DATE_RANGE) {
        //       this.$message.error('不允许查询超过3个月的数据')
        //       this.$nextTick(() => {
        //         _this.refreshTimes = [new Date(_this.statisticTime.Begin), new Date(_this.statisticTime.End)]
        //       })
        //     }
        //   }
        // },
        shortcuts: [
          {
            text: '最近一周',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            }
          }
        ]
      },
      tabConf: {
        colName: this.$t('sites')
      },
      barOption: {
        ...BAR_OPTION,
        horizrailenabled: true,
        zIndex: 10
      },
      tableScrollbar: {}
    }
  },
  async created() {
    this.staData = JSON.parse(JSON.stringify(this.nullStaData))
    const myAllSites = await this.$apis.project.myAllSites()
    myAllSites.list.forEach(item => {
      this.myAllSiteObj[item.Id] = item
    })
  },

  watch: {
    value(newVal) {
      this.isVisible = newVal
      if (this.isVisible) {
        window.addEventListener('resize', this.eChartsResize, false)
        this.getData(this.projectId, this.typeId)
      } else {
        window.removeEventListener('resize', this.eChartsResize, false)
      }
    },
    'tableScrollbar.moveX'() {
      const wrapLeft = this.$refs[`tableContentWrap${this.activeChartIndex}`][0].getBoundingClientRect()['left']
      const { left } = this.$refs[`tableContentView${this.activeChartIndex}`][0].getBoundingClientRect()
      this.$refs[`tableHeadWrap${this.activeChartIndex}`][0].scrollLeft = wrapLeft - left
    },
    'tableScrollbar.moveY'() {
      const wrapTop = this.$refs[`tableContentWrap${this.activeChartIndex}`][0].getBoundingClientRect()['top']
      const { top } = this.$refs[`tableContentView${this.activeChartIndex}`][0].getBoundingClientRect()
      this.$refs[`tableColWrap${this.activeChartIndex}`][0].scrollTop = wrapTop - top
    }
  },
  methods: {
    onClose() {
      this.isVisible = false
      this.searchForm = {
        ...this.$utils.getDateRange({ rangeNumber: 31 }),
        dateRange: [new Date(new Date().setTime(new Date().getTime() - 3600 * 1000 * 24 * 31)), new Date()]
      }
      this.$emit('input', this.isVisible)
    },
    /**
     * 搜索
     */
    onSearchClick() {
      this.searchForm.Begin = this.$utils.dateConvert(this.searchForm.dateRange[0], 'YYYY-MM-DD 00:00:00')
      this.searchForm.End = this.$utils.dateConvert(this.searchForm.dateRange[1], 'YYYY-MM-DD 23:59:59')
      this.getData(this.projectId, this.typeId)
    },
    /**
     * 获取数据
     */
    getData(projectId = 0, typeId) {
      this.loading = true
      this.$apis.statistics
        .getDeviceStatisticsDataList({
          ...this.searchForm,
          ProjectId: projectId,
          DeviceSn: this.deviceSn,
          TypeId: typeId
        })
        .then(r => {
          let staData = this.$utils.statisticsDataFormat(r.Data, {
            showLevel: this.statShowLevel,
            typeStatCof: this.$commonParam.deviceTypeDict
          })
          staData = staData[this.viewStaData.id]
          if (!staData) {
            staData = JSON.parse(JSON.stringify(this.nullStaData))
          } else {
            staData.hasData = true
          }
          this.staData = staData
          this.$nextTick(() => {
            this.creatChart() // 必须等下一个循环时才能获取到图表的元素
            this.tableResize()
          })
        })
        .catch(e => {
          console.error(e)
        })
        .fin(() => {
          this.loading = false
        })
    },
    onRadioChange() {
      this.$nextTick(() => {
        this.creatChart() // 必须等下一个循环时才能获取到图表的元素
        this.tableResize()
      })
    },
    onTabClick() {
      this.$nextTick(() => {
        this.creatChart() // 必须等下一个循环时才能获取到图表的元素
        this.tableResize()
      })
    },
    // 图表构建
    creatChart() {
      if (this.activeChartType === this.stat_show_way_chart) {
        const { name, dataKey } = this.chartArray[this.activeChartIndex]
        const $chart = document.getElementById(`statistics-chart-view-${name}`)
        if ($chart && this.staData) {
          this.drawECharts(
            echarts.init($chart),
            {
              title: `${this.staData.statName} ${this.staData._baseUnit}`,
              data: this.staData[dataKey],
              type: 'line',
              Unit: this.staData._baseUnit
            },
            { isRefresh: false }
          )
        }
      }
    },
    /**
     * 生成图表
     * @param   {Object}  echartsObj    echarts.init 生成的对象
     * @param   {Object}  echartData    生成统计图的数据对象
     * echartData = {data:[{ name: '18/10/18', data: { Unit: 'V' }, value: '220' }], Category:CUM_VAL_STAT, type:'line', Unit:'V'}
     * @param   {option}  option        生成统计图所需的配置
     * option = {idataDefinePanelTplVuetOption 所需的配置信息'}
     */
    drawECharts(echartsObj, echartData, option) {
      const { data, type, Unit } = echartData
      const { isRefresh, echartOption } = option
      const dataKey = Object.keys(data) // .sort()
      // echart 配置
      const opt = {
        grid: {
          top: 10,
          left: 10,
          right: 40,
          bottom: 10,
          // borderColor: '#3a3a3c',
          containLabel: true
        },
        xAxis: {
          boundaryGap: false,
          axisLine: {
            lineStyle: { color: ThemeColor[this.$theme].border }
          },
          axisLabel: {
            color: ThemeColor[this.$theme].font
          },
          data: dataKey
        },
        yAxis: {
          splitLine: {
            lineStyle: { color: ThemeColor[this.$theme].border }
          },
          axisLine: {
            lineStyle: { color: ThemeColor[this.$theme].border }
          },
          axisLabel: {
            color: ThemeColor[this.$theme].font,
            formatter: value => {
              return this.$utils.bigNumberFormat(value)
            }
          },
          max: function(value) {
            if (value.max <= 0) {
              return Math.ceil(value.max - value.max * (1 / 3))
            } else {
              return Math.ceil(value.max + value.max * (1 / 3))
            }
          },
          min: function(value) {
            if (value.min <= 0) {
              return Math.floor(value.min + value.min * (2 / 3))
            } else {
              return Math.floor(value.min - value.min * (2 / 3))
            }
          }
        },
        tooltip: {
          trigger: 'axis',
          // formatter: `{b}<br />{c} ${Unit}`
          formatter: params => {
            const { value, axisValue } = params[0]
            return `${axisValue}<br />${this.$utils.bigNumberFormat(value)}${Unit}`
          }
        },
        series: [
          {
            name: '',
            type: type,
            data: dataKey.map(item => {
              return data[item].Values
            }),
            smooth: true, // 让曲线变平滑的
            // 折线的样式
            lineStyle: {
              width: 3, // 线宽
              color: ThemeColor[this.$theme].active
            }
            // // 面积图样式
            // areaStyle: {
            //   // 线性渐变，前四个参数分别是 x0, y0, x2, y2, 范围从 0 - 1，相当于在图形包围盒中的百分比，如果 globalCoord 为 `true`，则该四个值是绝对的像素位置
            //   color: {
            //     type: 'linear',
            //     x: 0,
            //     y: 0,
            //     x2: 0,
            //     y2: 1,
            //     colorStops: [
            //       {
            //         offset: 0,
            //         color: chartColor[0] // 0% 处的颜色
            //       },
            //       {
            //         offset: 1,
            //         color: 'white' // 100% 处的颜色
            //       }
            //     ],
            //     global: false // 缺省为 false
            //   }
            // }
          }
        ]
      }

      Object.assign(opt, echartOption)
      // 是否重新加载
      if (isRefresh) {
        echartsObj.clear()
      }
      echartsObj.setOption(opt)
      echartsObj.resize()
    },
    // table 转为 excel 文件
    onToExcel() {
      const fileName = `《${this.$utils.dateConvert(this.searchForm.dateRange[0], 'YYYY年MM月DD日')}至${this.$utils.dateConvert(this.searchForm.dateRange[1], 'YYYY年MM月DD日')}${
        this.viewStaData.shortTitle
      }》统计表单`
      const $tables = []
      for (const i in this.chartArray) {
        $tables.push({
          // $table: this.$refs[`tableContentView${i}`][0],
          worksheetEle: this.$refs[`tableContentView${i}`][0],
          worksheetName: this.chartArray[i].label
        }) //  { label: '日统计', name: 'day', dataKey: 'data' },
      }
      const table2Excel = new TablesToExcel($tables)
      table2Excel.toExcel(fileName, 'xlsx')
      // this.$utils.tableToExcel($tables, fileName)
    },
    /**
     * 表格自适应
     * @description
     * 1、根据表单固定的列来计算是否显示固定列
     * 2、根据表格的高度计算 statistics-table 的最大高度
     */
    tableResize() {
      if (this.activeChartType === this.stat_show_way_table) {
        // ========================= 根据表单固定的列来计算是否显示固定列 =========================
        this.tableScrollbar = this.$refs[`tableScrollbar${this.activeChartIndex}`][0]
        const $tableNumCol = this.$refs[`tableNumCol${this.activeChartIndex}`][0]
        const $tableStationNameCol = this.$refs[`tableStationNameCol${this.activeChartIndex}`][0]
        const $tableDeviceNameCol = this.$refs[`tableDeviceNameCol${this.activeChartIndex}`][0]
        const $tableColWrap = this.$refs[`tableColWrap${this.activeChartIndex}`][0]
        const $tableColHeadWrap = this.$refs[`tableColHeadWrap${this.activeChartIndex}`][0]
        // 这里的 360 即 .fixed-col-head-cross 的宽度
        if ($tableNumCol.clientWidth + $tableStationNameCol.clientWidth + $tableDeviceNameCol.clientWidth >= 360) {
          $tableColWrap.style.display = 'none'
          $tableColHeadWrap.style.display = 'none'
        } else {
          $tableColWrap.style.display = 'block'
          $tableColHeadWrap.style.display = 'block'
        }
        // ========================= 根据表格的高度计算 statistics-table 的最大高度 =========================
        const $tableContentView = this.$refs[`tableContentView${this.activeChartIndex}`][0]
        const $statisticsTable = this.$refs[`statisticsTable${this.activeChartIndex}`][0]
        $statisticsTable.style.maxHeight = `${$tableContentView.clientHeight + 1}px` // 加 1 使滚动条不会出现
      }
    },
    /**
     * echaerts 图表自适应
     */
    eChartsResize: $_.throttle(function() {
      const $chart = document.querySelectorAll('.statistics-chart-view')
      const chartArray = Array.from($chart)
      chartArray.forEach(ele => {
        const myChart = echarts.getInstanceByDom(ele)
        if (myChart) {
          myChart.resize()
        }
      })
      this.tableResize()
    }, 500)
  }
}
</script>
<style lang="scss">
@import '~@assets/scss/variables.scss';
// 全屏高度重置
.statistics-view-dialog {
  // z-index: $max-index !important; // 由于 element-ui 会自动在该元素上生成内联的 z-index 样式，故使用 !important
  .no-data {
    padding: $spacing-size;
  }
  .is-fullscreen {
    .el-dialog__body {
      // el-dialog__body 的高度等于 el-dialog 的高度减去 el-dialog__header 的高度 和  el-dialog__footer 的高度
      height: calc(100% - 54px - 70px);
      .el-tabs--card {
        height: 100%;
        // el-tabs__content 的高度等于 el-tabs 的高度减去 el-tabs__content 的高度 (content + marging height)
        .el-tabs__content {
          height: calc(100% - 42px - 15px);
          .el-tab-pane {
            height: 100%;
            .statistics-chart-view,
            .statistics-table {
              position: relative;
              height: 100%;
              .table-content {
                height: 100%;
              }
            }
          }
        }
      }
    }
  }
}
.chart-view-search-form {
  display: flex;
  justify-content: flex-end;
  .el-radio-button {
    margin-bottom: 0;
  }
  .search-form-item {
    margin-right: 5px;
  }
}
// echart 图表
.statistics-chart-view {
  height: 100%;
  min-height: 200px;
}
// 表单
.chart-view-table-wrap {
  width: 100%;
  overflow: hidden;
  &.fixed-head,
  &.fixed-col,
  &.fixed-col-head-cross {
    position: absolute;
    z-index: 10;
    overflow: hidden;
  }
  &.fixed-col,
  &.fixed-col-head-cross {
    width: 360px;
  }
  &.fixed-head,
  &.fixed-head,
  &.table-content {
    border-right: 1px solid $border-grey;
  }
  &.fixed-col {
    height: 100%;
    box-shadow: 1px 0 8px #d3d4d6;
    border-bottom: 1px solid $border-grey;
  }
}
.chart-view-table {
  table-layout: fixed;
  border-collapse: collapse;
  width: 100%;
  border: 1px solid $border-grey;
  border-left: none;
}
.chart-view-table thead th {
  line-height: 20px;
  padding: 8px 12px;
  border-bottom: 1px solid $border-grey;
  border-left: 1px solid $border-grey;
  white-space: nowrap;
  text-align: center;
  font-weight: normal !important;
  letter-spacing: 1px;
  width: 120px;
}
.chart-view-table tbody td {
  text-align: center;
  line-height: 20px;
  padding: 8px 10px;
  font-size: $font-small;
  border-bottom: 1px solid $border-grey;
  border-left: 1px solid $border-grey;
}
</style>
