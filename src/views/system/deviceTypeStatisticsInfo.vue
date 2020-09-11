<!--
 * @Author: jiapeng.Zheng
 * @Date: 2019-01-22 11:38:06
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-31 16:42:14
 * @Description: 设备类型统计
 -->
<template>
  <el-card class="box-card">
    <div slot="header" class="clearfix">
      <span style="font-weight:bold">{{ activeNode.data.DeviceTypeName }} /</span>
      <span>{{ $t('deviceType') + $t('statistical') }}</span>
    </div>
    <el-row>
      <el-col>
        <el-form class="form-group" :inline="true" v-if="activeNode.data.Id">
          <el-form-item>
            <el-button type="primary" icon="plus" @click="onAddClick()">{{ $t('add') }}</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
    <el-table :data="tableData" v-loading="loading" :highlight-current-row="true" border>
      <el-table-column type="index" width="80"></el-table-column>
      <el-table-column prop="DisplayType" label="分类" width="70">
        <template v-slot="scope">{{ statTypeConfig[scope.row.DisplayType].name }}</template>
      </el-table-column>
      <el-table-column prop="ShowState" label="展示层级">
        <template v-slot="scope">{{ statShowLevelDic[scope.row.ShowState] }}</template>
      </el-table-column>
      <el-table-column prop="StaticsType" label="统计类型" width="110">
        <template v-slot="scope">{{ typeStatsConfigDic[scope.row.StaticsType] }}</template>
      </el-table-column>
      <el-table-column prop="Key" label="数据定义Key" min-width="100"></el-table-column>
      <el-table-column prop="Name" label="名称"></el-table-column>
      <el-table-column prop="Standard" label="标准值"></el-table-column>
      <el-table-column prop="SUnit" label="单位">
        <template v-slot="scope">{{ scope.row.SUnit | unitFilter }}</template>
      </el-table-column>
      <el-table-column prop="FilterType" label="过滤方案">
        <template v-slot="scope">{{ statFilterDic[scope.row.FilterType] }}</template>
      </el-table-column>
      <el-table-column prop="Filter" label="过滤内容"></el-table-column>
      <el-table-column label="操作" min-width="150" width="150">
        <template v-slot="scope">
          <el-button @click="onEditClick(scope.row, scope.$index)" type="primary" size="small">{{ $t('edit') }}</el-button>
          <el-button @click="onDelClick(scope.row)" type="danger" size="small">{{ $t('delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- <div class="table-operate">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="searchForm.pageNo"
        :page-sizes="pageSizes"
        :page-size="searchForm.pageSize"
        :total="pageTotal"
        layout="total, sizes, prev, pager, next, jumper"
      ></el-pagination>
    </div>-->
    <el-dialog :visible="isDialogVisible" width="30%" @close="isDialogVisible = false" class="edit-dialog" :close-on-click-modal="false" :show-close="false">
      <span slot="title" class="el-dialog__title">
        【{{ activeNode.data.DeviceTypeName }}】
        <span>{{ isAdd ? $t('adds') : $t('edits') }}</span>
        {{ $t('deviceType') + $t('statistical') }}
      </span>
      <el-form :model="fillForm" :rules="rules" ref="fillForm">
        <div class="form-group">
          <el-form-item label="分类" prop="DisplayType">
            <el-radio-group v-model="fillForm.DisplayType">
              <el-radio v-for="(value, key) in statTypeConfig" :label="value.key" :key="key">{{ value.name }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="展示层级" prop="ShowState">
            <el-radio-group v-model="fillForm.ShowState">
              <el-radio v-for="(value, key) of statShowLevelDic" :label="Number(key)" :key="key">{{ value }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="统计类型" prop="StaticsType">
            <el-radio-group v-model="fillForm.StaticsType">
              <el-radio v-for="(value, key) in typeStatsConfigDic" :label="Number(key)" :key="key">{{ value }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="Key" prop="Key">
            <el-input v-model="fillForm.Key"></el-input>
          </el-form-item>
          <el-form-item label="名称" prop="Name">
            <el-input v-model="fillForm.Name"></el-input>
          </el-form-item>
          <el-form-item label="标准值" prop="Standard">
            <el-input v-model="fillForm.Standard"></el-input>
          </el-form-item>
          <el-form-item label="单位" prop="SUnit">
            <el-cascader v-model="fillForm.SUnit" placeholder="单位" filterable :show-all-levels="false" :props="unitCascaderProps" :options="dataTypeUnitConfig"></el-cascader>
          </el-form-item>
          <el-form-item label="过滤方案" prop="FilterType">
            <el-radio-group v-model="fillForm.FilterType">
              <el-radio v-for="(value, key) in statFilterDic" :label="Number(key)" :key="key">{{ value }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <!-- 最大最小值过滤 -->
          <el-form-item label="过滤内容" v-if="fillForm.FilterType === statFilterMaxMin">
            <el-row>
              <el-col :span="11">
                <el-form-item prop="_minFilter" label-width="0">
                  <el-input v-model.number="fillForm._minFilter" type="number">
                    <template slot="prepend">最小值</template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="11" :offset="2">
                <el-form-item prop="_maxFilter" label-width="0">
                  <el-input v-model.number="fillForm._maxFilter" type="number">
                    <template slot="prepend">最大值</template>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form-item>
        </div>
      </el-form>
      <span slot="footer">
        <el-button type="cancel" @click="isDialogVisible = false">{{ $t('cancel') }}</el-button>
        <el-button type="primary" @click="onSureClick">{{ $t('confirm') }}</el-button>
      </span>
    </el-dialog>
  </el-card>
</template>

<script>
import { $validate } from '@helper'
// import { $utils } from '@helper'
import { TYPE_STATS_CONFIG_DIC, STAT_FILTER_DIC, STAT_SHOW_LEVEL_DIC } from '@constants/dictionaries' // 系统字典
import { DATA_TYPE_UNIT_CONFIG } from '@constants/dataTypeConfig' // 数据定义配置
import { STAT_TYPE_CONFIG, STAT_TYPE_CHECK, TYPE_REAL_STAT, STAT_SHOW_LEVEL_DEVICE, STAT_FILTER_NO, STAT_FILTER_MAX_MIN } from '@constants/statisticsConfig' // 统计配置

let __this

export default {
  name: 'device-type-statistics-info',

  props: {
    activeNode: {
      required: true
    }
  },

  data() {
    return {
      loading: false,
      isDialogVisible: false,
      isAdd: true,
      statTypeConfig: STAT_TYPE_CONFIG,
      typeStatsConfigDic: TYPE_STATS_CONFIG_DIC,
      statFilterDic: STAT_FILTER_DIC,
      statShowLevelDic: STAT_SHOW_LEVEL_DIC,
      dataTypeUnitConfig: DATA_TYPE_UNIT_CONFIG,
      statFilterMaxMin: STAT_FILTER_MAX_MIN,
      unitCascaderProps: {
        children: 'children',
        label: 'label',
        value: 'value'
      },
      fillForm: {
        Key: '',
        Name: '',
        SUnit: '',
        StaticsType: TYPE_REAL_STAT,
        DisplayType: STAT_TYPE_CHECK,
        ShowState: STAT_SHOW_LEVEL_DEVICE,
        FilterType: STAT_FILTER_NO,
        Filter: '',
        _minFilter: 0,
        _maxFilter: 0,
        Standard: '',
        TypeId: ''
      },
      minFilterIsValid: true, // 最小值是否通过校验
      maxFilterIsValid: true, // 最大值是否通过校验
      rules: {
        Key: [
          {
            required: true,
            message: '请输入数据定义Key',
            trigger: 'blur'
          },
          {
            min: 3,
            max: 20,
            message: '长度在 3 到 20 个字符',
            trigger: 'blur'
          }
        ],
        Name: [
          {
            required: true,
            message: '请输入模板名称',
            trigger: 'blur'
          },
          {
            min: 3,
            max: 20,
            message: '长度在 3 到 20 个字符',
            trigger: 'blur'
          }
        ],
        Standard: [
          {
            required: true,
            message: '请输入标准值',
            trigger: 'blur'
          },
          {
            trigger: 'blur',
            ...$validate.checkNumber().rule()
          }
        ],
        _minFilter: [
          {
            trigger: 'blur',
            validator: (rule, value, callback) => {
              if (value > this.fillForm._maxFilter) {
                this.minFilterIsValid = false
                callback(new Error('最小值不允许大于最大值'))
              } else {
                this.minFilterIsValid = true
                if (!this.maxFilterIsValid) {
                  this.$refs.fillForm.validateField('_maxFilter')
                }
                callback()
              }
            }
          }
        ],
        _maxFilter: [
          {
            trigger: 'blur',
            validator: (rule, value, callback) => {
              if (value < this.fillForm._minFilter) {
                this.maxFilterIsValid = false
                callback(new Error('最大值不允许小于最小值'))
              } else {
                this.maxFilterIsValid = true
                if (!this.minFilterIsValid) {
                  this.$refs.fillForm.validateField('_minFilter')
                }
                callback()
              }
            }
          }
        ]
      },
      tableData: [],
      pageTotal: 0, // 总条数
      pageSizes: [10, 20, 30], // 每页显示个数选择器的选项设置
      searchForm: {
        sortData: 'Id',
        sortType: 'asc',
        Key: '',
        Name: '',
        SUnit: ['-'],
        StaticsType: TYPE_REAL_STAT,
        DisplayType: STAT_TYPE_CHECK,
        ShowState: STAT_SHOW_LEVEL_DEVICE,
        FilterType: STAT_FILTER_NO,
        Filter: '',
        _minFilter: 0,
        _maxFilter: 0,
        Standard: '',
        pageSize: 0, // 每页显示个数
        pageNo: 1, // 当前第几页
        TypeId: ''
      }
    }
  },
  computed: {
    _Filter() {
      // console.log('computed _Filter')
      if (this.fillForm.FilterType === STAT_FILTER_MAX_MIN) {
        /* eslint-disable vue/no-side-effects-in-computed-properties */
        this.fillForm._minFilter = this.fillForm._minFilter || 0
        this.fillForm._maxFilter = this.fillForm._maxFilter || 0
        return `${this.fillForm._minFilter},${this.fillForm._maxFilter}`
      } else {
        return ''
      }
    }
  },

  watch: {
    // activeNode(newVal) {
    //   this.searchForm.TypeId = newVal.data.Idz
    //   this.fillForm.TypeId = newVal.data.Id
    //   this.handleRefresh()
    // }
    'activeNode.data'(newVal) {
      this.searchForm.TypeId = newVal.Id
      this.fillForm.TypeId = newVal.Id
      this.handleRefresh()
    },
    _Filter(newVal) {
      this.fillForm.Filter = newVal
    }
  },

  components: {},

  created() {
    __this = this
    this.searchForm.pageSize = this.pageSizes[0]
  },

  filters: {
    unitFilter: function(value) {
      const valueArray = __this.$utils.getCascaderObj(value, __this.dataTypeUnitConfig, __this.unitCascaderProps)
      const result = valueArray[valueArray.length - 1] ? valueArray[valueArray.length - 1].label : ''
      return result
    }
  },

  methods: {
    /* ----------------------------refresh---------------------------- */
    // 表单刷新
    handleRefresh() {
      this.loading = true
      this.tableData = []
      if (this.searchForm.TypeId) {
        this.$apis.deviceType
          .getTypeStatisticsInfoList(this.searchForm.TypeId)
          .then(result => {
            const tableData = result.Data
            this.$nextTick(() => {
              tableData.forEach(element => {
                let _minFilter = 0
                let _maxFilter = 0
                if (element.FilterType === STAT_FILTER_MAX_MIN && element.Filter.indexOf(',') > 0) {
                  const filter = element.Filter.split(',')
                  _minFilter = filter[0]
                  _maxFilter = filter[1]
                }
                this.tableData.push({
                  ...element,
                  // StaticsType: element.StaticsType,
                  _minFilter: _minFilter,
                  _maxFilter: _maxFilter,
                  SUnit: this.$utils.isJsonString(element.SUnit) ? JSON.parse(element.SUnit) : [`${element.SUnit}`]
                })
              })
            })
          })
          .catch(errMsg => {
            this.$message.error(errMsg)
            console.error(errMsg)
          })
          .fin(() => {
            this.loading = false
          })
      }
    },

    // 每页显示条目个数改变时
    handleSizeChange(val) {
      this.searchForm.pageSize = val
      this.handleRefresh()
    },
    // 页码改变时的事件
    handleCurrentChange(val) {
      this.searchForm.pageNo = val
      this.handleRefresh()
      // console.log(`当前页: ${val}`)
    },

    // （新增/编辑）确认事件
    onSureClick() {
      const data = JSON.parse(JSON.stringify(this.fillForm))
      data.SUnit = JSON.stringify(data.SUnit)

      this.$refs.fillForm.validate(valid => {
        if (!valid) return
        if (this.isAdd) {
          // 新增
          this.$apis.deviceType
            .typeStatisticsInfoAdd(data)
            .then(result => {
              this.$message.success(result.message)
              this.isDialogVisible = false
              this.handleRefresh()
            })
            .catch(errMsg => {
              this.$message.error(String(errMsg))
            })
        } else {
          // 编辑
          this.$apis.deviceType
            .typeStatisticsInfoSave(data)
            .then(result => {
              this.$message.success(result.message)
              this.isDialogVisible = false
              this.handleRefresh()
            })
            .catch(errMsg => {
              this.$message.error(String(errMsg))
            })
        }
      })
    },
    // 新增
    onAddClick() {
      this.isAdd = true
      this.isDialogVisible = true
      this.fillForm.Name = ''
      this.fillForm.Key = ''
      this.fillForm.SUnit = ['-']
      this.fillForm.StaticsType = TYPE_REAL_STAT
      this.fillForm.DisplayType = STAT_TYPE_CHECK
      this.fillForm.ShowState = STAT_SHOW_LEVEL_DEVICE
      this.fillForm.FilterType = STAT_FILTER_NO
      this.fillForm.Filter = ''
      this.fillForm._minFilter = 0
      this.fillForm._maxFilter = 0
      this.fillForm.Standard = ''
    },
    // 编辑
    onEditClick(rowData) {
      this.isAdd = false
      this.isDialogVisible = true
      this.fillForm = JSON.parse(JSON.stringify(rowData))
    },
    // 删除模板
    onDelClick(rowData) {
      this.$confirm('是否删除该记录？', '提示', {
        cancelButtonClass: 'el-button--cancel',
        closeOnClickModal: false
      })
        .then(() => {
          this.$apis.deviceType
            .typeStatisticsInfoRemove({
              Id: rowData.Id,
              TypeId: rowData.TypeId
            })
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
          this.$message.success('取消删除')
        })
    }
  }
}
</script>
<style lang="scss"></style>
