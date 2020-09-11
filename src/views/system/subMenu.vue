<!--
 * @Author: jiapeng.Zheng
 * @Date: 2018-08-13 13:55:11
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-04-01 12:20:07
 * @Description: 二级菜单
 -->
<template>
  <div class="module-content">
    <div class="panel panel-default">
      <div class="panel-body">
        <el-card class="box-card">
          <el-row :gutter="10">
            <el-col :xs="24" :sm="12" :md="12" :lg="6">
              <el-input placeholder="请输入名称" v-model="searchForm.name">
                <template slot="prepend">
                  名称
                </template>
              </el-input>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6">
              <el-input placeholder="请输入地址" v-model="searchForm.Url">
                <template slot="prepend">
                  地址
                </template>
              </el-input>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6">
              <el-input placeholder="请输入类型" v-model="searchForm.MenuType">
                <template slot="prepend">
                  类型
                </template>
              </el-input>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6">
              <el-input placeholder="请输入图标" v-model="searchForm.Icon">
                <template slot="prepend">
                  图标
                </template>
              </el-input>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6">
              <el-input placeholder="请输入备注" v-model="searchForm.Remarks">
                <template slot="prepend">
                  备注
                </template>
              </el-input>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="8">
              <el-button type="primary" icon="search" @click="onSearchClick()">{{ $t('search') }}</el-button>
              <el-button type="primary" icon="plus" @click="onAddClick()">{{ $t('add') }}</el-button>
              <el-button type="primary" @click="handleRefresh()"><icon name="sync"></icon>{{ $t('refresh') }}</el-button>
            </el-col>
          </el-row>
        </el-card>
        <el-card v-loading.body="loading">
          <el-table :data="paginationTableData" border>
            <el-table-column type="index" width="80"></el-table-column>
            <el-table-column prop="Name" label="名称" min-width="150">
              <template v-slot="scope">
                <!-- 导航菜单 -->
                <li v-if="scope.row.MenuType === defaultMenuType" class="text-link" @click="onLinkClick(scope.row.Id, scope.row.Name)">
                  <icon :name="scope.row.Icon"></icon>
                  {{ scope.row.Name }}
                </li>
                <!-- 链接菜单 -->
                <span v-else>
                  <icon class="tabel-icon-link" :name="scope.row.Icon"></icon>
                  {{ scope.row.Name }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="Url" label="菜单地址" min-width="200"></el-table-column>
            <el-table-column prop="MenuType" label="菜单类型" min-width="100">
              <template v-slot="scope">
                {{ menuTypeDic[scope.row.MenuType] }}
              </template>
            </el-table-column>
            <el-table-column prop="Remarks" label="备注"></el-table-column>
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

    <edit-dialog
      :option="{ title: '编辑', type: 'edit' }"
      :defaultMenuType="String(defaultMenuType)"
      :pdata="currentRowData"
      v-model="isEditDialogVisible"
      @dispatch-data="onUpdateRowData"
    ></edit-dialog>
    <edit-dialog
      :option="{ title: '新增', type: 'add' }"
      :defaultMenuType="String(defaultMenuType)"
      :pdata="currentRowData"
      v-model="isAddDialogVisible"
      @dispatch-data="onInsertRowData"
    ></edit-dialog>
  </div>
</template>

<script>
// import store from '@store'
import { $utils } from '@helper'
import { MENU_TYPE_DIC } from '@constants/dictionaries'

let self

export default {
  name: 'subMenu-list',

  props: {},

  data() {
    return {
      menuId: '',
      defaultMenuType: 0, // 导航菜单的类型id
      menuTypeDic: MENU_TYPE_DIC,
      loading: true,
      currentPage: 1, // 当前第几页
      pageTotal: 0, // 总条数
      pageSize: 0, // 每页显示个数
      pageSizes: [10, 20, 30], // 每页显示个数选择器的选项设置
      tableData: [], // 表单原始数据
      paginationTableData: [], // 对searchTableData进行分页后获得的数据
      searchTableData: [], // 对tableData进行筛选后获得的数据
      searchForm: {
        projectName: '',
        ProjectType: ''
      },
      isAddDialogVisible: false,
      isEditDialogVisible: false,
      currentRowData: {},
      currentRowIndex: -1
    }
  },
  computed: {},

  components: {
    EditDialog: resolve => require.ensure([], () => resolve(require('./menuEdit')), 'menuEditDialog')
  },

  watch: {
    $route() {
      this.handleRefresh()
    }
  },

  created() {
    self = this
    this.pageSize = self.pageSizes[0]
    this.handleRefresh()
  },

  filters: {},

  methods: {
    /* ----------------------------pagination Event---------------------------- */

    // 每页显示条目个数改变时
    handleSizeChange(val) {
      // console.log(`每页 ${val} 条`)
      this.pageSize = val
      self.paginationTableData = $utils.pagination(self.searchTableData, self.pageSize, self.currentPage)
    },
    // 页码改变时的事件
    handleCurrentChange(val) {
      this.currentPage = val
      self.paginationTableData = $utils.pagination(self.searchTableData, self.pageSize, self.currentPage)
      // console.log(`当前页: ${val}`)
    },
    /* ----------------------------refresh---------------------------- */
    // 表单刷新
    handleRefresh() {
      this.menuId = this.$route.params.id
      this.loading = true
      this.$apis.sysMenu
        .getSub(this.menuId)
        .then(result => {
          self.loading = false
          self.tableData = result.list

          self.searchTableData = self.tableData
          self.pageTotal = result.list.length
          self.paginationTableData = $utils.pagination(self.searchTableData, self.pageSize, self.currentPage)
        })
        .catch(errMsg => {
          this.$message.error(errMsg)
          console.error(errMsg)
        })
    },

    /* ----------------------------On Click Event---------------------------- */
    // 搜索
    onSearchClick() {
      // this.searchForm.startDate = $utils.dayConvert(this.searchForm.startDate)
      // this.searchForm.endDate = $utils.dayConvert(this.searchForm.endDate)
      // 数据筛选
      self.searchTableData = self.tableData.filter(item => {
        let isAccord = true
        isAccord = $utils.likeSearch(item.Name, self.searchForm.projectName)
        return isAccord
      })
      // 改变总页数
      self.pageTotal = self.searchTableData.length
      // 数据分页
      self.paginationTableData = $utils.pagination(self.searchTableData, self.pageSize, self.currentPage)
    },

    // 新增
    onAddClick() {
      this.currentRowData = {
        parentId: this.menuId,
        MenuType: '',
        Icon: ''
      }
      this.isAddDialogVisible = true
    },
    // EditDialog "新增"组件新增按钮回调
    onInsertRowData() {
      this.handleRefresh()
    },

    // 修改
    onEditClick(rowData, index) {
      this.currentRowData = rowData
      this.currentRowIndex = index
      this.isEditDialogVisible = true
    },
    // EditDialog "编辑"组件新增按钮回调
    onUpdateRowData() {
      this.handleRefresh()
    },

    // 删除
    onDelClick(id) {
      this.$confirm('是否删除该记录？', '提示', { cancelButtonClass: 'el-button--cancel', closeOnClickModal: false })
        .then(() => {
          this.$apis.sysMenu
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

    // 名称点击事件
    onLinkClick(id, name) {
      const parentPath = this.$route.path
      const path = `/sys/subMenu/${id}`
      this.$router.push(path)
      // 使用用户自定义的子菜单名称，覆盖 /sys/subMenu/:id 路由默认名称（"子菜单设置"）
      this.$store.commit('$vuexSetActiveMenu', { path, title: { ...$utils.titleLang(name, name) } })
      this.$store.commit('$vuexAddHistoryPath', { path, parentPath, title: { ...$utils.titleLang(name, name) } })
    }
  }
}
</script>
<style lang="scss"></style>
