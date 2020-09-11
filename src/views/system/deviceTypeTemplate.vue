<!--
 * @Author: jiapeng.Zheng
 * @Date: 2018-12-14 17:38:07
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-31 16:30:31
 * @Description: 设备类型模板
 -->
<template>
  <el-card class="box-card">
    <div slot="header" class="clearfix">
      <span style="font-weight:bold">{{ activeNode.data.DeviceTypeName }} /</span>
      <span>{{ $t('template') }}</span>
    </div>
    <el-form class="form-group" :inline="true" v-if="activeNode.data.Id">
      <!--
      <el-form-item>
        <el-input placeholder="输入模板名称" v-model="searchForm.TempName">
          <template slot="prepend">模板名称</template>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-select v-model="searchForm.IsStandard" clearable placeholder="请选择模板类型">
          <el-option v-for="(value, key) in device_template_dic"
              :key="key"
              :label="value"
              :value="key">
            </el-option>
        </el-select>
      </el-form-item>
      <el-form-item><el-button type="primary" icon="search" @click="handleRefresh()">{{ $t('search') }}</el-button></el-form-item>
      -->
      <el-form-item>
        <el-button type="primary" icon="plus" @click="onAddClick()">{{ $t('add') }}</el-button>
      </el-form-item>
    </el-form>
    <el-table
      class="type-tpl-table"
      :data="tableData"
      v-loading="loading"
      :highlight-current-row="true"
      border
      @sort-change="sortChange"
      @current-change="tableCurrentChange"
      ref="tplTable"
    >
      <el-table-column type="index" width="80"></el-table-column>
      <!-- <el-table-column sortable="custom" prop="TypeId" label="TypeId"  min-width="110"></el-table-column> -->
      <el-table-column sortable="custom" prop="TempName" label="模板名称" min-width="200"></el-table-column>
      <el-table-column sortable="custom" prop="IsStandard" label="标准" min-width="100" width="100">
        <template v-slot="scope">{{ device_template_dic[scope.row.IsStandard] }}</template>
      </el-table-column>
      <el-table-column label="操作" min-width="150" width="150">
        <template v-slot="scope">
          <el-button @click="onEditClick(scope.row)" type="primary" size="small">{{ $t('edit') }}</el-button>
          <el-button @click="onDelClick(scope.row.Id)" type="danger" size="small">{{ $t('delete') }}</el-button>
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
      ></el-pagination>
    </div>

    <el-dialog :visible="isDialogVisible" width="30%" @close="isDialogVisible = false" class="edit-dialog" :close-on-click-modal="false" :show-close="false">
      <span slot="title" class="el-dialog__title">
        【{{ activeNode.data.DeviceTypeName }}】 <span>{{ isAdd ? $t('adds') : $t('edits') }}</span
        >设备类型模板
      </span>
      <el-form :model="fillForm" :rules="rules" ref="fillForm">
        <div class="form-group col-sm-11">
          <el-form-item label="模板名称" prop="TempName">
            <el-input v-model="fillForm.TempName"></el-input>
          </el-form-item>

          <el-form-item label="标准模板" prop="IsStandard" v-if="isAdd">
            <el-radio-group v-model="fillForm.IsStandard">
              <el-radio v-for="(value, key) in device_template_dic" :label="key" :key="key">{{ value }}</el-radio>
            </el-radio-group>
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
// import { $utils } from '@helper'
import { DEVICE_TEMPLATE_DIC } from '@constants/dictionaries'

