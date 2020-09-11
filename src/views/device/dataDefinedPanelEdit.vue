<!--
 * @Author: jiapeng.Zheng
 * @Date: 2018-12-04 09:43:05
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-04-10 16:00:39
 * @Description: 设备数据定义编辑
 -->
<template>
  <el-row :gutter="10" :class="$style['data-defined']">
    <el-col :xs="24" :sm="24" :md="24" :lg="24" :class="$style['opt-area']">
      <el-input v-model="filterVal" size="small" :class="$style['filter-input']" :placeholder="$t('pleaseEnter')"></el-input>
      <el-button icon="el-icon-plus" type="primary" size="small" @click="onAddClick()">{{ $t('add') }}</el-button>
    </el-col>
    <el-table id="dataDefinedTable" :data="filterData" border height="auto" v-loading="isLoading">
      <el-table-column prop="DataKey" label="输入标识" min-width="120">
        <template v-slot="scope">
          <template v-if="scope.row.isEdit">
            <el-tooltip
              effect="danger"
              placement="top"
              :manual="true"
              v-model="scope.row.validate.DataKey.isValidate"
              :content="`输入标识${scope.row.validate.DataKey.validateMsg}`"
            >
              <el-input v-model="scope.row.DataKey" @change="inputValidate(scope.row, 'DataKey')"></el-input>
            </el-tooltip>
          </template>
          <template v-else>{{ scope.row.DataKey }}</template>
        </template>
      </el-table-column>

      <el-table-column prop="DisplayKey" label="输出标识" min-width="120">
        <template v-slot="scope">
          <template v-if="scope.row.isEdit">
            <el-tooltip
              effect="danger"
              placement="top"
              :manual="true"
              v-model="scope.row.validate.DisplayKey.isValidate"
              :content="`输出标识${scope.row.validate.DisplayKey.validateMsg}`"
            >
              <el-input v-model="scope.row.DisplayKey" @change="inputValidate(scope.row, 'DisplayKey')"></el-input>
            </el-tooltip>
          </template>
          <template v-else>{{ scope.row.DisplayKey }}</template>
        </template>
      </el-table-column>

      <el-table-column prop="DataName" label="数据名称" min-width="150">
        <template v-slot="scope">
          <template v-if="scope.row.isEdit">
            <el-tooltip
              effect="danger"
              placement="top"
              :manual="true"
              v-model="scope.row.validate.DataName.isValidate"
              :content="`数据名称${scope.row.validate.DataName.validateMsg}`"
            >
              <el-input v-model="scope.row.DataName" @change="inputValidate(scope.row, 'DataName')"></el-input>
            </el-tooltip>
          </template>
          <template v-else>{{ scope.row.DataName }}</template>
        </template>
      </el-table-column>

      <el-table-column prop="DataType" label="数据类型" min-width="120">
        <template v-slot="scope">
          <template v-if="scope.row.isEdit">
            <el-tooltip
              effect="danger"
              placement="top"
              :manual="true"
              v-model="scope.row.validate.DataType.isValidate"
              :content="`数据类型${scope.row.validate.DataType.validateMsg}`"
            >
              <el-select v-model="scope.row.DataType" placeholder="请选择数据类型" filterable @change="onDataTypeChange(scope.row)">
                <el-option v-for="(value, key) in dataTypeDic" :key="key" :label="value" :value="key" :disabled="dataTypeConfig[key].disabled"></el-option>
              </el-select>
            </el-tooltip>
          </template>
          <template v-else>{{ dataTypeDic[scope.row.DataType] }}</template>
        </template>
      </el-table-column>
      <el-table-column prop="AutoControl" label="手自动" min-width="120">
        <template v-slot="scope">
          <template v-if="scope.row.isEdit">
            <el-tooltip
              effect="danger"
              placement="top"
              :manual="true"
              v-model="scope.row.validate.AutoControl.isValidate"
              :content="`手自动${scope.row.validate.AutoControl.validateMsg}`"
            >
              <el-select v-model="scope.row.AutoControl" placeholder="请选择手自动">
                <el-option label="true" :value="true"></el-option>
                <el-option label="false" :value="false"></el-option>
              </el-select>
            </el-tooltip>
          </template>
          <template v-else>{{ scope.row.AutoControl }}</template>
        </template>
      </el-table-column>
      <el-table-column prop="Unit" label="单位" min-width="100" width="100">
        <template v-slot="scope">
          <!-- v-if="dataTypeConfig[fillForm.DataType].hasUnit" -->
          <template v-if="scope.row.isEdit && dataTypeConfig[scope.row.DataType].hasUnit">
            <el-tooltip effect="danger" placement="top" :manual="true" v-model="scope.row.validate.Unit.isValidate" :content="`单位${scope.row.validate.Unit.validateMsg}`">
              <el-cascader
                v-model="scope.row.Unit"
                placeholder="单位"
                filterable
                :show-all-levels="false"
                :props="unitCascaderProps"
                :options="dataTypeUnitConfig"
                @change="
                  val => {
                    onUnitChange(val, scope.row)
                  }
                "
              ></el-cascader>
            </el-tooltip>
          </template>
          <template v-else>{{ scope.row.Unit | unitFilter }}</template>
        </template>
      </el-table-column>
      <el-table-column prop="Format" label="数据转换" min-width="200">
        <template v-slot="scope">
          <template v-if="scope.row.isEdit">
            <el-tooltip effect="danger" placement="top" :manual="true" v-model="scope.row.validate.Format.isValidate" :content="`数据转换${scope.row.validate.Format.validateMsg}`">
              <el-input v-model="scope.row.Format"></el-input>
            </el-tooltip>
          </template>
          <template v-else>{{ scope.row.Format }}</template>
        </template>
      </el-table-column>

      <el-table-column prop="DefaultValue" label="默认值" min-width="100" width="100">
        <template v-slot="scope">
          <template v-if="scope.row.isEdit">
            <el-tooltip
              effect="danger"
              placement="top"
              :manual="true"
              v-model="scope.row.validate.DefaultValue.isValidate"
              :content="`默认值${scope.row.validate.DefaultValue.validateMsg}`"
            >
              <el-input v-model="scope.row.DefaultValue"></el-input>
            </el-tooltip>
          </template>
          <template v-else>{{ scope.row.DefaultValue }}</template>
        </template>
      </el-table-column>

      <el-table-column label="操作" min-width="150">
        <template v-slot="scope">
          <template v-if="scope.row.isEdit">
            <el-button @click="onSaveClick(scope.row, scope.$index)" type="success" size="small">{{ $t('save') }}</el-button>
            <template v-if="scope.row.isSave">
              <el-button @click="onDelClick(scope.row.Id, scope.row.DeviceSn, scope.$index)" type="danger" size="small">{{ $t('delete') }}</el-button>
            </template>
            <template v-else>
              <el-button @click="onAddDelClick(scope.$index)" type="danger" size="small">{{ $t('delete') }}</el-button>
            </template>
          </template>
          <template v-else>
            <el-button @click="onEditClick(scope.row, scope.$index)" type="primary" size="small">{{ $t('edit') }}</el-button>
            <el-button @click="onDelClick(scope.row.Id, scope.row.DeviceSn, scope.$index)" type="danger" size="small">{{ $t('delete') }}</el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>
  </el-row>
