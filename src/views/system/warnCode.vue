<!--
 * @Author: jiapeng.Zheng
 * @Date: 2018-09-10 09:39:09
 * @LastEditors: jiapeng.Zheng
 * @LastEditTime: 2019-09-06 16:59:15
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
              <el-input placeholder="请输入报警编码" v-model="searchForm.Code">
                <template slot="prepend">
                  报警编码
                </template>
              </el-input>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6">
              <el-select v-model="searchForm.typeId" placeholder="请选择报警类型" filterable clearable>
                <el-option v-for="(item, key) in $commonParam.warnTypes" :key="key" :label="item.TypeName" :value="item.Id"> </el-option>
              </el-select>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="8">
              <el-button type="primary" icon="search" @click="handleRefresh()">{{ $t('search') }}</el-button>
              <el-button type="primary" icon="plus" @click="onAddClick()">{{ $t('add') }}</el-button>
              <!-- <el-button type="primary" @click="handleRefresh()"><icon name="sync"></icon>{{ $t('refresh') }}</el-button> -->
            </el-col>
          </el-row>
        </el-card>
        <el-card v-loading.body="loading">
          <el-table :data="tableData" border>
            <el-table-column type="index" width="80"></el-table-column>
            <el-table-column prop="Code" label="报警编码" min-width="150"></el-table-column>
            <el-table-column prop="TypeName" label="报警类型" min-width="150"></el-table-column>
            <el-table-column prop="Description" label="编码描述" min-width="150"></el-table-column>
            <el-table-column label="操作" min-width="250">
              <template v-slot="scope">
                <el-button @click="onEditClick(scope.row, scope.$index)" type="primary" size="small">编辑</el-button>
                <el-button @click="onDelClick(scope.row.Code)" type="danger" size="small">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="table-operate">
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="searchForm.pageNo"
              :page-sizes="pageSizes"
              :page-size="searchForm.pageSize"
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
          <el-form-item label="报警编码" prop="Code">
            <el-input v-model="currentRowData.Code" :disabled="isEdit"></el-input>
          </el-form-item>
        </div>
        <div class="form-group col-sm-11">
          <el-form-item label="报警类型" prop="WarnTypeId">
            <el-select v-model="currentRowData.WarnTypeId" placeholder="请选择报警类型" filterable clearable>
              <el-option v-for="(item, key) in $commonParam.warnTypes" :key="key" :label="item.TypeName" :value="item.Id"> </el-option>
            </el-select>
          </el-form-item>
        </div>
        <div class="form-group col-sm-11">
          <el-form-item label="编码描述" prop="Description">
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
// import { $utils } from '@helper'

export default {
  name: 'warn-code',

  props: {},

  data() {
    return {
      defaultMenuType: 0, // 导航菜单的类型id
      loading: true,
      pageTotal: 0, // 总页数
      pageSizes: [10, 20, 30], // 每页显示个数选择器的选项设置
      tableData: [], // 表单原始数据
      searchForm: {
        pageSize: 0, // 每页显示个数
        pageNo: 1, // 当前第几页
        sortData: 'Code',
        sortType: 'desc',
        Code: '',
        typeId: ''
      },
      currentRowData: {},
      currentRowIndex: -1,
      isVisible: false,
      EditDialogTitle: '',
      isEdit: false,
      rules: {
        Code: [
          {
            required: true,
            message: '请输入报警编码',
            trigger: 'blur'
          },
          {
            min: 1,
            max: 10,
            message: '长度在 1 到 10 个字符',
            trigger: 'blur'
          }
        ],
        WarnTypeId: [
          {
            type: 'number',
            required: true,
            message: '请选择报警类型',
            trigger: 'blur'
          }
        ],
        Description: [
          {
            required: true,
            message: '请输入编码描述',
            trigger: 'blur'
          },
          {
            min: 1,
            max: 100,
            message: '长度在 1 到 100 个字符',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  computed: {},

  components: {},

  watch: {},

  async created() {
    this.searchForm.pageSize = this.pageSizes[0]
    this.handleRefresh()
  },

  filters: {},

  methods: {
    /* ----------------------------pagination Event---------------------------- */

    // 每页显示条目个数改变时
    handleSizeChange(val) {
      this.searchForm.pageSize = val
      this.handleRefresh()
    },
    // 页码改变时的事件
    handleCurrentChange(val) {
      this.searchForm.pageNo = val
      this.handleRefresh()
    },
    /* ----------------------------refresh---------------------------- */
    // 表单刷新
    handleRefresh() {
      this.loading = true
      this.$apis.warn
        .getPageWarnCode(this.searchForm)
        .then(result => {
          this.tableData = result.WarnCodes
          this.pageTotal = result.DataCount
        })
        .catch(errMsg => {
          this.$message.error(errMsg)
          console.error(errMsg)
        })
        .fin(() => {
          this.loading = false
        })
    },
    /* ----------------------------On Click Event---------------------------- */

    // 新增
    onAddClick() {
      this.currentRowData = {
        Code: '',
        WarnTypeId: '',
        Description: ''
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
            .warnCodeSave(this.currentRowData)
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
            .warnCodeAdd(this.currentRowData)
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
    onDelClick(code) {
      this.$confirm('是否删除该记录？', '提示', { cancelButtonClass: 'el-button--cancel', closeOnClickModal: false })
        .then(() => {
          this.$apis.warn
            .warnCodeRemove(code)
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

    onClose() {
      this.isVisible = false
      // this.$emit('input', this.isVisible)
    }
  }
}
</script>
<style lang="scss"></style>
