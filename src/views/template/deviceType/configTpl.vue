<!--
 * @Author: jiapeng.Zheng
 * @Date: 2018-12-04 09:43:05
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-31 16:25:06
 * @Description: 设备配置类型模板
 -->
<template>
  <el-card class="box-card">
    <div slot="header" class="clearfix">
      <span style="font-weight:bold">{{ activeNode.data.DeviceTypeName }} / {{ $t('template') }} / {{ activeTpl.TempName }} /</span>
      <span>{{ $t('deviceConfig') }}</span>
      <!-- search from -->
    </div>
    <el-form class="form-group" :inline="true" v-if="activeTpl.Id">
      <el-form-item>
        <el-button type="primary" icon="plus" @click="onAddClick">{{ $t('add') }}</el-button>
      </el-form-item>
    </el-form>
    <!-- table -->
    <el-table :data="configData" border>
      <el-table-column prop="DataDefineKey" label="数据定义"></el-table-column>
      <el-table-column prop="Name" label="配置名称"></el-table-column>
      <el-table-column prop="Category" label="配置类型">
        <template v-slot="scope">{{ scope.row.Category ? deviceConfigDic[scope.row.Category] : '' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template v-slot="scope">
          <el-button @click="onEditClick(scope.row)" type="primary" size="small">{{ $t('edit') }}</el-button>
          <el-button @click="onDelClick(scope.row.Id)" type="danger" size="small">{{ $t('delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- dialog -->
    <el-dialog :visible="isDialogVisible" width="30%" @close="isDialogVisible = false" class="edit-dialog" :close-on-click-modal="false" :show-close="false">
      <span slot="title" class="el-dialog__title">
        【{{ activeTpl.TempName }}】
        <span>{{ isAdd ? $t('adds') : $t('edits') }}{{ $t('deviceConfig') }}</span>
      </span>
      <el-form :model="fillForm" :rules="rules" ref="fillForm">
        <div class="form-group col-sm-11">
          <el-form-item label="配置名称" prop="Name">
            <el-input v-model="fillForm.Name"></el-input>
          </el-form-item>
          <el-form-item label="数据定义" prop="DataDefineKey">
            <el-select v-model="fillForm.DataDefineKey" placeholder="请选择数据定义" filterable clearable @change="selectChange">
              <el-option v-for="(value, key) in dataDefine" :key="key" :label="value.DataKey" :value="value.DataKey">
                <span class="option-left">{{ value.DataKey }}</span>
                <span class="option-right">{{ value.DataName }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="配置类型" prop="Category">
            <el-select v-model="fillForm.Category" placeholder="请选择配置类型" filterable clearable>
              <el-option v-for="(value, key) in deviceConfigDic" :key="key" :label="value" :value="key"></el-option>
            </el-select>
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
import { DEVICE_CONFIG_DIC } from '@constants/dictionaries'

export default {
  name: 'config-tpl',

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
      isDialogVisible: false,
      isAdd: true,
      configData: [],
      dataDefine: {},
      fillForm: {
        Name: '',
        DataDefineKey: '',
        Category: ''
      },
      rules: {
        Name: [
          {
            required: true,
            message: '请输入配置名称',
            trigger: 'blur'
          },
          {
            min: 1,
            max: 25,
            message: '长度在 1 到 25 个字符',
            trigger: 'blur'
          }
        ],
        DataDefineKey: [
          {
            required: true,
            message: '请选择数据定义',
            trigger: 'blur'
          }
        ],
        Category: [
          {
            required: true,
            message: '请选择配置类型',
            trigger: 'blur'
          }
        ]
      },
      deviceConfigDic: DEVICE_CONFIG_DIC
    }
  },

  computed: {},

  watch: {
    activeTpl(newVal) {
      if (newVal.Id) {
        const dataDefine = newVal.DataDefineData
        dataDefine.forEach(element => {
          this.dataDefine[element.DataKey] = element
        })
        this.configData = newVal.ConfigData
        // this.handleRefresh()
      }
    }
  },

  methods: {
    // -----------------Refresh--------------------
    handleRefresh() {
      this.$emit('handleRefresh', this.activeNode, this.activeTpl)
    },
    // -----------------on click event--------------------
    // 数据标识 change 事件
    selectChange() {
      // 只有新增的时候才根据数据定义(dataDefine)的默认值(DataName)来修改配置名称(Name)
      const { Id, DataDefineKey } = this.fillForm
      if (Id === '' && DataDefineKey) {
        this.fillForm.Name = this.dataDefine[DataDefineKey].DataName
      }
    },
    // 新增数据
    onAddClick() {
      this.fillForm = {
        TemplateId: this.activeTpl.Id,
        Id: '',
        Name: '',
        DataDefineKey: '',
        Category: ''
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
            .typeTemplateConfigAdd(this.fillForm)
            .then(result => {
              this.$message.success(result.message)
              this.isDialogVisible = false
              this.handleRefresh()
            })
            .catch(errMsg => {
              this.$message.error(String(errMsg))
              console.error(errMsg)
            })
        } else {
          // 编辑
          this.$apis.deviceType
            .typeTemplateConfigModify(this.fillForm)
            .then(result => {
              this.$message.success(result.message)
              this.isDialogVisible = false
              this.handleRefresh()
            })
            .catch(errMsg => {
              this.$message.error(String(errMsg))
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
            .typeTemplateConfigRemove(id)
            .then(result => {
              this.$message.success(result.message)
              this.handleRefresh()
            })
            .catch(errMsg => {
              this.$message.error(String(errMsg))
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
<style type="text/css" lang="scss"></style>
