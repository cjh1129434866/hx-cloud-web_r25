<!--
 * @Author: jiapeng.Zheng
 * @Date: 2018-08-20 09:13:22
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-31 14:32:48
 * @Description: 用户列表
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
              <el-input placeholder="请输入用户账号" v-model="searchForm.Account">
                <template slot="prepend">
                  账号
                </template>
              </el-input>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="4">
              <el-input placeholder="请输入用户真实姓名" v-model="searchForm.UserName">
                <template slot="prepend">
                  真实姓名
                </template>
              </el-input>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="4">
              <el-select v-model="searchForm.IsAdmin" placeholder="请选择用户类型" filterable clearable>
                <el-option label="管理员" :value="true"></el-option>
                <el-option label="普通用户" :value="false"></el-option>
              </el-select>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="4">
              <el-select v-model="searchForm.roleId" placeholder="请选择角色" filterable clearable>
                <el-option v-for="(value, key) in userRoles" :key="key" :label="value.RoleName" :value="value.Id"> </el-option>
              </el-select>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="4">
              <el-select v-model="searchForm.Valide" placeholder="请选择用户状态" filterable clearable>
                <el-option v-for="(value, key) in userStateDic" :key="key" :label="value" :value="key"> </el-option>
              </el-select>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="4">
              <el-button type="primary" icon="search" @click="onSearchClick()">{{ $t('search') }}</el-button>
              <el-button type="primary" icon="plus" @click="onAddClick()">{{ $t('add') }}</el-button>
              <!-- <el-button type="primary" @click="onRefresh()"><icon name="sync"></icon>{{ $t('refresh') }}</el-button> -->
            </el-col>
          </el-row>
        </el-card>
        <el-card v-loading.body="loading">
          <el-table :data="tableData" border>
            <el-table-column prop="Account" :label="$t('account')" min-width="150"></el-table-column>
            <el-table-column prop="UserName" :label="$t('realname')" min-width="200"></el-table-column>
            <el-table-column prop="IsAdmin" label="用户类型" min-width="100">
              <template v-slot="scope">
                {{ scope.row.IsAdmin ? '管理员' : '普通用户' }}
              </template>
            </el-table-column>
            <el-table-column prop="RoleName" label="角色" min-width="100">
              <template v-slot="scope">
                {{ scope.row.RoleName }}
                <i v-if="scope.row.RoleName" class="el-icon-edit icon-button" title="编辑角色" @click="onEditClick(scope.row, scope.$index)"></i>
                <i v-else class="el-icon-plus icon-button" title="新增角色" @click="onEditClick(scope.row, scope.$index)"></i>
              </template>
            </el-table-column>
            <el-table-column prop="Valide" label="状态" width="100">
              <template v-slot="scope">
                {{ userStateDic[scope.row.Valide] }}
              </template>
            </el-table-column>
            <el-table-column label="操作" min-width="160" width="160">
              <template v-slot="scope">
                <el-button v-if="scope.row.Valide !== 1" @click="valideUser(scope.row.Id, 1)" type="success" size="small">审核</el-button>
                <el-button v-if="scope.row.Valide === 1" @click="valideUser(scope.row.Id, 2)" type="warning" size="small">禁用</el-button>
                <!-- <el-button @click="onEditClick(scope.row, scope.$index)" type="primary" size="small">编辑</el-button>
                <el-button @click="onDelClick(scope.row.Id)" type="danger" size="small">删除</el-button> -->
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
    <!-- 修改密码 -->
    <user-edit v-model="isUserEditVisible" :pdata="currentRowData" :option="{ title: $t('adds') + $t('user') }" @dispatch-data="onInsertRowData"></user-edit>
    <!-- 权限设置 -->
    <user-role-edit :option="{ title: '编辑角色' }" :pdata="currentRowData" v-model="isUserRoleEditVisible" @dispatch-data="onUpdateRowData"></user-role-edit>
  </div>
</template>

<script>
// import store from '@store'
import { $utils } from '@helper'
import { USER_STATE_DIC } from '@constants/dictionaries'