export default {
  name: 'device-type-template',

  props: {
    activeNode: {
      required: true
    },
    activeTpl: {
      required: true
    }
  },

  data() {
    return {
      loading: false,
      isDialogVisible: false,
      isAdd: true,
      device_template_dic: DEVICE_TEMPLATE_DIC,
      fillForm: {
        TempName: '',
        IsStandard: 'false',
        DeviceSn: '',
        TypeId: ''
      },
      rules: {
        TempName: [
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
        ]
      },
      tableData: [],
      // pageNo: 1, // 当前第几页
      pageTotal: 0, // 总条数
      // pageSize: 10, // 每页显示个数
      pageSizes: [10, 20, 30], // 每页显示个数选择器的选项设置
      searchForm: {
        sortData: 'Id',
        sortType: 'asc',
        TempName: '',
        IsStandard: '',
        pageSize: 0, // 每页显示个数
        pageNo: 1, // 当前第几页
        TypeId: ''
      }
    }
  },
  computed: {},

  watch: {
    // activeNode(newVal) {
    //   this.searchForm.TypeId = newVal.data.Id
    //   this.fillForm.TypeId = newVal.data.Id
    //   this.handleRefresh()
    // }
    'activeNode.data'(newVal) {
      this.searchForm.TypeId = newVal.Id
      this.fillForm.TypeId = newVal.Id
      this.handleRefresh()
    }
  },

  components: {},

  created() {
    this.searchForm.pageSize = this.pageSizes[0]
  },

  filters: {},

  methods: {
    /* ----------------------------refresh---------------------------- */
    // 表单刷新
    handleRefresh() {
      this.loading = true
      this.tableData = []
      if (this.searchForm.TypeId) {
        this.$apis.deviceType
          .getDeviceTypeTemplatePage(this.searchForm)
          .then(result => {
            this.tableData = result.List
            this.pageTotal = result.DataCount
            this.$nextTick(() => {
              this.tableData.forEach(element => {
                if (this.activeTpl.Id === element.Id) {
                  // 选中对应的行,成功后会自动调用 tableCurrentChange 事件
                  this.$refs.tplTable.setCurrentRow(element)
                }
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
    // 当表格的当前行发生变化的时候会触发该事件
    tableCurrentChange(val) {
      if (val) {
        this.$emit('tplClick', val)
      }
    },
    // 排序
    sortChange({ prop, order }) {
      if (!this.$_.isNull(order) && !this.$_.isNull(prop)) {
        this.searchForm.sortData = prop
        this.searchForm.sortType = order.replace('ending', '')
        this.handleRefresh()
      }
    },

    // 每页显示条目个数改变时
    handleSizeChange(val) {
      // console.log(`每页 ${val} 条`)
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
      this.$refs.fillForm.validate(valid => {
        if (!valid) return
        if (this.isAdd) {
          // 新增
          this.$apis.deviceType
            .typeTemplateAdd(this.fillForm)
            .then(result => {
              this.$message.success(result.message)
              this.isDialogVisible = false
              this.handleRefresh()
            })
            .catch(errMsg => {
              this.$message.error(errMsg)
              console.error(errMsg)
            })
        } else {
          // 编辑
          this.$apis.deviceType
            .typeTemplateModify(this.fillForm)
            .then(result => {
              this.$message.success(result.message)
              this.isDialogVisible = false
              this.handleRefresh()
            })
            .catch(errMsg => {
              this.$message.error(errMsg)
              console.error(errMsg)
            })
        }
      })
    },
    // 新增
    onAddClick() {
      this.isAdd = true
      this.isDialogVisible = true
      this.fillForm.TempName = ''
      this.fillForm.IsStandard = 'false'
    },
    // 编辑
    onEditClick(rowData) {
      this.isAdd = false
      this.isDialogVisible = true
      this.fillForm = JSON.parse(JSON.stringify(rowData))
    },
    // 删除模板
    onDelClick(TempId) {
      this.$confirm('是否删除该记录？', '提示', { cancelButtonClass: 'el-button--cancel', closeOnClickModal: false })
        .then(() => {
          this.$apis.deviceType
            .deviceTypeTemplateRemove(TempId)
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
<style lang="scss">
.type-tpl-table {
  .el-table__row {
    cursor: pointer;
  }
}
</style>
