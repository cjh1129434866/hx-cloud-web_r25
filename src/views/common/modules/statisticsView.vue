<!--
 * @Author: jiapeng.Zheng
 * @Date: 2019-06-26 14:29:25
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-05-15 16:15:45
 * @Description: 统计图模块
 -->
<template>
  <!-- panel风格(即首页统计图)的统计面板 -->
  <el-row :gutter="10" v-if="layoutStyle.id === 'panel'" class="panel-statistics-view">
    <slot name="topStat"></slot>
    <!-- loading 面板 -->
    <template v-if="!(Object.keys(staData).length + Object.keys(otherStaData).length) && loading">
      <el-col :style="layoutStyle.panelStyle" v-loading="loading">
        <div class="panel panel-block panel-stat">
          <div class="panel-body"></div>
        </div>
      </el-col>
    </template>
    <!-- 暂无数据 -->
    <template v-if="Object.keys(staData).findIndex(key => staData[key]._isShow) <= -1 && Object.keys(otherStaData).findIndex(key => otherStaData[key]._isShow) <= -1 && !loading">
      <el-col :style="layoutStyle.panelStyle">
        <div class="panel panel-block panel-stat">
          <div class="panel-body no-data">
            暂无统计数据
            <el-popover placement="top" trigger="manual" v-model="isTimeSelectShow">
              <el-date-picker v-model="refreshTimes" type="daterange" :picker-options="pickerOptions" :clearable="false" placeholder="选择日期范围"></el-date-picker>
              <div style="text-align: right; margin-top: 10px">
                <el-button size="mini" type="text" @click="isTimeSelectShow = false">{{ $t('cancel') }}</el-button>
                <el-button type="primary" size="mini" @click="refreshData">{{ $t('confirm') }}</el-button>
              </div>
              <span title="重新选择时间" class="hover el-icon-search" slot="reference" @click="isTimeSelectShow = true"></span>
            </el-popover>
          </div>
        </div>
      </el-col>
    </template>
    <!-- 其他统计（default slot），如：设备类型统计、报警统计 -->
    <template v-for="(value, key) in otherStaData">
      <el-col v-loading="loading" :key="key" v-if="otherStaData[key]._isShow" :style="layoutStyle.panelStyle">
        <div class="panel panel-block panel-stat">
          <div class="panel-title">
            <span class="title-name" :title="otherStaData[key]._title">{{ otherStaData[key]._title }}</span>
            <span class="title-btn click-btn" @click="otherStaData[key].onMoreClick">{{ $t('more') }}</span>
          </div>
          <div class="panel-body statistics-view">
            <div :id="`${key}-chart`" class="statistics-chart"></div>
          </div>
        </div>
      </el-col>
    </template>
    <!-- 手动配置的统计，如：电量、水量 -->
    <template v-for="(value, key) in staData">
      <el-col v-loading="loading" :key="key" v-if="staData[key]._isShow" :style="layoutStyle.panelStyle">
        <div class="panel panel-block panel-stat">
          <div class="panel-title">
            <span class="title-name" :title="staData[key]._title">{{ staData[key]._title }}</span>
            <span class="title-btn click-btn" v-if="staData[key]._onMoreClick" @click="staData[key]._onMoreClick">{{ $t('more') }}</span>
          </div>
          <div class="panel-body statistics-view">
            <div :id="`${key}-chart`" class="statistics-chart"></div>
          </div>
        </div>
      </el-col>
    </template>
    <slot name="bootomStat"></slot>
  </el-row>
  <!-- 默认风格的统计面板 -->
  <div v-else v-loading="loading" class="default-statistics-view statistics-view">
    <!-- 其他统计，如：设备类型统计、报警统计 -->
    <template v-for="(value, key) in otherStaData">
      <div :key="`${key}_title`" :title="otherStaData[key]._title" class="chart-title">{{ otherStaData[key]._title }}</div>
      <div :key="key" :id="`${key}-chart`" class="statistics-chart"></div>
    </template>
    <!-- 手动配置的统计，如：电量、水量 -->
    <template v-for="(value, key) in staData">
      <div :key="`${key}_title`" :title="staData[key]._title" class="chart-title">{{ staData[key]._title }}</div>
      <div :key="key" :id="`${key}-chart`" class="statistics-chart"></div>
    </template>
    <div v-if="isNoData" class="no-item">{{ $t('nodata') }}</div>
  </div>
