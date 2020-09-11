<!--
 * @Author: jiapeng.Zheng
 * @Date: 2018-11-12 09:27:41
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-04-09 13:45:17
 * @Description:
 -->
<template>
  <div class="module-content">
    <!-- 临时添加的关闭按钮 -->
    <i class="el-icon-close module-content-close" :title="$t('close')" @click="$vueRouterGenerator.goBackByHistoryPath($route.fullPath)"></i>
    <div class="panel panel-default">
      <div class="panel-body">
        <el-card class="box-card">
          <el-row :gutter="10">
            <el-col :xs="24" :sm="12" :md="12" :lg="4">
              <el-input placeholder="请输入设备编码" v-model="searchForm.DeviceNo">
                <template slot="prepend">
                  设备编码
                </template>
              </el-input>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="5">
              <el-input placeholder="请输入设备名称" v-model="searchForm.DeviceName">
                <template slot="prepend">
                  设备名称
                </template>
              </el-input>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="5">
              <el-select v-model="searchForm.TypeId" placeholder="请选择设备类型" filterable clearable>
                <el-option v-for="(value, key) in $commonParam.deviceTypeNameDict" :key="key" :label="value" :value="key"></el-option>
              </el-select>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="7">
              <el-button type="primary" icon="search" @click="handleRefresh()">{{ $t('search') }}</el-button>
              <!-- <el-button type="primary" icon="plus" @click="onAddClick()">{{ $t('add') }}</el-button> -->
              <!-- <el-button type="primary" @click="handleRefresh()" :loading="!isTimeOut"><icon name="sync"></icon>{{ $t('refresh') }}</el-button> -->
              <!-- <el-button type="primary" @click="handleRefresh()" ><icon name="sync"></icon>{{ $t('refresh') }}</el-button> -->
            </el-col>
          </el-row>
        </el-card>
        <el-card v-loading.body="loading">
          <el-table :data="paginationTableData" border>
            <!-- <el-table-column prop="UseTime" label="启用时间" min-width="200"></el-table-column>
            <el-table-column prop="ProductTime" label="出厂时间" min-width="200"></el-table-column> -->
            <el-table-column prop="DeviceNo" label="设备编码" min-width="200"></el-table-column>
            <el-table-column prop="DeviceName" label="设备名称" min-width="150">
              <!-- <template v-slot="scope">
                <li class="text-link" @click="onLinkClick(scope.row)">{{ scope.row.DeviceName }}</li>
              </template> -->
            </el-table-column>
            <el-table-column prop="TypeId" label="设备类型" min-width="150" :formatter="deviceTypeFormatter"></el-table-column>
            <el-table-column prop="DeviceDescription" label="设备描述" min-width="200"></el-table-column>
            <el-table-column label="操作" min-width="250">
              <template v-slot="scope">
                <el-button @click="onEditClick(scope.row, scope.$index)" type="primary" size="small">{{ $t('deviceTransfer') }}</el-button>
                <el-button @click="onTransferLogClick(scope.row, scope.$index)" type="primary" size="small">{{ $t('transferLog') }}</el-button>
                <el-button @click="onDelClick(scope.row)" type="danger" size="small">{{ $t('delete') }}</el-button>
              </template>
            </el-table-column>
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
        </el-card>
      </div>
    </div>
    <recycle-bin-edit :option="{ title: $t('deviceTransfer') }" :pdata="currentRowData" v-model="isEditDialogVisible" @dispatch-data="onUpdateRowData"></recycle-bin-edit>
    <transfer-log-dialog :option="{ title: currentRowData.DeviceName }" :pdata="currentRowData" v-model="isTransferLogVisible"></transfer-log-dialog>
  </div>
</template>

<script>
import { $utils } from '@helper'

let self

export default {
  name: 'recycle-bin-list',

  props: {},

  data() {
    return {
      projectId: '',
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
      sortData: 'DeviceNo',
      sortType: 'asc',
      tableData: [],
      isAddDialogVisible: false,
      isEditDialogVisible: false,
      isTransferLogVisible: false,
      currentRowData: {},
      currentRowIndex: -1,
      topicObj: {},
      topicTimeOut: 5000, // 主题回复时间，单位ms；若超过topicTimeOut则说明设备不在线
      topicTimeOutId: 0,
      isTimeOut: false //  是否已经超过主题回复时间
    }
  },

  components: {
    // EditDialog
    // 异步加载组件的写法
    recycleBinEdit: resolve => require.ensure([], () => resolve(require('./recycleBinEdit')), 'recycleBinEdit'),
    transferLogDialog: resolve => require.ensure([], () => resolve(require('./transferLog')), 'transferLogDialog')
  },

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
    searchTableData(data) {
      this.pageTotal = data.length
    }
  },

  created() {
    self = this
    // 初始化pageSize
    this.pageSize = self.pageSizes[0]
    // 刷新加载数据
    this.handleRefresh()
  },

  filters: {},

  methods: {
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
    // 设备类型格式化
    deviceTypeFormatter(row) {
      return this.$commonParam.deviceTypeNameDict[row.TypeId]
    },

    /* ----------------------------refresh---------------------------- */
    // 表单刷新
    async handleRefresh() {
      // 清空搜索域
      // this.searchForm = {
      //   // startDate: '',
      //   // endDate: '',
      //   DeviceNo: '',
      //   DeviceName: '',
      //   TypeId: ''
      // }
      this.projectId = this.$route.params.id
      this.loading = true // 设置loading

      try {
        // 获取表单信息
        const result = await this.$apis.device.getNoProjectDevcice(this.searchForm)
        this.tableData = result.list
        this.pageTotal = result.list.length
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

    /* ----------------------------On Click Event---------------------------- */
    // 编辑
    onEditClick(rowData, index) {
      this.currentRowData = rowData
      this.currentRowIndex = index
      this.isEditDialogVisible = true
    },
    // 编辑确认
    onUpdateRowData() {
      this.handleRefresh()
    },
    // 迁移记录
    onTransferLogClick(rowData, index) {
      this.currentRowData = rowData
      this.currentRowIndex = index
      this.isTransferLogVisible = true
    },
    // 删除
    onDelClick(rowData) {
      this.$confirm(`确实要永久性的删除【${rowData.DeviceName}】该设备吗？`, '提示', {
        cancelButtonClass: 'el-button--cancel',
        closeOnClickModal: false
      })
        .then(() => {
          this.$apis.device
            .deleteDevice(rowData.DeviceSn)
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
          this.$message.warning(`取消删除设备【${rowData.DeviceName}】`)
        })
    }
  }
}
</script>
<style lang="scss"></style>
