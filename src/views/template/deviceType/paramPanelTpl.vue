<!--
 * @Author: jiapeng.Zheng
 * @Date: 2018-12-04 09:43:05
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-31 16:23:44
 * @Description: 设备配置类型模板
 -->
<template>
  <el-card class="box-card">
    <div slot="header" class="clearfix">
      <span style="font-weight:bold">{{ activeNode.data.DeviceTypeName }} / {{ $t('template') }} / {{ activeTpl.TempName }} / {{ $t('panel') }} /</span>
      <span>{{ $t('deviceParam') }}</span>
      <!-- search from -->
    </div>
    <el-form class="form-group" :inline="true" v-if="activeTpl.Id">
      <el-form-item>
        <el-button type="primary" icon="plus" @click="onAddClick">{{ $t('add') }}</el-button>
      </el-form-item>
    </el-form>
    <!-- table -->
    <el-table :data="argsData" border>
      <el-table-column prop="DataName" label="参数名称"></el-table-column>
      <el-table-column prop="DataType" label="参数类型"></el-table-column>
      <el-table-column prop="DataValue" label="参数值"></el-table-column>
      <el-table-column label="操作" width="150">
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
    <!-- dialog -->
    <el-dialog :visible="isDialogVisible" width="30%" @close="isDialogVisible = false" class="edit-dialog" :close-on-click-modal="false" :show-close="false">
      <span slot="title" class="el-dialog__title">
        【{{ activeTpl.TempName }}】
        <span>{{ isAdd ? $t('adds') : $t('edits') }}{{ $t('deviceParam') }}</span>
      </span>
      <el-form :model="fillForm" :rules="rules" ref="fillForm">
        <div class="form-group col-sm-11">
          <el-form-item label="参数名称" prop="DataName">
            <el-input v-model="fillForm.DataName"></el-input>
          </el-form-item>
          <el-form-item label="参数类型" prop="DataType">
            <el-input disabled v-model="fillForm.DataType"></el-input>
          </el-form-item>
          <el-form-item label="参数值" prop="DataValue">
            <el-input v-model="fillForm.DataValue"></el-input>
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
export default {
  name: 'param-panel-tpl',

  props: {
    activeNode: {
      required: true
    },
    activeTpl: {
      required: true
    },
    activePanel: {
      required: true
    }
  },

  data() {
    return {
      isDialogVisible: false,
      isAdd: true,
      argsData: [],
      fillForm: {
        DataValue: '',
        DataName: '',
        DataType: '字符串'
      },
      rules: {
        DataValue: [
          {
            required: true,
            message: '请输入参数值',
            trigger: 'blur'
          },
          {
            min: 1,
            max: 50,
            message: '长度在 1 到 50 个字符',
            trigger: 'blur'
          }
        ],
        DataName: [
          {
            required: true,
            message: '请输入参数名称',
            trigger: 'blur'
          },
          {
            min: 1,
            max: 50,
            message: '长度在 1 到 50 个字符',
            trigger: 'blur'
          }
        ]
      },
      searchForm: {
        sortData: 'id',
        sortType: 'asc',
        pageSize: 0, // 每页显示个数
        pageNo: 1, // 当前第几页
        DataKey: '',
        DataName: '',
        TempId: ''
      },
      tableData: [],
      pageTotal: 0, // 总条数
      // pageSize: 10, // 每页显示个数
      pageSizes: [10, 20, 30], // 每页显示个数选择器的选项设置
    }
  },

  computed: {},

  watch: {
    'activeNode.data'(newVal) {
      this.searchForm.TempId = newVal.id
      this.fillForm.TempId = newVal.id
      this.handleRefresh()
    },
    activeTpl(newVal) {
      if (newVal.Id) {
        this.argsData = newVal.ArgsData
        // this.handleRefresh()
      }
    }
  },

  methods: {
    // -----------------Refresh--------------------
    handleRefresh() {
      this.tableData = []
      if (this.searchForm.TempId) {
        this.loading = true
        this.$apis.deviceType
          .typeArgument(this.searchForm)
          .then(result => {
            const tableData = result.data
            tableData.forEach(item => {
              this.tableData.push({
                ...item,
                Unit: $utils.isJsonString(item.Unit) ? JSON.parse(item.Unit) : [`${item.Unit}`]
              })
            })

            this.pageTotal = result.DataCount
          })
          .catch(errMsg => {
            this.$message.error(errMsg)
            console.error(errMsg)
          })
          .fin(() => {
            self.loading = false
          })
      }
    },
    // -----------------on click event--------------------
    // 新增数据
    onAddClick() {
      this.fillForm = {
        TemplateId: this.activeTpl.Id,
        Id: '',
        DataValue: '',
        DataName: '',
        DataType: '字符串'
      }
      this.isAdd = true
      this.isDialogVisible = true
      this.$nextTick(() => {
        this.$refs.fillForm.resetFields()
      })
    },
    // 编辑数据
    onEditClick(rowData) {
      this.fillForm = JSON.parse(JSON.stringify(rowData))
      this.isAdd = false
      this.isDialogVisible = true
    },
    // 保存数据
    onSureClick() {
      this.$refs.fillForm.validate(valid => {
        if (!valid) return
        if (this.isAdd) {
          // 新增
          this.$apis.deviceType
            .addTemplateArgs(this.fillForm)
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
            .saveTemplateArgs(this.fillForm)
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
    // 删除已经保存的数据
    onDelClick(id) {
      this.$confirm('是否删除该记录？', '提示', { cancelButtonClass: 'el-button--cancel', closeOnClickModal: false })
        .then(() => {
          this.$apis.deviceType
            .removeTemplateArgs(id)
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
  }
}
</script>
<style type="text/css" lang="scss"></style>
