<!-- 设备配置编辑 -->
<template>
  <div :class="$style['device-config-panel-edit']">
    <el-col :xs="24" :sm="24" :md="24" :lg="24" :class="$style['opt-area']">
      <el-button icon="el-icon-plus" type="primary" size="small" @click="onAddClick()">{{ $t('add') }}</el-button>
    </el-col>
    <el-table id="deviceCofTable" v-loading="isLoading" :data="baseData" border height="auto">
      <el-table-column prop="Category" label="配置类型" min-width="150">
        <template v-slot="scope">
          <!-- 只有设定值（string）有关联数据 -->
          <template v-if="scope.row.isEdit">
            <el-tooltip
              effect="danger"
              placement="top"
              :manual="true"
              v-model="scope.row.validate.Category.isValidate"
              :content="`配置类型${scope.row.validate.Category.validateMsg}`"
            >
              <el-select v-model="scope.row.Category" placeholder="请选择配置类型" filterable clearable>
                <el-option v-for="(value, key) in deviceConfigDic" :key="key" :label="value" :value="key"></el-option>
              </el-select>
            </el-tooltip>
          </template>
          <template v-else>{{ scope.row.Category ? deviceConfigDic[scope.row.Category] : '' }}</template>
        </template>
      </el-table-column>
      <el-table-column prop="DefineId" label="数据定义标识" min-width="150">
        <template v-slot="scope">
          <template v-if="scope.row.isEdit">
            <el-tooltip
              effect="danger"
              placement="top"
              :manual="true"
              v-model="scope.row.validate.DefineId.isValidate"
              :content="`数据定义标识${scope.row.validate.DefineId.validateMsg}`"
            >
              <el-select v-model="scope.row.DefineId" @change="defineIdChange(scope.row, 'DefineId')" placeholder="请选择数据定义标识" filterable clearable>
                <el-option v-for="(value, key) in dataDefine" :key="key" :label="value.DataKey" :value="value.Id">
                  <span class="option-left">{{ value.DataKey }}</span>
                  <span class="option-right">{{ value.DataName }}</span>
                </el-option>
              </el-select>
            </el-tooltip>
          </template>
          <template v-else>{{ dataDefine[scope.row.DefineId].DataKey }}</template>
        </template>
      </el-table-column>
      <el-table-column prop="Name" label="配置名称" min-width="150">
        <template v-slot="scope">
          <template v-if="scope.row.isEdit">
            <el-tooltip effect="danger" placement="top" :manual="true" v-model="scope.row.validate.Name.isValidate" :content="`配置名称${scope.row.validate.Name.validateMsg}`">
              <el-input v-model="scope.row.Name" @change="inputValidate(scope.row, 'Name')"></el-input>
            </el-tooltip>
          </template>
          <template v-else>{{ scope.row.Name }}</template>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220">
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
  </div>
</template>
<script>
import { DEVICE_CONFIG_DIC } from '@constants/dictionaries'
import { DATA_TYPE_UNIT_CONFIG } from '@constants/dataTypeConfig'
import DeviceApi from '@helper/apis/device'
import DeviceDataDefinedApi from '@helper/apis/deviceDataDefine'
import { $utils } from '@helper'

export default {
  name: 'device-config-panel-edit',

  props: {
    deviceSn: {
      type: String,
      required: true,
      default: ''
    }
  },

  data() {
    return {
      isLoading: false,
      baseData: [],
      dataDefine: {},
      deviceConfigDic: DEVICE_CONFIG_DIC,
      dataTypeUnitConfig: DATA_TYPE_UNIT_CONFIG,
      unitCascaderProps: {
        children: 'children',
        label: 'label',
        value: 'value'
      },
      validate: {
        Name: {
          isValidate: false,
          validateMsg: ''
        },
        DefineId: {
          isValidate: false,
          validateMsg: ''
        },
        Category: {
          isValidate: false,
          validateMsg: ''
        }
      }
    }
  },

  computed: {},
  filters: {},
  watch: {},

  created() {
    this.handRefresh()
  },

  methods: {
    // -----------------Refresh--------------------
    handRefresh() {
      this.isLoading = true
      // --------------1、获取数据定义-------------------
      DeviceDataDefinedApi.getDeviceDataDefine(this.deviceSn)
        .then(result => {
          const dataDefine = {}
          result.list.forEach(element => {
            dataDefine[element.Id] = element
          })
          this.dataDefine = dataDefine
          // --------------2、设备配置信息-------------------
          this.getConfigData()
        })
        .catch(errMsg => {
          this.$message.error(String(errMsg))
          console.error(errMsg)
        })
        .fin(() => {
          this.isLoading = false
        })
    },
    // 获取设备配置
    getConfigData() {
      DeviceApi.getDeviceInfo(this.deviceSn).then(res => {
        this.baseData = []
        res.ConfigData.reverse().forEach(item => {
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
      if (this.inputValidate(rowData, 'Name') && this.inputValidate(rowData, 'DefineId') && this.inputValidate(rowData, 'Category')) {
        isValidate = true
      }
      return isValidate
    },
    // 数据标识 change 事件
    defineIdChange(rowData, modelName) {
      if (this.inputValidate(rowData, modelName)) {
        // 只有新增的时候才根据数据定义（dataDefine）的默认值（DefaultValue）来修改控制数据（baseData）的控制值DataValue
        if (rowData.Id === '') {
          rowData.Name = this.dataDefine[rowData[modelName]].DataName
        }
      }
    },
    // 新增数据
    onAddClick() {
      this.baseData.unshift({
        Id: '',
        DeviceSn: this.deviceSn,
        Category: '',
        Name: '',
        DefineId: '',
        isEdit: true,
        isSave: false,
        validate: this.$_.cloneDeep(this.validate)
      })
      document.querySelector('#deviceCofTable .el-table__body-wrapper').scrollTop = 0
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
          DeviceApi.deviceConfigSave(data)
            .then(result => {
              this.$message.success(result.message)
              this.getConfigData()
              this.onDataChange()
              rowData.isEdit = false
            })
            .catch(errMsg => {
              this.$message.error(errMsg)
              console.error(errMsg)
            })
        } else {
          // 新增
          DeviceApi.deviceConfigAdd(data)
            .then(result => {
              this.$message.success(result.message)
              this.getConfigData()
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
          DeviceApi.deviceConfigRemove(id, deviceSn)
            .then(result => {
              this.$message.success(result.message)
              this.$delete(this.baseData, index)
              this.getConfigData()
              this.onDataChange()
            })
            .catch(errMsg => {
              this.$message.error(errMsg)
            })
        })
        .catch(err => {
          console.error(err)
          this.$message.warning('取消删除')
        })
    }
  }
}
</script>
<style type="text/css" lang="scss" module>
.device-config-panel-edit {
  display: flex;
  flex-direction: column;
  .opt-area {
    text-align: right;
  }
}
</style>