</template>
<script>
// import HxCore from '@hx/corejs'
// import HxCore from 'F:\\project\\hx_core\\dist\\hxUtil.umd.js'
import * as echarts from 'echarts/lib/echarts' // 引入 echarts 主模块。
import $_ from '@helper/lodash'
import ThemeColor from '@constants/theme/color'
import { NOTICE_TYPE_ALL, NOTICE_STATE_UNSOLVED } from '@constants/noticeTypeConfig'
import { STAT_TYPE_STATE, STAT_SHOW_LEVEL_ALL, USERCONFIG_STATS_KEY } from '@constants/statisticsConfig/index'
import { SEARCH_DATE_RANGE } from '@constants/index'
import { changeColorByTheme, getNoDataMsgOption } from '@helper/utils/echart'
let _this

export default {
  name: 'statistics-view',

  props: {
    params: {
      type: Object,
      default() {
        return {
          deviceSn: '',
          projectId: '',
          typeId: ''
        }
      }
    },
    /**
     * 统计标题
     */
    statTitle: {
      type: String,
      default: ''
    },
    /**
     * 统计图的风格
     */
    layoutStyle: {
      type: Object,
      default() {
        return {
          id: '',
          panelStyle: {}
        }
      }
    },
    /**
     * 统计类别
     */
    staType: {
      type: Array,
      default() {
        return ['typeData', 'warnData', 'deviceControl']
      }
    },
    statShowLevel: {
      type: Number,
      require: true,
      default: STAT_SHOW_LEVEL_ALL
    }
  },
  data() {
    return {
      loading: false,
      isNoData: false,
      refreshTimes: [], // 手动选择的时间
      isTimeSelectShow: false, // 是否显示时间选择弹窗
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now() - 8.64e7
        },
        onPick({ maxDate, minDate }) {
          if (maxDate && minDate) {
            const range = new Date(maxDate).getTime() - new Date(minDate).getTime()
            if (range > SEARCH_DATE_RANGE) {
              this.$message.error('不允许查询超过3个月的数据')
              this.$nextTick(() => {
                _this.refreshTimes = [new Date(_this.statisticTime.Begin), new Date(_this.statisticTime.End)]
              })
            }
          }
        },
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
      staData: {}, // 手动配置的统计数据，如：电量、水量
      otherStaData: {}, // 其他类型的统计数据，如：报警、类型统计
      statisticTime: this.$utils.getDateRange({ rangeNumber: 7 })
    }
  },
  async created() {
    _this = this
    window.addEventListener('resize', this.eChartsResize, false)
  },
  destroyed() {
    window.removeEventListener('resize', this.eChartsResize, false)
  },

  watch: {
    params(newVal) {
      const { deviceSn, projectId, typeId } = newVal
      this.isTimeSelectShow = false
      this.statisticTime = this.$utils.getDateRange({ rangeNumber: 7 }) // 查询变量变化时，重置因 refreshData 而改变的 statisticTime
      this.getData(deviceSn, projectId, typeId)
    },
    $theme(newVal) {
      this.eachChart(myChart => {
        changeColorByTheme(myChart, newVal)
      })
    },
    isTimeSelectShow(newVal) {
      if (newVal) {
        this.refreshTimes = [new Date(this.statisticTime.Begin), new Date(this.statisticTime.End)]
      }
    }
  },
  methods: {
    refreshData() {
      const { deviceSn, projectId, typeId } = this.params
      // this.statisticTime = this.$utils.getDateRange({ rangeNumber: 10 })
      this.statisticTime.Begin = this.$utils.dayConvert(this.refreshTimes[0])
      this.statisticTime.End = this.$utils.dayConvert(this.refreshTimes[1])
      this.isTimeSelectShow = false
      this.getData(deviceSn, projectId, typeId)
    },
    /**
     * 通过设备类型(typeId)、设备序列号(deviceSn)、设备所属站场/项目ID(ProjectId) 获取统计数据
     * @param   {String}  deviceSn    设备序列号
     * @param   {String}  ProjectId   项目编号，默认为0，获取所有设备的统计细信息
     * @param   {String}  typeId      项目类型代码
     */
    getData(deviceSn, projectId = 0, typeId) {
      // 只获取和设备控制相关的统计
      if (this.staType.some(i => i === 'deviceControl')) {
        this.loading = true
        this.isNoData = true
        // 设备控制信息的统计：手动配置的（如：电量、水量）
        this.$apis.statistics
          .getDeviceStatisticsDataList({
            ...this.statisticTime,
            ProjectId: projectId,
            DeviceSn: deviceSn,
            TypeId: typeId
          })
          .then(r => {
            const staData = this.$utils.statisticsDataFormat(r.Data, {
              showLevel: this.statShowLevel,
              typeStatCof: this.$commonParam.deviceTypeDict
            })
            this.staData = staData
            this.$emit('onChartDataSuccess', staData, this.otherStaData)
            this.$nextTick(() => {
              for (const i in this.staData) {
                const eleId = `${i}-chart`
                const $chart = document.getElementById(eleId)
                this.isNoData = false
                // let unitValue = this.$mqttData.unitFormat(this.staData[i].unit, 'value')
                // let unitLabel = this.$mqttData.unitFormat(this.staData[i].unit)
                // let echartsObj = echarts.init($chart)
                const echartData = {
                  id: i,
                  shortTitle: `${this.staData[i].statName} ${this.staData[i]._baseUnit}`,
                  title: `${this.staData[i].statName} ${this.staData[i]._baseUnit}`, // this.$mqttData.unitFormat(this.staData[i].unit)
                  data: this.staData[i].data,
                  type: 'line',
                  Unit: this.staData[i]._baseUnit
                }
                // 父组件（src\views\home\statistics\index.vue）根据 _showInitMethod 、 _echartsId 、 _echartData 重新绘制统计图
                this.$set(this.staData[i], '_showInitMethod', 'drawLineECharts') // 绘制该统计图的方法
                this.$set(this.staData[i], '_echartsId', eleId) // 该统计图的 ID
                this.$set(this.staData[i], '_echartData', echartData) // 统计数据
                this.$set(this.staData[i], '_title', echartData.title)
                // this.$set(this.staData[i], '_isShow', false)
                if (this.$listeners['stat-view']) {
                  this.$set(this.staData[i], '_onMoreClick', () => {
                    _this.$emit('stat-view', true, echartData)
                  })
                }
                if ($chart) {
                  this.drawLineECharts(eleId, echartData, { isRefresh: false })
                }
              }
              this.eChartsResize()
            })

            // HxCore.Statistics.DataFormatAsync(r.Data, {
            //   showLevel: this.statShowLevel,
            //   typeStatCof: this.$commonParam.deviceTypeDict,
            //   statShowCof: this.$store.state.$userConfig[USERCONFIG_STATS_KEY] || {}
            // })
            //   .then(staData => {})
            //   .catch(err => {
            //     console.error(err)
            //   })
          })
          .catch(e => {
            console.error(e)
            this.$message.error(`获取统计信息失败：${JSON.stringify(e)}`)
          })
          .fin(() => {
            this.loading = false
          })
      }
      // 根据项目/站场ID获取类型统计
      if (this.staType.some(i => i === 'typeData')) {
        this.getTypeData(projectId, deviceSn)
      }
      // 根据项目/站场ID获取报警统计
      if (this.staType.some(i => i === 'warnData')) {
        this.getWarnData(projectId, deviceSn)
      }
    },
    /**
     * 根据 项目/站场ID 获取设备类型统计
     * @param {string} projectId  项目/站场ID
     * @param {string} deviceSn   设备序列号
     */
    getTypeData(projectId, deviceSn) {
      // 只统计项目、站场下的设备类型，具体的设备只有一种类型，没有统计的必要
      if (deviceSn === '0') {
        // 获取设备的统计信息：主要是关于设备类型
        // 注：该接口同时会返回 projectId 下的所有设备；fix：待改进......
        this.$apis.device
          .getDeviceOverView(projectId)
          .then(res => {
            let totalNum = 0
            let typeData = res.TypeData.map(item => {
              totalNum += item.Num
              return { ...item, name: item.TypeName, value: item.Num, icon: 'circle' }
            })
            typeData = totalNum ? typeData : []
            const eleId = 'typeData-chart'
            // 统计数据
            const echartData = {
              id: 'typeData',
              shortTitle: '设备类型',
              title: '设备类型统计',
              data: typeData,
              type: 'pie',
              Unit: ''
            }
            this.$set(this.otherStaData, 'typeData', {
              data: typeData,
              // 父组件（src\views\home\statistics\index.vue）根据 _showInitMethod 、 _echartsId 、 _echartData 重新绘制统计图
              _showInitMethod: 'drawPieEcharts',
              _echartData: echartData,
              _echartsId: eleId,
              _isShow: true,
              displayType: STAT_TYPE_STATE,
              statName: echartData.shortTitle,
              _title: echartData.title,
              onMoreClick: () => {
                _this.$emit('stat-click', echartData)
              }
            })
            this.$emit('onChartDataSuccess', this.staData, this.otherStaData)
            this.$nextTick(() => {
              const $chart = document.getElementById(eleId)
              if ($chart) {
                this.drawPieEcharts(eleId, echartData, { isRefresh: false })
              }
            })
          })
          .catch(e => {
            console.error('获取设备类型统计信息失败：', e)
            this.$message.error(`获取设备类型统计信息失败：${JSON.stringify(e)}`)
          })
      } else {
        this.$delete(this.otherStaData, 'typeData')
      }
    },
    /**
     * 根据 项目/站场ID 获取报警统计
     * @param {string} projectId 项目/站场ID
     * @param {string} deviceSn   设备序列号
     */
    getWarnData(projectId, deviceSn) {
      // 只统计项目、站场下的报警统计,因为 getWarnByWarnTypeStatics 接口只会获取 projectId 下的报警统计，缺少单个设备的统计；fix：待改进......
      if (deviceSn === '0') {
        // 获取项目/站场的报警统计
        this.$apis.statistics
          .getWarnByWarnTypeStatics(0, projectId)
          .then(res => {
            const warnData = []
            const color = []
            for (const key in res.Data) {
              const { TypeName, Color } = this.$commonParam.warnTypeDict[key]
              warnData.push({ name: TypeName, value: res.Data[key], icon: 'circle' })
              color.push(Color)
            }

            const eleId = 'warnData-chart'

            const echartData = {
              id: 'warnData',
              shortTitle: '设备报警',
              title: '设备报警统计',
              data: warnData,
              type: 'pie',
              Unit: ''
            }

            this.$set(this.otherStaData, 'warnData', {
              data: warnData,
              // 父组件（src\views\home\statistics\index.vue）根据 _showInitMethod 、 _echartsId 、 _echartData 重新绘制统计图
              _showInitMethod: 'drawPieEcharts',
              _echartData: echartData,
              _echartsId: eleId,
              _isShow: true,
              displayType: STAT_TYPE_STATE,
              statName: echartData.shortTitle,
              _title: echartData.title,
              onMoreClick: () => {
                this.$router.push(`/common/notice/list/${NOTICE_TYPE_ALL}/${NOTICE_STATE_UNSOLVED}`)
              }
            })
            this.$emit('onChartDataSuccess', this.staData, this.otherStaData)
            this.$nextTick(() => {
              const $chart = document.getElementById(eleId)
              if ($chart) {
                this.drawPieEcharts(eleId, echartData, {
                  isRefresh: false,
                  echartOption: { color: color } // 根据统计类型配置的颜色来覆盖默认的统计图颜色
                })
              }
            })
          })
          .catch(e => {
            console.error('获取报警统计信息失败', e)
            this.$message.error(`获取报警统计信息失败：${JSON.stringify(e)}`)
          })
      } else {
        this.$delete(this.otherStaData, 'warnData')
      }
    },
    /**
     * 生成折线图
     * @param   {Object}  echartsId    echarts.init 生成的对象
     * @param   {Object}  echartData    生成统计图的数据对象
     * echartData = {data:[{ name: '18/10/18', data: { Unit: 'V' }, value: '220' }], Category:CUM_VAL_STAT, type:'line', Unit:'V'}
     * @param   {option}  option        生成统计图所需的配置
     * option = {idataDefinePanelTplVuetOption 所需的配置信息'}
     */
    drawLineECharts(echartsId, echartData, option) {
      const echartsObj = echarts.init(document.getElementById(echartsId))
      const { title, data, type, Unit } = echartData
      const { isRefresh, echartOption } = option
      const dataKey = Object.keys(data) // .sort()
      // echart 配置
      const opt = {
        // title: {
        //   text: title,
        //   textStyle: {
        //     fontSize: '12'
        //   }
        // },
        xAxis: {
          boundaryGap: false,
          axisLine: {
            lineStyle: { color: ThemeColor[this.$theme].border }
          },
          axisLabel: {
            color: ThemeColor[this.$theme].font,
            formatter: value => {
              return this.$utils.dateConvert(value, 'M/D')
            }
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
          formatter: params => {
            const { value, axisValue } = params[0]
            return `${axisValue}<br />${this.$utils.bigNumberFormat(value)}${Unit}`
          }
          // formatter: `{b}<br />{c} ${Unit}`
        },
        // toolbox: {
        //   feature: {
        //     // 注意，自定义的工具名字，只能以 my 开头 [https://www.echartsjs.com/option.html#toolbox.feature]
        //     myViewTool: {
        //       show: !!this.$listeners['stat-view'], // 只有绑定了 stat-click 事件才显示该按钮
        //       title: this.$t('view'),
        //       icon:
        //         'path://M432.45,595.444c0,2.177-4.661,6.82-11.305,6.82c-6.475,0-11.306-4.567-11.306-6.82s4.852-6.812,11.306-6.812C427.841,588.632,432.452,593.191,432.45,595.444L432.45,595.444z M421.155,589.876c-3.009,0-5.448,2.495-5.448,5.572s2.439,5.572,5.448,5.572c3.01,0,5.449-2.495,5.449-5.572C426.604,592.371,424.165,589.876,421.155,589.876L421.155,589.876z M421.146,591.891c-1.916,0-3.47,1.589-3.47,3.549c0,1.959,1.554,3.548,3.47,3.548s3.469-1.589,3.469-3.548C424.614,593.479,423.062,591.891,421.146,591.891L421.146,591.891zM421.146,591.891',
        //       onclick: function() {
        //         _this.$emit('stat-view', true, echartData)
        //       }
        //     }
        //   }
        // },
        grid: {
          top: '20',
          left: '3%',
          right: '4%',
          bottom: '0',
          // borderColor: 'red',
          containLabel: true
        },
        // https://www.echartsjs.com/option.html#series-line
        series: [
          {
            name: '',
            type: type,
            data: dataKey.map(item => {
              return data[item].Values
            }),
            showSymbol: false, // 是否显示 symbol, 如果 false 则只有在 tooltip hover 的时候显示。
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
            //         color: ThemeColor[this.$theme].echart[0] // 0% 处的颜色
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

      echartsObj.clear()
      echartsObj.setOption(!$_.isEmpty(data) ? opt : getNoDataMsgOption(`暂无${title}`)) // noDataOption
      echartsObj.resize()
      this.$nextTick(() => {
        _this.$emit('onChartSuccess', true)
      })
    },
    /**
     * 生成饼图
     * @param {String} eleId   用于在界面生成统计图的元素
     * @param {Object} echartData   统计数据
     * @param {Object} option       echarts 配置
     */
    drawPieEcharts(eleId, echartData, option) {
      const echartsObj = echarts.init(document.getElementById(eleId))
      const { title, shortTitle, data /*, type, Unit */ } = echartData
      const { isRefresh, echartOption /*, onMoreClick */ } = option
      // const dataKey = Object.keys(data).sort()
      // echart 配置
      const opt = {
        title: {
          show: true,
          text: `${shortTitle}\n${
            data.reduce((a, b) => {
              return { value: Number(a.value) + Number(b.value) }
            }).value
          }`,
          top: 'center',
          left: 'center',
          z: 0,
          textStyle: {
            fontSize: '12',
            color: ThemeColor[this.$theme].font
          }
        },
        color: ThemeColor[this.$theme].echart,
        tooltip: {
          trigger: 'item',
          /**
           * @param {Object|Array} params
           */
          formatter(params) {
            const { color, value, percent, name, seriesName } = params
            const dotHtml = `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${color}"></span>`
            return `${seriesName}</br>${dotHtml}${name}: ${value}(${percent}%)`
          }
        },
        // 图例
        legend: {
          bottom: 0,
          data: data,
          textStyle: {
            color: ThemeColor[this.$theme].font
          }
        },
        // https://www.echartsjs.com/option.html#series-pie
        series: [
          {
            name: shortTitle, // 不能与data中任意一项的name相同
            type: 'pie',
            radius: ['40%', '55%'],
            label: {
              show: true,
              // formatter: '{b}: {d}%',
              textStyle: {
                fontSize: 12
              }
            },
            // 标签的视觉引导线样式
            labelLine: {},
            // 起始角度
            startAngle: 180,
            // 饼图的中心（圆心）坐标
            // center: ['50%', '40%'],
            data: data
          }
        ]
      }

      Object.assign(opt, echartOption)
      // 是否重新加载
      if (isRefresh) {
        echartsObj.clear()
      }
      echartsObj.clear()
      echartsObj.setOption(data.length ? opt : getNoDataMsgOption(`暂无${title}`))
      echartsObj.resize()
      this.$nextTick(() => {
        _this.$emit('onChartSuccess', true)
      })
    },

    /**
     * @callback eachChartCallBackFn
     * @param {ECharts} eCharts dom 容器上的实例
     */
    /**
     * 遍历 Echart
     * @param {eachChartCallBackFn} callBackFn 回调
     */
    eachChart(callBackFn) {
      const $chart = document.querySelectorAll('.statistics-view .statistics-chart')
      const chartArray = Array.from($chart)
      chartArray.forEach(ele => {
        const myChart = echarts.getInstanceByDom(ele)

        if (myChart && typeof callBackFn === 'function') {
          callBackFn(myChart)
        }
      })
    },

    eChartsResize: $_.throttle(function() {
      this.eachChart(myChart => {
        myChart.resize()
      })
    }, 300)
  }
}
</script>
<style lang="scss" scoped>
@import '~@assets/scss/variables.scss';
@import '~@assets/scss/mixins.scss';
.panel-statistics-view {
  .panel-stat {
    padding: {
      top: $spacing-medium-size; // 15px
      right: $spacing-medium-size; // 15px
      bottom: $spacing-size; // 10px
      left: $spacing-medium-size; // 15px
    }
    .panel-title {
      flex-flow: row nowrap;
      .title-name {
        @include text-overflow();
        width: calc(100% - 4em);
      }
      .title-btn {
        width: 4em;
      }
    }
    .statistics-view {
      // height: 100%;
      // min-height: 200px;
      .statistics-chart {
        // width: 100%;
        height: 100%;
      }
    }
  }
}
.default-statistics-view.statistics-view {
  height: 100%;
  .chart-title {
    padding: $spacing-size $spacing-size * 2;
  }
  .statistics-chart {
    height: 100%;
  }
}
</style>
