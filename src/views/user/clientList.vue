<!--
 * @Author: jiapeng.Zheng
 * @Date: 2018-08-22 10:29:47
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-31 17:15:23
 * @Description: 客户列表
 -->
<template>
  <div class="module-content">
    <!-- 临时添加的关闭按钮 -->
    <i class="el-icon-close module-content-close" :title="$t('close')" @click="$vueRouterGenerator.goBackByHistoryPath($route.fullPath)"></i>
    <div class="panel panel-default">
      <div class="panel-body">
        <el-card class="box-card">
          <el-row :gutter="10">
            <el-col :xs="24" :sm="12" :md="12" :lg="7">
              <el-input :placeholder="$t('pleaseEnter') + $t('clientName')" v-model="searchForm.ClientName">
                <template slot="prepend">{{ $t('clientName') }}</template>
              </el-input>
            </el-col>
            <!-- <el-col :xs="24" :sm="12" :md="12" :lg="5">
              <el-input :placeholder="$('pleaseEnter') + $t('clientName')" v-model="searchForm.ClientName">
                <template slot="prepend">{{$t('clientName')}}</template>
              </el-input>
            </el-col> -->
            <el-col :xs="24" :sm="12" :md="12" :lg="7">
              <el-button type="primary" icon="search" @click="onSearchClick()">{{ $t('search') }}</el-button>
              <el-button type="primary" icon="plus" @click="onAddClick()">{{ $t('add') }}</el-button>
              <!-- <el-button type="primary" @click="onRefresh()"><icon name="sync"></icon>{{ $t('refresh') }}</el-button> -->
            </el-col>
          </el-row>
        </el-card>
        <el-card v-loading.body="loading">
          <el-table :data="paginationTableData" border>
            <el-table-column prop="ClientSn" :label="$t('clientSn')" width="100"></el-table-column>
            <el-table-column prop="ClientName" :label="$t('clientName')" width="100"></el-table-column>
            <el-table-column prop="Linkman" :label="$t('linkman')" min-width="80"></el-table-column>
            <el-table-column prop="Telephone" :label="$t('telephone')" min-width="100"></el-table-column>
            <el-table-column prop="Mobile" :label="$t('mobile')" min-width="80"></el-table-column>
            <el-table-column prop="Address" :label="$t('address')" min-width="150"></el-table-column>
            <el-table-column prop="Description" :label="$t('description')" min-width="200"></el-table-column>
            <el-table-column label="操作" min-width="250">
              <template v-slot="scope">
                <el-button @click="onEditClick(scope.row, scope.$index)" type="primary" size="small">编辑</el-button>
                <el-button @click="onDelClick(scope.row.Id)" type="danger" size="small">删除</el-button>
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

    <el-dialog :visible="isVisible" width="30%" @close="onClose" class="edit-dialog" :close-on-click-modal="false" :show-close="false">
      <span slot="title" class="el-dialog__title">客户编辑</span>
      <el-form :model="currentRowData" :rules="rules" ref="currentRowData">
        <div class="form-group col-sm-11">
          <el-form-item :label="$t('clientSn')" prop="ClientSn">
            <el-input v-model="currentRowData.ClientSn"></el-input>
          </el-form-item>
        </div>
        <div class="form-group col-sm-11">
          <el-form-item :label="$t('clientName')" prop="ClientName">
            <el-input v-model="currentRowData.ClientName"></el-input>
          </el-form-item>
        </div>
        <div class="form-group col-sm-11">
          <el-form-item :label="$t('linkman')" prop="Linkman">
            <el-input v-model="currentRowData.Linkman"></el-input>
          </el-form-item>
        </div>
        <div class="form-group col-sm-11">
          <el-form-item :label="$t('telephone')" prop="Telephone">
            <el-input v-model="currentRowData.Telephone"></el-input>
          </el-form-item>
        </div>
        <div class="form-group col-sm-11">
          <el-form-item :label="$t('mobile')" prop="Mobile">
            <el-input v-model="currentRowData.Mobile"></el-input>
          </el-form-item>
        </div>
        <div class="form-group col-sm-11">
          <el-form-item :label="$t('address')" prop="Address">
            <el-input v-model="currentRowData.Address"></el-input>
          </el-form-item>
        </div>
        <div class="form-group col-sm-11">
          <el-form-item :label="$t('description')" prop="Description">
            <el-input v-model="currentRowData.Description"></el-input>
          </el-form-item>
        </div>
      </el-form>
      <span slot="footer">
        <el-button type="cancel" @click="isVisible = false"> {{ $t('cancel') }}</el-button>
        <el-button type="primary" @click="onSureClick"> {{ $t('confirm') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
// import store from '@store'
import { $utils, $validate } from '@helper'
import { USER_STATE_DIC } from '@constants/dictionaries'

let self

export default {
  name: 'client-list',
  props: {},

  data() {
    return {
      isVisible: false,
      loading: true,
      userStateDic: USER_STATE_DIC,
      pageNo: 1,
      pageTotal: 0, // 总条数
      pageSize: 0, // 每页显示个数
      pageSizes: [10, 20, 30], // 每页显示个数选择器的选项设置
      searchDateRange: 30, // 允许搜索的时间范围
      searchDateRangeUnit: 'd', // 允许搜索的时间范围的单位
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
      searchForm: {
        ClientName: ''
      },
      tableData: [],
      currentRowIndex: -1,
      currentRowData: {
        Linkman: '',
        Telephone: '',
        Mobile: '',
        Address: '',
        Description: '',
        ClientName: '',
        ClientSn: ''
      },
      rules: {
        Linkman: [
          {
            required: true,
            message: this.$t('pleaseEnter') + this.$t('linkman'),
            trigger: 'change'
          }
        ],
        Telephone: [
          {
            message: this.$t('pleaseEnter') + this.$t('telephone'),
            ...$validate.telephone().rule(),
            trigger: 'change'
          }
        ],
        Mobile: [
          {
            required: true,
            message: this.$t('pleaseEnter') + this.$t('mobile'),
            ...$validate.mobile().rule(),
            trigger: 'change'
          }
        ],
        Address: [
          {
            required: true,
            message: this.$t('pleaseEnter') + this.$t('address'),
            trigger: 'change'
          }
        ],
        Description: [
          {
            max: 100,
            message: `${this.$t('description')}不能超过100字符`,
            trigger: 'change'
          }
        ],
        ClientName: [
          {
            required: true,
            message: this.$t('pleaseEnter') + this.$t('clientName'),
            trigger: 'change'
          }
        ],
        ClientSn: [
          {
            required: true,
            message: this.$t('pleaseEnter') + this.$t('clientSn'),
            trigger: 'change'
          }
        ]
      }
    }
  },

  components: {},

  computed: {
    // 对tableData进行筛选后获得的数据
    searchTableData() {
      return this.tableData.filter(item => {
        let isAccord = true
        isAccord = $utils.likeSearch(item.ClientName, self.searchForm.ClientName)
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
      this.pageSize = val
      this.handleRefresh()
    },

    handleCurrentChange(val) {
      this.pageNo = val
      this.handleRefresh()
    },
    /* ----------------------------refresh---------------------------- */
    // 表单刷新
    async handleRefresh() {
      this.loading = true // 设置loading
      try {
        // 获取表单信息
        const result = await this.$apis.client.getAll({ pageSize: this.pageSize, pageNo: this.pageNo })
        this.tableData = result.list
        // 数据处理
        // this.pageSize = result.PageSize
        // this.pageNo = result.PageNo
        this.pageTotal = result.list.length
      } catch (errMsg) {
        self.$message.error(errMsg)
        console.error(errMsg)
      } finally {
        self.loading = false // 移除loading
      }
    },

    /* ----------------------------On Click Event---------------------------- */
    // 新增
    onAddClick() {
      this.currentRowData = {}
      this.isVisible = true
    },
    // 编辑
    onEditClick(rowData, index) {
      this.currentRowData = JSON.parse(JSON.stringify(rowData))
      this.currentRowIndex = index
      this.isVisible = true
    },
    // 确认
    onSureClick() {
      this.$refs.currentRowData.validate(valid => {
        if (!valid) return
        if (this.currentRowData.Id) {
          // 编辑
          this.$apis.client
            .update(this.currentRowData)
            .then(result => {
              this.$message.success(result.message)
              this.isVisible = false
              this.handleRefresh()
            })
            .catch(errMsg => {
              this.$message.error(errMsg)
              console.error(errMsg)
            })
        } else {
          // 新增
          this.$apis.client
            .add(this.currentRowData)
            .then(result => {
              this.$message.success(result.message)
              this.isVisible = false
              this.handleRefresh()
            })
            .catch(errMsg => {
              this.$message.error(errMsg)
              console.error(errMsg)
            })
        }
      })
    },
    // 删除
    onDelClick(id) {
      this.$confirm('是否删除该记录？', '提示', { cancelButtonClass: 'el-button--cancel', closeOnClickModal: false })
        .then(() => {
          this.$apis.client
            .delete(id)
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

    onSearchClick() {
      this.handleRefresh()
    },

    onRefresh() {
      // 清空搜索域
      this.searchForm = { ClientName: '' }
      this.handleRefresh()
    },
    onClose() {
      this.$refs.currentRowData.resetFields()
    }
  }
}
</script>
<style lang="scss"></style>
