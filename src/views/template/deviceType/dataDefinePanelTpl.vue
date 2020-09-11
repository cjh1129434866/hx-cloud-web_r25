<!--
 * @Author: jiapeng.Zheng
 * @Date: 2018-12-04 09:43:05
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-31 16:24:29
 * @Description: 设备类型-模板-面板（数据定义）
 -->
<template>
  <el-card class="box-card">
    <div slot="header" class="clearfix">
      <span style="font-weight:bold">{{ activeNode.data.DeviceTypeName }} / {{ $t('template') }} / {{ activeTpl.TempName }} / {{ $t('panel') }} /</span>
      <span>{{ $t('deviceDataDefine') }}</span>
    </div>
    <el-form class="form-group" :inline="true" v-if="activeTpl.Id">
      <el-form-item>
        <el-input placeholder="输入数据标识" v-model="searchForm.DataKey">
          <template slot="prepend">
            数据标识
          </template>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-input placeholder="输入数据名称" v-model="searchForm.DataName">
          <template slot="prepend">
            数据名称
          </template>
        </el-input>
      </el-form-item>
      <el-form-item
        ><el-button type="primary" icon="search" @click="handleRefresh()">{{ $t('search') }}</el-button></el-form-item
      >
      <el-form-item
        ><el-button type="primary" icon="plus" @click="onAddClick()">{{ $t('add') }}</el-button></el-form-item
      >
      <!-- <el-form-item>
        <el-button type="primary" icon="plus" @click="onAddAllClick()">{{ $t('addAll') }}</el-button>
      </el-form-item> -->
    </el-form>
    <el-table :data="tableData" v-loading="loading" border @sort-change="sortChange">
      <el-table-column prop="DataKey" label="输入标识" min-width="100" width="100"></el-table-column>
      <el-table-column prop="DisplayKey" label="输出标识" min-width="100" width="100"></el-table-column>
      <el-table-column prop="DataName" label="数据名称" min-width="200"></el-table-column>
      <el-table-column prop="DataType" label="数据类型" min-width="100" width="100">
        <template v-slot="scope">{{ dataTypeDic[scope.row.DataType] }}</template>
      </el-table-column>
      <el-table-column prop="AutoControl" label="手自动" width="100">
        <template v-slot="scope">
          <el-popover trigger="hover" placement="top">
            <p v-if="scope.row.AutoControl">该数据定义自动模式下允许操作</p>
            <p v-else>该数据定义自动模式下不允许操作</p>
            <div slot="reference">
              {{ scope.row.AutoControl }}
            </div>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column prop="Unit" label="单位符号" min-width="100" width="100">
        <template v-slot="scope">{{ scope.row.Unit | unitFilter }}</template>
      </el-table-column>
      <el-table-column prop="DefaultValue" label="默认值" min-width="100" width="100"></el-table-column>
      <el-table-column prop="Format" label="数据转换" min-width="100"></el-table-column>
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
        【{{ activeTpl.TempName }}】 <span>{{ isAdd ? $t('adds') : $t('edits') }}</span
        >数据定义
      </span>
      <el-form :model="fillForm" :rules="rules" ref="fillForm">
        <div class="form-group col-sm-11">
          <el-form-item label="输入标识" prop="DataKey">
            <el-input v-model="fillForm.DataKey"></el-input>
          </el-form-item>
          <el-form-item label="输出标识" prop="DisplayKey">
            <el-input v-model="fillForm.DisplayKey"></el-input>
          </el-form-item>
          <el-form-item label="数据名称" prop="DataName">
            <el-input v-model="fillForm.DataName"></el-input>
          </el-form-item>
          <el-form-item label="数据类型" prop="DataType">
            <el-select v-model="fillForm.DataType" placeholder="请选择数据类型" filterable clearable @change="onDataTypeChange(fillForm)">
              <el-option v-for="(value, key) in dataTypeDic" :key="key" :label="value" :value="key" :disabled="dataTypeConfig[key].disabled"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="手自动" prop="AutoControl">
            <el-radio-group v-model="fillForm.AutoControl">
              <el-radio :label="true">true</el-radio>
              <el-radio :label="false">false</el-radio>
            </el-radio-group>
            <el-tooltip content="用于标识该数据定义受不受手自动的影响(true：自动模式下允许操作；false：自动模式下不允许操作)" placement="top">
              <icon class="url-tips" name="help"></icon>
            </el-tooltip>
          </el-form-item>
          <el-form-item v-if="dataTypeConfig[fillForm.DataType].hasUnit" label="单位符号" prop="Unit">
            <!-- <el-input v-model="fillForm.Unit"></el-input> -->
            <el-cascader
              v-model="fillForm.Unit"
              placeholder="单位符号"
              filterable
              :show-all-levels="false"
              :props="unitCascaderProps"
              :options="dataTypeUnitConfig"
              @change="
                val => {
                  onUnitChange(val, fillForm)
                }
              "
            ></el-cascader>
          </el-form-item>
          <el-form-item label="默认值" prop="DefaultValue">
            <el-input v-model="fillForm.DefaultValue"></el-input>
          </el-form-item>
          <el-form-item label="数据转换" prop="Format">
            <el-input v-model="fillForm.Format"></el-input>
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
import { DATA_TYPE_DIC } from '@constants/dictionaries'
import { DATA_TYPE_BOOLEAN, DATA_TYPE_CONFIG, DATA_TYPE_UNIT_CONFIG } from '@constants/dataTypeConfig'
import { $utils } from '@helper'

