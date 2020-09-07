<template>
  <el-dialog :visible="isVisible" @close="onClose" class="edit-dialog" :close-on-click-modal="false" :show-close="false">
    <span slot="title" class="el-dialog__title">【{{ option.title }}】{{ $t('transferLog') }}</span>
    <!--
        <el-card class="box-card">
          <el-row :gutter="10">
            <el-col :xs="24" :sm="12" :md="12" :lg="4">
              <el-input placeholder="请输入设备编码" v-model="searchForm.DeviceNo">
                <template slot="prepend">设备编码</template>
              </el-input>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="5">
              <el-input placeholder="请输入设备名称" v-model="searchForm.DeviceName">
                <template slot="prepend">设备名称</template>
              </el-input>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="5">
              <el-select v-model="searchForm.TypeId" placeholder="请选择设备类型" filterable clearable >
                <el-option v-for="(value, key) in $commonParam.deviceTypeNameDict"
                  :key="key"
                  :label="value"
                  :value="key">
                </el-option>
              </el-select>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="7">
              <el-button type="primary" icon="search" @click="handleRefresh()">{{ $t('search') }}</el-button>
            </el-col>
          </el-row>
        </el-card>
-->
    <el-table :data="paginationTableData" border>
      <!-- <el-table-column prop="DeviceNo" label="设备编码" min-width="200"></el-table-column> -->
      <el-table-column prop="CurrentPId" label="当前站场" min-width="120"></el-table-column>
      <el-table-column prop="PrePId" label="前一次站场" min-width="120"></el-table-column>
      <el-table-column prop="Date" label="日期" min-width="200" :formatter="dateFormatter"></el-table-column>
    </el-table>
    <div class="table-operate">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pageNo"
        :page-sizes="pageSizes"
        :page-size="pageSize"
        :total="pageTotal"
        layout="total, sizes, prev, pager, next, jumper"
      >
      </el-pagination>
    </div>

    <span slot="footer">
      <el-button type="cancel" @click="isVisible = false"> {{ $t('cancel') }}</el-button>
      <el-button type="primary" @click="onSureClick"> {{ $t('confirm') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { $utils } from '@helper'

let self

export default {
  name: 'transfer-log',

  props: {
    value: {
      type: Boolean,
      required: true
    },
    pdata: {
      type: Object,
      default() {
        return {}
      }
    },
    option: {
      type: Object,
      default() {
        return { title: '编辑' }
      }
    },
    cascaderType: {
      type: Array
    }
  },

  data() {
    return {
      isVisible: false,
      loading: true,
      pageNo: 1,
      pageSize: 0, // 每页显示个数
      pageTotal: 0, // 总条数
      pageSizes: [10, 20, 30], // 每页显示个数选择器的选项设置
      pickerOptions0: {
        disabledDate(time) {
          const dateDiff = $utils.dateCompare(self.searchForm.endDate, time, self.searchDateRangeUnit)
          return !(dateDiff >= 0 && dateDiff < self.searchDateRange)
        }
      },
      pickerOptions1: {
        disabledDate(time) {
          const dateDiff = $utils.dateCompare(time, self.searchForm.startDate, self.searchDateRangeUnit)
          return !(dateDiff >= 0 && dateDiff < self.searchDateRange)
        }
      },
      searchDateRange: 30, // 允许搜索的时间范围
      searchDateRangeUnit: 'd', // 允许搜索的时间范围的单位
      searchForm: {
        // startDate: '',
        // endDate: '',
        DeviceNo: '',
        DeviceName: '',
        TypeId: ''
      },
      fillForm: {
        DeviceSn: ''
      },
      tableData: [],
      currentRowData: {},
      currentRowIndex: -1
    }
  },

  components: {},

  computed: {
    // 对tableData进行筛选后获得的数据
    searchTableData() {
      return this.tableData.filter(item => {
        let isAccord = true
        isAccord =
          $utils.likeSearch(item.DeviceNo, self.searchForm.DeviceNo) &&
          $utils.likeSearch(item.DeviceName, self.searchForm.DeviceName) &&
          $utils.dataEquary(item.TypeId, self.searchForm.TypeId)
        return isAccord
      })
    },
    // 对searchTableData进行分页后获得的数据
    paginationTableData() {
      return $utils.pagination(this.searchTableData, this.pageSize, this.pageNo)
    }
  },

  watch: {
    value(newVal) {
      this.isVisible = newVal
      this.fillForm = JSON.parse(JSON.stringify(this.pdata)) // 使用两次JSON对数据进行深拷贝
      // 刷新加载数据
      this.handleRefresh()
    },
    searchTableData(data) {
      this.pageTotal = data.length
    }
  },

  created() {
    self = this
    // 初始化pageSize
    this.pageSize = self.pageSizes[0]
  },

  filters: {},

  methods: {
    /* ----------------------------refresh---------------------------- */
    // 表单刷新
    async handleRefresh() {
      // 清空搜索域
      this.searchForm = {
        // startDate: '',
        // endDate: '',
        DeviceNo: '',
        DeviceName: '',
        TypeId: ''
      }

      this.loading = true // 设置loading

      try {
        // 获取表单信息
        const result = await this.$apis.device.getDeviceMigration(this.fillForm.DeviceSn)
        this.tableData = result.ListMigration
        this.pageTotal = result.ListMigration.length
        for (const [index] of this.tableData.entries()) {
          this.tableData[index].TypeId += '' // number类型转换为string类型
        }
        // self.searchTableData = self.tableData
        // self.paginationTableData = $utils.pagination(self.searchTableData, self.pageSize, self.pageNo)
      } catch (errMsg) {
        this.$message.error(errMsg.toString())
      } finally {
        this.loading = false // 移除loading
      }
      return true
    },

    handleSizeChange(val) {
      // console.log(`每页 ${val} 条`)
      this.pageSize = val
      // this.handleRefresh()
      // self.paginationTableData = $utils.pagination(self.searchTableData, self.pageSize, self.pageNo)
    },

    handleCurrentChange(val) {
      // console.log(`当前页: ${val}`)
      this.pageNo = val
      // this.handleRefresh()
      // self.paginationTableData = $utils.pagination(self.searchTableData, self.pageSize, self.pageNo)
    },
    // 时间格式化
    dateFormatter(row) {
      return $utils.dateConvert(row.Date)
    },

    /* ----------------------------On Click Event---------------------------- */

    onClose() {
      this.isVisible = false
      this.$emit('input', this.isVisible)
    },

    onSureClick() {
      this.isVisible = false
      this.$emit('input', this.isVisible)
      // this.$refs.fillForm.validate(valid => {
      //   if (!valid) return
      //   // this.fillForm.date = this.$utils.dayConvert(this.fillForm.date)
      //   let TypeId = this.fillForm.TypeId
      //   this.fillForm.TypeId = TypeId[TypeId.length - 1]
      //   this.isVisible = false
      // })
    }
  }
}
</script>
<style lang="scss"></style>
