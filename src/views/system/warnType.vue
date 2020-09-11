<!--
 * @Author: jiapeng.Zheng
 * @Date: 2018-09-10 09:39:09
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-31 13:40:25
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
            <el-col :xs="24" :sm="12" :md="12" :lg="6">
              <el-input placeholder="请输入报警类型" v-model="searchForm.TypeName">
                <template slot="prepend">
                  报警类型
                </template>
              </el-input>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="8">
              <el-button type="primary" icon="search" @click="handleRefresh()">{{ $t('search') }}</el-button>
              <el-button type="primary" icon="plus" @click="onAddClick()">{{ $t('add') }}</el-button>
              <!-- <el-button type="primary" @click="handleRefresh()"><icon name="sync"></icon>{{ $t('refresh') }}</el-button> -->
            </el-col>
          </el-row>
        </el-card>
        <el-card v-loading.body="loading">
          <el-table :data="paginationTableData" border>
            <el-table-column type="index" width="80"></el-table-column>
            <el-table-column prop="Id" label="类型代码" min-width="150"></el-table-column>
            <el-table-column prop="TypeName" label="报警类型" min-width="150">
              <template v-slot="scope">
                <icon class="icons" :name="scope.row.Icon" :style="`fill:${scope.row.Color}`"></icon>
                <span :style="`color:${scope.row.Color}`">{{ scope.row.TypeName }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" min-width="150">
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

    <el-dialog :visible="isVisible" width="30%" @close="onClose" class="edit-dialog" :close-on-click-modal="false" :show-close="false">
      <span slot="title" class="el-dialog__title">{{ EditDialogTitle }}</span>
      <el-form :model="currentRowData" :rules="rules" ref="fillForm" onsubmit="return false;">
        <div class="form-group col-sm-11">
          <el-form-item label="报警图标" prop="Icon">
            <el-popover ref="popoverIcon" placement="right" width="300" trigger="hover">
              <icon-list type="notice" @iconClick="iconClick"></icon-list>
            </el-popover>
            <icon v-popover:popoverIcon class="input-icon icons" :name="currentRowData.Icon" :style="`fill:${currentRowData.Color}`"></icon>
          </el-form-item>
        </div>
        <div class="form-group col-sm-11">
          <el-form-item label="报警颜色" prop="Color">
            <el-color-picker
              v-model="currentRowData.Color"
              color-format="hex"
              @active-change="
                color => {
                  currentRowData.Color = color
                }
              "
            ></el-color-picker>
          </el-form-item>
        </div>
        <div class="form-group col-sm-11">
          <el-form-item label="类型名称" prop="TypeName">
            <el-input v-model="currentRowData.TypeName"></el-input>
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
import { $utils } from '@helper'

let self

export default {
  name: 'warn-type',

  props: {},

  data() {
    return {
      defaultMenuType: 0, // 导航菜单的类型id
      loading: true,
      currentPage: 1, // 当前第几页
      pageTotal: 0, // 总条数
      pageSize: 0, // 每页显示个数
      pageSizes: [10, 20, 30], // 每页显示个数选择器的选项设置
      tableData: [], // 表单原始数据
      paginationTableData: [], // 对searchTableData进行分页后获得的数据
      searchTableData: [], // 对tableData进行筛选后获得的数据
      searchForm: {
        TypeName: ''
      },
      currentRowData: {},
      currentRowIndex: -1,
      isVisible: false,
      EditDialogTitle: '',
      isEdit: false,
      rules: {
        TypeName: [
          {
            required: true,
            message: '请输入报警类型',
            trigger: 'blur'
          },
          {
            min: 1,
            max: 10,
            message: '长度在 1 到 10 个字符',
            trigger: 'blur'
          }
        ],

        Color: [
          {
            required: true,
            message: '请选择报警颜色',
            trigger: 'blur'
          }
        ],
        Icon: [
          {
            required: true,
            message: '请选择报警图标',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  computed: {},

  components: {
    IconList: resolve => require.ensure([], () => resolve(require('@views/common/IconList')), 'iconList')
  },

  watch: {},

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
      this.loading = true

      this.$store
        .dispatch('getWarnType')
        .then(result => {
          this.tableData = result.WarnTypes
          this.onSearchClick()
        })
        .catch(errMsg => {
          this.$message.error(errMsg)
          console.error(errMsg)
        })
        .finally(() => {
          this.loading = false
        })
    },
    /* ----------------------------On Click Event---------------------------- */
    // 搜索
    onSearchClick() {
      // this.searchForm.startDate = $utils.dayConvert(this.searchForm.startDate)
      // this.searchForm.endDate = $utils.dayConvert(this.searchForm.endDate)
      // 数据筛选
      self.searchTableData = self.tableData.filter(item => {
        return $utils.likeSearch(item.TypeName, self.searchForm.TypeName)
      })
      // 改变总页数
      self.pageTotal = self.searchTableData.length
      // 数据分页
      self.paginationTableData = $utils.pagination(self.searchTableData, self.pageSize, self.currentPage)
    },

    // 新增
    onAddClick() {
      this.currentRowData = {
        TypeName: '',
        Icon: 'notice/malfunction',
        Color: '#ff4949' // '#20a0ff'、'#ff4949'、'#f7ba2a'
      }
      this.EditDialogTitle = this.$t('add')
      this.isVisible = true
      this.isEdit = false
    },

    // 修改
    onEditClick(rowData, index) {
      this.currentRowData = JSON.parse(JSON.stringify(rowData))
      this.currentRowIndex = index
      this.EditDialogTitle = this.$t('edit')
      this.isVisible = true
      this.isEdit = true
    },

    // EditDialog "新增"组件新增按钮回调
    onSureClick() {
      this.$refs.fillForm.validate(valid => {
        if (!valid) return
        if (this.isEdit) {
          this.$apis.warn
            .saveWarnType(this.currentRowData)
            .then(result => {
              this.$message.success(result.message)
              this.handleRefresh()
              this.isVisible = false
            })
            .catch(errMsg => {
              this.$message.error(errMsg)
              console.error(errMsg)
            })
        } else {
          this.$apis.warn
            .addWarnType(this.currentRowData)
            .then(result => {
              this.$message.success(result.message)
              this.handleRefresh()
              this.isVisible = false
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
          this.$apis.warn
            .removeWarnType(id)
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

    // icon报警图标click事件
    iconClick(iconName) {
      this.$refs.popoverIcon.doToggle()
      this.currentRowData.Icon = iconName
    },

    onClose() {
      this.isVisible = false
      // this.$emit('input', this.isVisible)
    }
  }
}
</script>