let self

export default {
  name: 'data-define-tpl',

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
      dataTypeDic: DATA_TYPE_DIC,
      dataTypeConfig: DATA_TYPE_CONFIG,
      dataTypeUnitConfig: DATA_TYPE_UNIT_CONFIG,
      unitCascaderProps: {
        children: 'children',
        label: 'label',
        value: 'value'
      },
      fillForm: {
        AutoControl: false,
        DataType: DATA_TYPE_BOOLEAN,
        DataKey: '',
        DisplayKey: '',
        DataName: '',
        Unit: ['-'],
        DefaultValue: '',
        Format: '',
        TempId: ''
      },
      rules: {
        DataType: [
          {
            required: true,
            message: '请输入数据类型',
            trigger: 'blur'
          },
          {
            min: 2,
            max: 10,
            message: '长度在 2 到 10 个字符',
            trigger: 'blur'
          }
        ],
        DataKey: [
          {
            required: true,
            message: '请输入数据标识',
            trigger: 'blur'
          },
          {
            min: 2,
            max: 10,
            message: '长度在 2 到 10 个字符',
            trigger: 'blur'
          }
        ],
        DataName: [
          {
            required: true,
            message: '请输入数据名称',
            trigger: 'blur'
          },
          {
            min: 2,
            max: 25,
            message: '长度在 2 到 25 个字符',
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
        pageSize: 0, // 每页显示个数
        pageNo: 1, // 当前第几页
        DataKey: '',
        DataName: '',
        TempId: ''
      }
    }
  },
  computed: {},

  watch: {
    activeTpl(newVal) {
      this.searchForm.TempId = newVal.Id
      this.fillForm.TempId = newVal.Id
      this.handleRefresh()
    }
  },

  components: {},

  created() {
    self = this
    this.searchForm.pageSize = this.pageSizes[0]
  },

  filters: {
    unitFilter: function(value) {
      // let valueObj = $utils.isJsonString(value) ? JSON.parse(value) : [`${value}`]
      const valueArray = $utils.getCascaderObj(value, self.dataTypeUnitConfig, self.unitCascaderProps)
      const result = valueArray[valueArray.length - 1] ? valueArray[valueArray.length - 1].label : ''
      return result
    }
  },

  methods: {
    /* ----------------------------refresh---------------------------- */
    // 表单刷新
    handleRefresh() {
      this.tableData = []
      if (this.searchForm.TempId) {
        this.loading = true
        this.$apis.deviceType
          .getTemplateProfile(this.searchForm)
          .then(result => {
            const tableData = result.List
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

    onDataTypeChange(rowData) {
      const { DataType } = rowData
      if (DataType) {
        const { componentDataValue, hasUnit } = this.dataTypeConfig[DataType]
        rowData['Unit'] = hasUnit ? rowData['Unit'] : ['-']
        rowData['Format'] = componentDataValue || ''
      }
    },

    onUnitChange(val, rowData) {
      const valArray = $utils.getCascaderObj(val, this.dataTypeUnitConfig, this.unitCascaderProps)
      rowData['Format'] = JSON.stringify(valArray[valArray.length - 1].format)
    },

    // （新增/编辑）确认事件
    onSureClick() {
      const data = JSON.parse(JSON.stringify(this.fillForm))
      data.Unit = JSON.stringify(data.Unit)

      this.$refs.fillForm.validate(valid => {
        if (!valid) return
        if (this.isAdd) {
          // 新增
          this.$apis.deviceType
            .addTemplateProfile(data)
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
            .modifyTemplateProfile(data)
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
      this.fillForm.AutoControl = false
      this.fillForm.DataType = DATA_TYPE_BOOLEAN
      this.fillForm.DataKey = ''
      this.fillForm.DisplayKey = ''
      this.fillForm.DataName = ''
      this.fillForm.Unit = ['-']
      this.fillForm.DefaultValue = ''
      this.fillForm.Format = ''
    },
    // async onAddAllClick() {
    //   let bs15pub = await $ajax.get('/public/testData/贝斯MC4系列PLC气泵版-ALL-191012.xlsx.json')
    //   let sta = {}
    //   ;(async () => {
    //     for (let i in bs15pub) {
    //       let data = bs15pub[i]
    //       try {
    //         await this.$apis.deviceType.addTemplateProfile(data)
    //         console.log(`add bs15pub ${i}`, data.DataKey, 'success')
    //       } catch (error) {
    //         console.error(`add bs15pub ${i}`, data.DataKey, 'error:', error)
    //       }
    //     }
    //   })()
    // },
    // 编辑
    onEditClick(rowData) {
      this.isAdd = false
      this.isDialogVisible = true
      this.fillForm = JSON.parse(JSON.stringify(rowData))
    },
    // 删除
    onDelClick(profileId) {
      this.$confirm('是否删除该记录？', '提示', { cancelButtonClass: 'el-button--cancel', closeOnClickModal: false })
        .then(() => {
          this.$apis.deviceType
            .removeTemplateProfile(this.fillForm.TempId, profileId)
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
<style lang="scss"></style>