</template>
<script>
import { DATA_TYPE_DIC } from '@constants/dictionaries'
import { DATA_TYPE_BOOLEAN, DATA_TYPE_CONFIG, DATA_TYPE_UNIT_CONFIG } from '@constants/dataTypeConfig'
import { $utils } from '@helper'

let _this

export default {
  name: 'device-dataDefined-panel-edit',

  props: {
    deviceSn: {
      type: String,
      required: true,
      default: ''
    },
    dataDefinedPanelObj: {
      type: Object,
      required: true,
      default() {
        return {}
      }
    }
  },

  data() {
    return {
      // deviceSn: '',
      isLoading: false,
      filterVal: '', // 筛选值
      baseData: [],
      dataTypeDic: DATA_TYPE_DIC,
      dataTypeUnitConfig: DATA_TYPE_UNIT_CONFIG,
      dataTypeConfig: DATA_TYPE_CONFIG,
      unitCascaderProps: {
        children: 'children',
        label: 'label',
        value: 'value'
      },
      validate: {
        DataKey: {
          isValidate: false,
          validateMsg: ''
        },
        DisplayKey: {
          isValidate: false,
          validateMsg: ''
        },
        DataName: {
          isValidate: false,
          validateMsg: ''
        },
        DataType: {
          isValidate: false,
          validateMsg: ''
        },
        AutoControl: {
          isValidate: false,
          validateMsg: ''
        },
        Unit: {
          isValidate: false,
          validateMsg: ''
        },
        DefaultValue: {
          isValidate: false,
          validateMsg: ''
        },
        Format: {
          isValidate: false,
          validateMsg: ''
        }
      }
    }
  },

  computed: {
    filterData() {
      return this.baseData.filter(ele => {
        return ele.DataKey.indexOf(this.filterVal) > -1 || ele.DisplayKey.indexOf(this.filterVal) > -1 || ele.DataName.indexOf(this.filterVal) > -1
      })
    }
  },
  filters: {
    unitFilter(value) {
      const valueArray = $utils.getCascaderObj(value, _this.dataTypeUnitConfig, _this.unitCascaderProps)
      const result = valueArray[valueArray.length - 1] ? valueArray[valueArray.length - 1].label : ''
      return result
    }
  },
  watch: {},

  created() {
    _this = this
    this.handRefresh()
  },

  methods: {
    // -----------------Refresh--------------------
    handRefresh() {
      this.baseData = []
      this.isLoading = true
      this.$apis.deviceDataDefine
        .getDeviceDataDefine(this.deviceSn)
        .then(result => {
          this.isLoading = false
          result.list.forEach(item => {
            this.baseData.push({
              ...item,
              Unit: $utils.isJsonString(item.Unit) ? JSON.parse(item.Unit) : [`${item.Unit}`],
              // isEdit用来显示不同的操作按钮以及控制表格编辑框的显示:
              // true  表示该数据准备修改（启用编辑框、显示保存按钮、删除按钮结合isEdit进行功能切换：若isSave为true切换为服务端删除onDelClick，为false切换为客户端删除onAddDelClick）;
              // false 表示该数据已经修改完毕且更新成功（禁用编辑框、显示编辑按钮、删除按钮功能切换为服务端删除onDelClick）;
              isEdit: false,
              // isSave用来区分调用保存Or新增接口:
              // ture  表示该数据来源于服务器,调用保存接口;
              // false 表示该数据来源于手动添加且还未保存到服务器，调用新增接口;
              isSave: true,
              validate: this.$_.cloneDeep(this.validate)
            })
          })
        })
        .catch(errMsg => {
          this.isLoading = false
          this.$message.error(errMsg)
          console.error(errMsg)
        })
    },
    // 当前数据发生了变化
    onDataChange() {
      this.$store.commit('deviceConfig/setIsChange', true)
    },
    // -----------------validate--------------------
    tooltipShow(rowData, modelName, msg) {
      rowData.validate[modelName].isValidate = true
      rowData.validate[modelName].validateMsg = msg
    },
    tooltipHide(rowData, modelName) {
      rowData.validate[modelName].isValidate = false
    },
    inputValidate(rowData, modelName) {
      const inputValue = rowData[modelName]
      let isValidate = false
      if (!inputValue) {
        this.tooltipShow(rowData, modelName, '不能为空')
      } else if (inputValue.length > 100) {
        this.tooltipShow(rowData, modelName, '不能大于100字符') // 字符长度的验证必须与 deviceControllerPanelEdit.vue 一致
      } else {
        this.tooltipHide(rowData, modelName)
        isValidate = true
      }
      return isValidate
    },
    rowDataValidate(rowData) {
      let isValidate = false
      // let { DataKey, DataName, DefaultValue, Unit, DataType } = rowData
      // this.$refs[`DataNametooltip${index}`].disabled = true
      if (
        this.inputValidate(rowData, 'DataKey') &&
        this.inputValidate(rowData, 'DataName') &&
        this.inputValidate(rowData, 'DataType') &&
        this.inputValidate(rowData, 'Unit')
        // this.inputValidate(rowData, 'DefaultValue')
      ) {
        isValidate = true
      }
      return isValidate
    },
    // -----------------on click event--------------------
    onDataTypeChange(rowData) {
      const { DataType } = rowData
      const { componentDataValue, hasUnit } = this.dataTypeConfig[DataType]
      rowData['Unit'] = hasUnit ? rowData['Unit'] : ['-']
      rowData['Format'] = componentDataValue
    },
    onUnitChange(val, rowData) {
      const valArray = $utils.getCascaderObj(val, this.dataTypeUnitConfig, this.unitCascaderProps)
      rowData['Format'] = JSON.stringify(valArray[valArray.length - 1].format)
    },
    // 新增数据
    onAddClick() {
      this.filterVal = ''
      this.baseData.unshift({
        Id: '',
        DeviceSn: this.deviceSn,
        DataKey: '',
        DisplayKey: '',
        DataName: '',
        DataType: DATA_TYPE_BOOLEAN,
        AutoControl: false,
        Unit: ['-'],
        DefaultValue: '',
        Format: '',
        PanelId: this.dataDefinedPanelObj.Id,
        isEdit: true,
        isSave: false,
        validate: this.$_.cloneDeep(this.validate)
      })
      document.querySelector('#dataDefinedTable .el-table__body-wrapper').scrollTop = 0
    },
    // 编辑数据已经保存的数据
    onEditClick(rowData) {
      rowData.isEdit = true
    },
    // 保存刚刚新增的数据
    onSaveClick(rowData, index) {
      // 拷贝要保存的数据，并把 Unit 转换为字符串
      const data = JSON.parse(JSON.stringify(rowData))
      data.Unit = JSON.stringify(data.Unit)

      const { isSave } = rowData
      if (this.rowDataValidate(rowData, index)) {
        if (isSave) {
          // 更新
          this.$apis.deviceDataDefine
            .updateDeviceDataDefine(data)
            .then(result => {
              this.$message.success(result.message)
              this.onDataChange()
              rowData.isEdit = false
            })
            .catch(errMsg => {
              this.$message.error(errMsg)
              console.error(errMsg)
            })
        } else {
          // 新增
          this.$apis.deviceDataDefine
            .deviceDataDefineAdd(data)
            .then(result => {
              this.$message.success(result.message)
              this.onDataChange()
              rowData.isEdit = false // 禁止编辑
              rowData.isSave = true // 已经保存
              rowData.Id = result.Id // 设置id
            })
            .catch(errMsg => {
              this.$message.error(errMsg)
              console.error(errMsg)
            })
        }
      }
    },
    // 删除刚刚新增但未保存的数据
    onAddDelClick(index) {
      this.$delete(this.baseData, index)
    },
    // 删除已经保存的数据
    onDelClick(id, deviceSn, index) {
      this.$confirm('是否删除该数据？', '提示', { cancelButtonClass: 'el-button--cancel', closeOnClickModal: false })
        .then(() => {
          this.$apis.deviceDataDefine
            .deleteDeviceDataDefine(id, deviceSn)
            .then(result => {
              this.$message.success(result.message)
              this.$delete(this.baseData, index)
              this.onDataChange()
            })
            .catch(errMsg => {
              this.$message.error(errMsg)
            })
        })
        .catch(err => {
          console.log(err)
          this.$message.warning('取消删除')
        })
    }
  }
}
</script>
<style type="text/css" lang="scss" module>
.data-defined {
  display: flex;
  flex-direction: column;
  .opt-area {
    text-align: right;
    .filter-input {
      width: 200px;
      margin-right: 1em;
    }
  }
}
</style>