let self

export default {
  name: 'user-list',
  props: {},

  data() {
    return {
      loading: true,
      userStateDic: USER_STATE_DIC,
      currentPage: 1,
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
        Account: '',
        UserName: '',
        roleId: '',
        IsAdmin: '',
        Valide: ''
      },
      deviceDict: {},
      userRoles: [],
      tableData: [],
      isUserEditVisible: false,
      isUserRoleEditVisible: false,
      currentRowData: {},
      currentRowIndex: -1
    }
  },

  components: {
    // EditDialog
    // 异步加载组件的写法
    UserRoleEdit: resolve => require.ensure([], () => resolve(require('./userRoleEdit')), 'UserRoleEdit'),
    userEdit: resolve => require.ensure([], () => resolve(require('./userEdit')), 'userEdit')
    // RoleMenuDialog: resolve => require.ensure([], () => resolve(require('./roleMenu')), 'RoleMenuDialog'),
    // RoleProjectDialog: resolve => require.ensure([], () => resolve(require('./roleProject')), 'RoleProject')
  },

  computed: {
    // 对tableData进行筛选后获得的数据
    // searchTableData() {
    //   let searchTableData = this.tableData.filter(item => {
    //     let isAccord = true
    //     isAccord = $utils.likeSearch(item.RoleName, self.searchForm.RoleName) && $utils.dataEquary(item.IsAdmin, self.searchForm.IsAdmin)
    //     return isAccord
    //   })
    //   this.pageTotal = searchTableData.length
    //   return searchTableData
    // }
  },

  watch: {},

  async created() {
    self = this
    // 初始化pageSize
    this.pageSize = self.pageSizes[0]
    try {
      // 获取角色信息
      const result = await this.$apis.role.get()
      this.userRoles = result.List
    } catch (errMsg) {
      this.$message.error(errMsg.toString())
      console.error(errMsg)
    }
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
      this.currentPage = val
      this.handleRefresh()
    },
    /* ----------------------------refresh---------------------------- */
    // 表单刷新
    async handleRefresh() {
      this.loading = true // 设置loading
      try {
        // 获取表单信息
        const result = await this.$apis.user.getUserList({
          ...this.searchForm,
          pageSize: this.pageSize,
          pageNo: this.currentPage
        })
        this.tableData = result.Users
        // 数据处理
        this.pageSize = result.PageSize
        this.currentPage = result.PageNo
        this.pageTotal = result.DataCount
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
      this.currentRowData = { UserAccount: '', RealName: '', Password: '', PasswordAgain: '' }
      this.isUserEditVisible = true
    },
    // 新增确认
    onInsertRowData(data) {
      this.$apis.user
        .addUser(data)
        .then(result => {
          this.$message.success(result.message)
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
      this.isUserRoleEditVisible = true
    },
    // 编辑确认
    onUpdateRowData() {
      this.handleRefresh()
    },
    // // 删除
    // onDelClick(deviceSn) {
    //   this.$confirm('是否删除该记录？', '提示', { cancelButtonClass: 'el-button--cancel', closeOnClickModal: false })
    //     .then(() => {
    //       // 暂无删除用户的功能
    //     })
    //     .catch(() => {
    //       this.$message.success('取消删除')
    //     })
    // },

    onSearchClick() {
      this.handleRefresh()
    },

    onRefresh() {
      // 清空搜索域
      this.searchForm = { UserName: '', Valide: '', IsAdmin: '' }
      this.handleRefresh()
    },

    // 激活/禁用 用户
    valideUser(id, valid) {
      this.$apis.user
        .checkUser({ id, valid })
        .then(result => {
          this.$message.success(result.message)
          this.handleRefresh()
        })
        .catch(errMsg => {
          this.$message.error(errMsg)
          console.error(errMsg)
        })
    }
  }
}
</script>
<style lang="scss">
@import '~@assets/scss/variables.scss';
.icon-help {
  color: $element-danger-color;
}
.icon-button {
  cursor: pointer;
}
</style>
