<!--
 * @Author: jiapeng.Zheng
 * @Date: 2018-08-20 09:13:22
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-31 16:44:01
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
              <el-input placeholder="请输入角色名称" v-model="searchForm.RoleName">
                <template slot="prepend">
                  角色名称
                </template>
              </el-input>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="5">
              <el-select v-model="searchForm.IsAdmin" placeholder="请选择角色类型" filterable clearable>
                <el-option v-for="(value, key) in roleTypeDic" :key="key" :label="value" :value="key"> </el-option>
              </el-select>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="7">
              <el-button type="primary" icon="search" @click="handleRefresh()">{{ $t('search') }}</el-button>
              <el-button type="primary" icon="plus" @click="onAddClick()">{{ $t('add') }}</el-button>
            </el-col>
          </el-row>
        </el-card>
        <el-card v-loading.body="loading">
          <el-table :data="tableData" border>
            <el-table-column prop="RoleName" label="角色名称" min-width="200"></el-table-column>
            <el-table-column prop="IsAdmin" label="角色类型" min-width="150">
              <template v-slot="scope">
                {{ roleTypeDic[scope.row.IsAdmin] }}
              </template>
            </el-table-column>
            <el-table-column label="操作（ 注：管理员默认拥有所有权限 ）" min-width="320" width="320">
              <template v-slot="scope">
                <el-button @click="onEditClick(scope.row, scope.$index)" type="primary" size="small">编辑</el-button>
                <el-button v-if="scope.row.IsAdmin === '0'" @click="onRoleMenuClick(scope.row, scope.$index)" type="primary" size="small">菜单权限</el-button>
                <el-button v-if="scope.row.IsAdmin === '0'" @click="onRoleProjectClick(scope.row, scope.$index)" type="primary" size="small">项目权限</el-button>
                <el-button @click="onDelClick(scope.row.Id)" type="danger" size="small">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="table-operate">
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="currentPage"
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
    <edit-dialog :option="{ title: '编辑角色' }" :pdata="currentRowData" v-model="isEditDialogVisible" @dispatch-data="onUpdateRowData"></edit-dialog>
    <edit-dialog :option="{ title: '新增角色' }" :pdata="currentRowData" v-model="isAddDialogVisible" @dispatch-data="onInsertRowData"></edit-dialog>

    <role-menu-dialog :option="{ title: '菜单权限' }" :pdata="currentRowData" v-model="isRoleMenuVisible"></role-menu-dialog>

    <role-project-dialog :option="{ title: '项目权限' }" :pdata="currentRowData" v-model="isRoleProjectVisible"></role-project-dialog>
  </div>
</template>

<script>
// import store from '@store'
import { ROLE_TYPE_DIC } from '@constants/dictionaries'

let self

export default {
  name: 'role-list',
  props: {},

  data() {
    return {
      loading: true,
      roleTypeDic: ROLE_TYPE_DIC,
      currentPage: 1,
      pageTotal: 0, // 总条数
      pageSize: 0, // 每页显示个数
      pageSizes: [10, 20, 30], // 每页显示个数选择器的选项设置
      searchDateRange: 30, // 允许搜索的时间范围
      searchDateRangeUnit: 'd', // 允许搜索的时间范围的单位
      searchForm: {
        RoleName: '',
        IsAdmin: ''
      },
      deviceDict: {},
      tableData: [],
      isAddDialogVisible: false,
      isEditDialogVisible: false,
      isRoleMenuVisible: false,
      isRoleProjectVisible: false,
      currentRowData: {},
      currentRowIndex: -1
    }
  },

  components: {
    // EditDialog
    // 异步加载组件的写法
    EditDialog: resolve => require.ensure([], () => resolve(require('./edit')), 'RoleEditDialog'),
    RoleMenuDialog: resolve => require.ensure([], () => resolve(require('./roleMenu')), 'RoleMenuDialog'),
    RoleProjectDialog: resolve => require.ensure([], () => resolve(require('./roleProject')), 'RoleProject')
  },

  // computed: {
  //   // 对tableData进行筛选后获得的数据
  //   searchTableData() {
  //     let searchTableData = this.tableData.filter(item => {
  //       let isAccord = true
  //       isAccord = $utils.likeSearch(item.RoleName, self.searchForm.RoleName) && $utils.dataEquary(item.IsAdmin, self.searchForm.IsAdmin)
  //       return isAccord
  //     })
  //     this.pageTotal = searchTableData.length
  //     return searchTableData
  //   },
  //   // 对searchTableData进行分页后获得的数据
  //   paginationTableData() {
  //     return $utils.pagination(this.searchTableData, this.pageSize, this.currentPage)
  //   }
  // },

  watch: {},

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
      this.handleRefresh()
    },

    handleCurrentChange(val) {
      // console.log(`当前页: ${val}`)
      this.currentPage = val
      this.handleRefresh()
    },
    /* ----------------------------refresh---------------------------- */
    // 表单刷新
    async handleRefresh() {
      // 清空搜索域
      // this.searchForm = {
      //   RoleName: '',
      //   IsAdmin: ''
      // }
      this.loading = true // 设置loading
      try {
        // 获取表单信息
        const result = await this.$apis.role.getPageRoles({
          ...this.searchForm,
          pageSize: this.pageSize,
          pageNo: this.currentPage
        })
        this.tableData = result.list
        this.pageSize = result.PageSize
        this.currentPage = result.PageNo
        this.pageTotal = result.DataCount
        // 数据处理
        for (const [index] of self.tableData.entries()) {
          self.tableData[index].IsAdmin += '' // number类型转换为string类型
        }
      } catch (errMsg) {
        self.$message.error(errMsg.toString())
        console.error(errMsg)
      } finally {
        self.loading = false // 移除loading
      }
    },

    /* ----------------------------On Click Event---------------------------- */
    // 新增
    onAddClick() {
      this.currentRowData = { IsAdmin: '' }
      this.isAddDialogVisible = true
    },
    // 新增确认
    onInsertRowData(data) {
      this.$apis.role
        .add(data)
        .then(result => {
          this.$message.success(result.Message)
          this.handleRefresh()
        })
        .catch(errMsg => {
          this.$message.error(errMsg)
          console.error(errMsg)
        })
    },
    // 编辑
    onEditClick(rowData, index) {
      this.currentRowData = rowData
      this.currentRowIndex = index
      this.isEditDialogVisible = true
    },
    // 编辑确认
    onUpdateRowData(data) {
      this.currentRowData = data
      this.$apis.role
        .update(data)
        .then(result => {
          this.$message.success(result.Message)
          this.handleRefresh()
        })
        .catch(errMsg => {
          this.$message.error(errMsg)
          console.error(errMsg)
        })
    },
    // 删除
    onDelClick(deviceSn) {
      this.$confirm('是否删除该记录？', '提示', { cancelButtonClass: 'el-button--cancel', closeOnClickModal: false })
        .then(() => {
          this.$apis.role
            .delete(deviceSn)
            .then(result => {
              this.$message.success(result.Message)
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
    },

    // 菜单权限
    onRoleMenuClick(rowData, index) {
      this.currentRowData = rowData
      this.currentRowIndex = index
      this.isRoleMenuVisible = true
    },
    // 项目权限
    onRoleProjectClick(rowData, index) {
      this.currentRowData = rowData
      this.currentRowIndex = index
      this.isRoleProjectVisible = true
    }
  }
}
</script>
<style lang="scss">
@import '~@assets/scss/variables.scss';
.icon-help {
  color: $element-danger-color;
}
</style>
