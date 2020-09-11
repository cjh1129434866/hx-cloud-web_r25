<template>
  <div class="app-device-input-data">
    <div class="input-data-title card-title">
      <span class="input-data-title-name">
        <icon name="panel/record"></icon>
        {{ $t('wqtSta') }}
        <span class="switch-btn" @click="isLineChart = !isLineChart">
          <i class="el-icon-data-line hover actived" v-if="isLineChart"></i>
          <i class="el-icon-data-board hover actived" v-else></i>
        </span>
      </span>
      <span class="input-data-opt-area">
        <el-date-picker
          v-model="inputDataSearchForm.dateRange"
          size="small"
          type="daterange"
          align="right"
          :clearable="false"
          :placeholder="$t('pleaseSelect') + $t('dateRange')"
          :picker-options="pickerOptions"
          @change="handleRefresh"
        ></el-date-picker>
        <el-button icon="el-icon-plus" type="primary" size="small" @click="openInputDataEdit">{{ $t('add') }}</el-button>
        <!-- <span @click="openInputDataEdit">
          <icon class="add-btn" name="circle-add"></icon>
        </span> -->
      </span>
    </div>
    <div class="line-chart" ref="lineChart" v-show="isLineChart">
      isLineChart
    </div>
    <el-table v-show="!isLineChart" :data="inputDataList" border height="auto" v-loading="isLoading">
      <el-table-column width="170" align="center" prop="dt" :label="$t('date')" :formatter="formatterTime"></el-table-column>
      <el-table-column prop="WaterInflow" :label="$t('waterInflow') + '(m³)'" align="center"></el-table-column>

      <el-table-column :label="$t('cod') + '(mg/L)'" align="center">
        <el-table-column prop="COD_In" :label="$t('inlet')" align="center"></el-table-column>
        <el-table-column prop="COD_Out" :label="$t('effluent')" align="center"></el-table-column>
      </el-table-column>
      <el-table-column :label="$t('nh3n') + '(mg/L)'" align="center">
        <el-table-column prop="NH3_N_In" :label="$t('inlet')" align="center"></el-table-column>
        <el-table-column prop="NH3_N_Out" :label="$t('effluent')" align="center"></el-table-column>
      </el-table-column>
      <el-table-column :label="$t('tn') + '(mg/L)'" align="center">
        <el-table-column prop="TN_In" :label="$t('inlet')" align="center"></el-table-column>
        <el-table-column prop="TN_Out" :label="$t('effluent')" align="center"></el-table-column>
      </el-table-column>
      <el-table-column :label="$t('tp') + '(mg/L)'" align="center">
        <el-table-column prop="TP_In" :label="$t('inlet')" align="center"></el-table-column>
        <el-table-column prop="TP_Out" :label="$t('effluent')" align="center"></el-table-column>
      </el-table-column>
      <el-table-column :label="$t('ss') + '(mg/L)'" align="center">
        <el-table-column prop="SS_In" :label="$t('inlet')" align="center"></el-table-column>
        <el-table-column prop="SS_Out" :label="$t('effluent')" align="center"></el-table-column>
      </el-table-column>
      <el-table-column :label="$t('ph') + '(mg/L)'" align="center">
        <el-table-column prop="PH_In" :label="$t('inlet')" align="center"></el-table-column>
        <el-table-column prop="PH_Out" :label="$t('effluent')" align="center"></el-table-column>
      </el-table-column>
      <el-table-column align="center" prop="UserName" :label="$t('recorder')"></el-table-column>
      <el-table-column label="操作" width="80">
        <template v-slot="scope">
          <el-button @click="deleteData(scope.row.Id)" type="danger" size="small">{{ $t('delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      class="edit-dialog inputDataDialog"
      width="40%"
      :visible="isInputDataEditVisible"
      :modal-append-to-body="false"
      :close-on-click-modal="false"
      :show-close="false"
      @close="isInputDataEditVisible = false"
    >
      <span slot="title" class="el-dialog__title">{{ $t('adds') + $t('wqtSta') }}</span>
      <el-form :model="inputDataForm" :rules="inputDataRules" ref="inputDataForm" class="inputDataForm">
        <!-- <div class="form-group col-sm-6">
        </div>-->
        <el-form-item :label="$t('date')" required>
          <el-col :span="24">
            <el-form-item prop="Dt">
              <el-date-picker v-model="inputDataForm.Dt" :clearable="false" type="datetime" style="width: 100%;"></el-date-picker>
            </el-form-item>
          </el-col>
        </el-form-item>
        <el-form-item :label="$t('waterInflow')" required>
          <el-col :span="24">
            <el-form-item prop="WaterInflow">
              <el-input v-model="inputDataForm.WaterInflow">
                <template slot="append">
                  m³
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-form-item>
        <!-- COD -->
        <el-form-item :label="$t('cod')" required>
          <el-col :span="11">
            <el-form-item prop="COD_In">
              <el-input v-model="inputDataForm.COD_In">
                <template slot="prepend">{{ $t('inlet') }}</template>
                <template slot="append">
                  mg/L
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col class="line" :span="2"></el-col>
          <el-col :span="11">
            <el-form-item prop="COD_Out">
              <el-input v-model="inputDataForm.COD_Out">
                <template slot="prepend">{{ $t('effluent') }}</template>
                <template slot="append">
                  mg/L
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-form-item>
        <!-- NH3-N -->
        <el-form-item :label="$t('nh3n')" required>
          <el-col :span="11">
            <el-form-item prop="NH3_N_In">
              <el-input v-model="inputDataForm.NH3_N_In">
                <template slot="prepend">{{ $t('inlet') }}</template>
                <template slot="append">
                  mg/L
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col class="line" :span="2"></el-col>
          <el-col :span="11">
            <el-form-item prop="NH3_N_Out">
              <el-input v-model="inputDataForm.NH3_N_Out">
                <template slot="prepend">{{ $t('effluent') }}</template>
                <template slot="append">
                  mg/L
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-form-item>
        <!-- TN -->
        <el-form-item :label="$t('tn')" required>
          <el-col :span="11">
            <el-form-item prop="TN_In">
              <el-input v-model="inputDataForm.TN_In">
                <template slot="prepend">{{ $t('inlet') }}</template>
                <template slot="append">
                  mg/L
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col class="line" :span="2"></el-col>
          <el-col :span="11">
            <el-form-item prop="TN_Out">
              <el-input v-model="inputDataForm.TN_Out">
                <template slot="prepend">{{ $t('effluent') }}</template>
                <template slot="append">
                  mg/L
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-form-item>
        <!-- TP -->
        <el-form-item :label="$t('tp')" required>
          <el-col :span="11">
            <el-form-item prop="TP_In">
              <el-input v-model="inputDataForm.TP_In">
                <template slot="prepend">{{ $t('inlet') }}</template>
                <template slot="append">
                  mg/L
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col class="line" :span="2"></el-col>
          <el-col :span="11">
            <el-form-item prop="TP_Out">
              <el-input v-model="inputDataForm.TP_Out">
                <template slot="prepend">{{ $t('effluent') }}</template>
                <template slot="append">
                  mg/L
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-form-item>
        <!-- SS -->
        <el-form-item :label="$t('ss')" required>
          <el-col :span="11">
            <el-form-item prop="SS_In">
              <el-input v-model="inputDataForm.SS_In">
                <template slot="prepend">{{ $t('inlet') }}</template>
                <template slot="append">
                  mg/L
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col class="line" :span="2"></el-col>
          <el-col :span="11">
            <el-form-item prop="SS_Out">
              <el-input v-model="inputDataForm.SS_Out">
                <template slot="prepend">{{ $t('effluent') }}</template>
                <template slot="append">
                  mg/L
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-form-item>
        <!-- PH -->
        <el-form-item :label="$t('ph')" required>
          <el-col :span="11">
            <el-form-item prop="PH_In">
              <el-input v-model="inputDataForm.PH_In">
                <template slot="prepend">{{ $t('inlet') }}</template>
                <template slot="append">
                  mg/L
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col class="line" :span="2"></el-col>
          <el-col :span="11">
            <el-form-item prop="PH_Out">
              <el-input v-model="inputDataForm.PH_Out">
                <template slot="prepend">{{ $t('effluent') }}</template>
                <template slot="append">
                  mg/L
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button type="cancel" @click="isInputDataEditVisible = false">{{ $t('cancel') }}</el-button>
        <el-button type="primary" @click="onAddInputDataClick">{{ $t('confirm') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { SEARCH_DATE_RANGE } from '@constants/index'
import * as echarts from 'echarts/lib/echarts' // 引入 echarts 主模块。
import $_ from '@helper/lodash'
import ThemeColor from '@constants/theme/color'
import { getNoDataMsgOption } from '@helper/utils/echart'

export default {
  name: 'app-device-input-data',

  props: {
    deviceSn: {
      required: true,
      type: String
    }
  },

  data() {
    const checkNumber = (rule, value, callback) => {
      const numberVal = this.$_.toNumber(value)
      if (this.$_.isNaN(numberVal)) {
        callback(new Error(this.$t('pleaseEnter') + this.$t('number')))
      } else {
        callback()
      }
    }
    return {
      isLoading: false,
      isInputDataEditVisible: false,
      isLineChart: false, // 表格/图表切换
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now() - 8.64e7
        },
        onPick({ maxDate, minDate }) {
          if (maxDate && minDate) {
            const range = new Date(maxDate).getTime() - new Date(minDate).getTime()
            if (range > SEARCH_DATE_RANGE) {
              this.$message.error('不允许查询超过3个月的数据')
              // this.$nextTick(() => {
              //   _this.dateRange = ''
              // })
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
      inputDataList: [],
      inputDataSearchForm: {
        dateRange: [new Date(new Date().setTime(new Date().getTime() - 3600 * 1000 * 24 * 90)), new Date()]
      },
      inputDataForm: {
        Dt: ''
      },
      inputDataRules: {
        WaterInflow: [
          {
            required: true,
            message: `${this.$t('pleaseEnter') + this.$t('waterInflow')}`,
            trigger: 'blur'
          },
          { validator: checkNumber, trigger: 'blur' }
        ],
        COD_In: [
          {
            required: true,
            message: `${this.$t('pleaseEnter') + this.$t('inlet') + this.$t('cod')}`,
            trigger: 'blur'
          },
          { validator: checkNumber, trigger: 'blur' }
        ],
        COD_Out: [
          {
            required: true,
            message: `${this.$t('pleaseEnter') + this.$t('effluent') + this.$t('cod')}`,
            trigger: 'blur'
          },
          { validator: checkNumber, trigger: 'blur' }
        ],
        NH3_N_In: [
          {
            required: true,
            message: `${this.$t('pleaseEnter') + this.$t('inlet') + this.$t('nh3n')}`,
            trigger: 'blur'
          },
          { validator: checkNumber, trigger: 'blur' }
        ],
        NH3_N_Out: [
          {
            required: true,
            message: `${this.$t('pleaseEnter') + this.$t('effluent') + this.$t('nh3n')}`,
            trigger: 'blur'
          },
          { validator: checkNumber, trigger: 'blur' }
        ],
        TN_In: [
          {
            required: true,
            message: `${this.$t('pleaseEnter') + this.$t('inlet') + this.$t('tn')}`,
            trigger: 'blur'
          },
          { validator: checkNumber, trigger: 'blur' }
        ],
        TN_Out: [
          {
            required: true,
            message: `${this.$t('pleaseEnter') + this.$t('effluent') + this.$t('tn')}`,
            trigger: 'blur'
          },
          { validator: checkNumber, trigger: 'blur' }
        ],
        TP_In: [
          {
            required: true,
            message: `${this.$t('pleaseEnter') + this.$t('inlet') + this.$t('tp')}`,
            trigger: 'blur'
          },
          { validator: checkNumber, trigger: 'blur' }
        ],
        TP_Out: [
          {
            required: true,
            message: `${this.$t('pleaseEnter') + this.$t('effluent') + this.$t('tp')}`,
            trigger: 'blur'
          },
          { validator: checkNumber, trigger: 'blur' }
        ],
        SS_In: [
          {
            required: true,
            message: `${this.$t('pleaseEnter') + this.$t('inlet') + this.$t('ss')}`,
            trigger: 'blur'
          },
          { validator: checkNumber, trigger: 'blur' }
        ],
        SS_Out: [
          {
            required: true,
            message: `${this.$t('pleaseEnter') + this.$t('effluent') + this.$t('ss')}`,
            trigger: 'blur'
          },
          { validator: checkNumber, trigger: 'blur' }
        ],
        PH_In: [
          {
            required: true,
            message: `${this.$t('pleaseEnter') + this.$t('inlet') + this.$t('ph')}`,
            trigger: 'blur'
          },
          { validator: checkNumber, trigger: 'blur' }
        ],
        PH_Out: [
          {
            required: true,
            message: `${this.$t('pleaseEnter') + this.$t('effluent') + this.$t('ph')}`,
            trigger: 'blur'
          },
          { validator: checkNumber, trigger: 'blur' }
        ]
      }
    }
  },

  computed: {},

  created() {
    window.addEventListener('resize', this.eChartsResize, false)
  },
  destroyed() {
    window.removeEventListener('resize', this.eChartsResize, false)
  },

  mounted() {
    this.handleRefresh()
  },

  watch: {
    isLineChart(newVal) {
      if (newVal) {
        this.$nextTick(() => {
          this.drawLineChart(this.inputDataList)
        })
      }
    }
    // $theme(newVal) {
    //   const $el = this.$refs.lineChart
    //   const echartsObj = echarts.getInstanceByDom($el)
    //   changeColorByTheme(echartsObj, newVal)
    // }
  },

  methods: {
    eChartsResize: $_.throttle(function() {
      const $el = this.$refs.lineChart
      const echartsObj = echarts.getInstanceByDom($el)
      if (echartsObj) {
        echartsObj.resize()
      }
    }, 300),
    async handleRefresh() {
      try {
        // -------------- 水质水量统计 -----------------------
        this.inputDataSearchForm.devicesn = this.deviceSn
        this.inputDataSearchForm.end = this.$utils.dateConvert(this.inputDataSearchForm.dateRange[1], 'YYYY-MM-DD 23:59:59')
        this.inputDataSearchForm.begin = this.$utils.dateConvert(this.inputDataSearchForm.dateRange[0], 'YYYY-MM-DD 00:00:00')
        this.isLoading = true
        const inputDataList = await this.$apis.deviceInputData.getDeviceInputDataList(this.inputDataSearchForm)
        this.isLoading = false
        this.inputDataList = inputDataList.Data
        if (this.isLineChart) {
          this.drawLineChart(this.inputDataList)
        }
      } catch (errMsg) {
        this.isLoading = false
        this.$message.error(errMsg)
        console.error(errMsg)
      }
    },
    drawLineChart(dataList) {
      const _chartConfig = {
        WaterInflow: '日处理水量',
        COD_In: '进水COD',
        COD_Out: '出水COD',
        NH3_N_In: '进水NH3N',
        NH3_N_Out: '出水NH3N',
        TN_In: '进水TN',
        TN_Out: '出水TN',
        TP_In: '进水TP',
        TP_Out: '出水TP',
        SS_In: '进水SS',
        SS_Out: '出水SS',
        PH_In: '进水PH',
        PH_Out: '出水PH'
      }
      const _chartSplit = [
        { title: { text: 'COD', top: '20', left: '16%' }, grid: { bottom: '60%', left: '4%', right: '68%' }, legend: ['WaterInflow', 'COD_In', 'COD_Out'] },
        { title: { text: 'NH3N', top: '20', left: '50%' }, grid: { bottom: '60%', left: '36%', right: '36%' }, legend: ['WaterInflow', 'NH3_N_In', 'NH3_N_Out'] },
        { title: { text: 'TN', top: '20', right: '16%' }, grid: { bottom: '60%', left: '68%', right: '4%' }, legend: ['WaterInflow', 'TN_In', 'TN_Out'] },
        { title: { text: 'TP', top: '55%', left: '16%' }, grid: { top: '60%', left: '4%', right: '68%' }, legend: ['WaterInflow', 'TP_In', 'TP_Out'] },
        { title: { text: 'SS', top: '55%', left: '50%' }, grid: { top: '60%', left: '36%', right: '36%' }, legend: ['WaterInflow', 'SS_In', 'SS_Out'] },
        { title: { text: 'PH', top: '55%', right: '16%' }, grid: { top: '60%', left: '68%', right: '4%' }, legend: ['WaterInflow', 'PH_In', 'PH_Out'] }
      ]
      const _series = []
      const _grid = []
      const _yAxis = []
      const _xAxis = []
      const _title = []
      _chartSplit.forEach((charts, chartIndex) => {
        charts.legend.forEach(legendName => {
          _series.push({
            name: _chartConfig[legendName],
            type: 'line',
            data: dataList.map(dataObj => {
              return [dataObj.dt, dataObj[legendName]]
            }),
            xAxisIndex: chartIndex,
            yAxisIndex: chartIndex,
            // showSymbol: false, // 是否显示 symbol, 如果 false 则只有在 tooltip hover 的时候显示。
            smooth: true, // 让曲线变平滑的
            lineStyle: {
              width: 3 // 线宽
            }
          })
        })
        _title.push({
          ...charts.title,
          textStyle: {
            color: ThemeColor[this.$theme].font
          }
        })
        _grid.push(charts.grid)
        _yAxis.push({
          gridIndex: chartIndex,
          splitLine: {
            lineStyle: { color: ThemeColor[this.$theme].border }
          },
          axisLine: {
            lineStyle: { color: ThemeColor[this.$theme].border }
          },
          axisLabel: {
            color: ThemeColor[this.$theme].font
          }
        })
        _xAxis.push({
          type: 'category',
          boundaryGap: false,
          gridIndex: chartIndex,
          axisLine: {
            lineStyle: { color: ThemeColor[this.$theme].border }
          },
          axisLabel: {
            color: ThemeColor[this.$theme].font
          }
        })
      })
      const $el = this.$refs.lineChart
      const echartsObj = echarts.init($el)
      const option = {
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: Object.values(_chartConfig),
          textStyle: {
            color: ThemeColor[this.$theme].font
          }
        },
        title: _title,
        grid: _grid,
        xAxis: _xAxis,
        yAxis: _yAxis,
        series: _series
      }
      echartsObj.clear()
      echartsObj.setOption(dataList.length ? option : getNoDataMsgOption())
    },
    /**
     * 打开水质水量统计输入框
     */
    openInputDataEdit() {
      this.isInputDataEditVisible = true
      this.inputDataForm = {
        DeviceSn: this.deviceSn,
        Dt: this.$utils.dateConvert(Date.now()),
        COD_Unit: 'mg/L',
        NH3_N_Unit: 'mg/L',
        TN_Unit: 'mg/L',
        TP_Unit: 'mg/L',
        SS_Unit: 'mg/L',
        PH_Unit: 'mg/L'
      }
    },
    /**
     * 新增水质水量统计
     */
    onAddInputDataClick() {
      this.$refs.inputDataForm.validate(async valid => {
        if (!valid) return
        try {
          const result = await this.$apis.deviceInputData.deviceInputDataAdd(this.inputDataForm)
          this.isInputDataEditVisible = false
          this.handleRefresh()
          this.$message.success(result.message)
        } catch (errMsg) {
          this.$message.error(errMsg)
          console.error(errMsg)
        }
      })
    },
    /**
     * 删除水质水量统计
     */
    deleteData(id) {
      this.$confirm('是否删除该记录？', '提示', { cancelButtonClass: 'el-button--cancel', closeOnClickModal: false })
        .then(() => {
          this.$apis.deviceInputData
            .deviceInputDataRemove(id)
            .then(result => {
              this.$message.success(result.message)
              this.handleRefresh()
            })
            .catch(errMsg => {
              this.$message.error(errMsg)
              console.error(errMsg)
            })
        })
        .catch(() => {
          this.$message.warning('取消删除')
        })
    },
    formatterTime(row, column) {
      return this.$utils.dateConvert(row[column.property])
    }
  }
}
</script>
<style lang="scss">
@import '~@assets/scss/variables.scss';
.app-device-input-data {
  display: flex;
  flex-direction: column;
  padding: $spacing-size $spacing-large-size;
  margin: 0 $spacing-size $spacing-small-size 0;
  .input-data-title {
    margin-bottom: 5px;
    justify-content: space-between;
    display: flex;
    font-weight: bold;
    align-items: center;
    .input-data-title-name {
      display: flex;
      align-items: center;
      .icon {
        margin-right: 0.5em;
      }
      .switch-btn {
        margin-left: 0.5em;
      }
    }
    .input-data-opt-area {
      .el-button {
        margin: 0 0 0 1em;
      }
    }
  }
  .line-chart {
    height: 100%;
  }
}
.inputDataDialog {
  .el-dialog {
    min-width: 610px;
  }
  .inputDataForm {
    .el-form-item {
      margin-bottom: 5px;
    }
    .el-form-item__content {
      margin-left: 7em;
      .el-form-item {
        .el-form-item__content {
          margin-left: 0;
        }
      }
    }
    .el-form-item__label {
      width: 7em;
      padding-top: 17px;
    }
  }
}
</style>
