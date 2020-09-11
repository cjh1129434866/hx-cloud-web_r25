<!--
 * @Author: jiapeng.Zheng
 * @Date: 2018-12-04 09:43:05
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-31 16:23:56
 * @Description: 设备配置类型模板
 -->
<template>
  <el-card class="box-card">
    <div slot="header" class="clearfix">
      <span style="font-weight:bold">{{ activeNode.data.DeviceTypeName }} / {{ $t('template') }} / {{ activeTpl.TempName }} /</span>
      <span>{{ $t('panel') }}</span>
      <!-- search from -->
    </div>
    <el-form class="form-group" :inline="true" v-if="activeTpl.Id">
      <el-form-item>
        <el-button type="primary" icon="plus" @click="onAddClick">{{ $t('add') }}</el-button>
      </el-form-item>
    </el-form>
    <!-- table -->
    <el-table
      class="type-panel-tpl-table"
      :data="panelData"
      :highlight-current-row="true"
      @current-change="tableCurrentChange"
      :row-class-name="tableRowClassName"
      border
      ref="paneltplTable"
    >
      <el-table-column prop="PanelTypeId" label="面板类型">
        <template v-slot="scope">{{ paneType[scope.row.PanelTypeId].Name }}</template>
      </el-table-column>
      <el-table-column prop="PanelName" label="面板名称"></el-table-column>
      <el-table-column label="备注">
        <template v-slot="scope">{{ panelConfig[scope.row.PanelTypeId].hasPanelTpl ? '' : '该面板的内容不会保存为模板' }}</template>
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
        <span>{{ isAdd ? $t('adds') : $t('edits') }}{{ $t('panel') }}</span>
      </span>
      <el-form :model="fillForm" :rules="rules" ref="fillForm">
        <div class="form-group col-sm-11">
          <el-form-item label="面板名称" prop="PanelName">
            <el-input v-model="fillForm.PanelName"></el-input>
          </el-form-item>
          <el-form-item label="面板类型" prop="PanelTypeId">
            <el-select v-model="fillForm.PanelTypeId" placeholder="请选择面板类型" filterable clearable @change="selectChange">
              <el-option v-for="(value, key) in paneType" :key="key" :label="value.Name" :value="value.Id"></el-option>
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
import { PANEL_CONFIG } from '@constants/panelConfig'

export default {
  name: 'panel-tpl',

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
      panelData: [],
      fillForm: {
        PanelName: '',
        PanelTypeId: ''
      },
      rules: {
        PanelName: [
          {
            required: true,
            message: '请输入面板名称',
            trigger: 'blur'
          },
          {
            min: 1,
            max: 25,
            message: '长度在 1 到 25 个字符',
            trigger: 'blur'
          }
        ],
        PanelTypeId: [
          {
            required: true,
            type: 'number',
            message: '请选择面板类型',
            trigger: 'blur'
          }
        ]
      },
      panelConfig: PANEL_CONFIG,
      paneType: {}
    }
  },

  computed: {},

  watch: {
    activeTpl(newVal) {
      if (newVal.Id) {
        this.panelData = newVal.PanelData
        this.$nextTick(() => {
          this.panelData.forEach(element => {
            if (this.activePanel.Id === element.Id) {
              // 选中对应的行,成功后会自动调用 tableCurrentChange 事件
              this.$refs.paneltplTable.setCurrentRow(element)
            }
          })
        })
      }

      // this.handleRefresh()
    }
  },

  async created() {
    const paneType = await this.$apis.panel.getDevicePanelType()
    paneType.list.forEach(element => {
      this.paneType[element.Id] = element
    })
  },

  methods: {
    // -----------------Refresh--------------------
    handleRefresh() {
      this.$emit('handleRefresh', this.activeNode, this.activeTpl)
    },
    // 数据标识 change 事件
    selectChange() {
      // 只有新增的时候才根据面板类型(paneType)的名称(Name)来修改面板名称(PanelName)
      const { Id, PanelTypeId } = this.fillForm
      if (Id === '' && PanelTypeId) {
        this.fillForm.PanelName = this.paneType[PanelTypeId].Name
      }
    },
    // 当表格的当前行发生变化的时候会触发该事件
    tableCurrentChange(val) {
      if (val) {
        this.$emit('panelClick', val)
      }
    },
    // 通过指定 Table 组件的 row-class-name 属性来为 Table 中的某一行添加 class，表明该行处于某种状态
    tableRowClassName({ row }) {
      return this.panelConfig[row.PanelTypeId].hasPanelTpl ? 'enabled-row' : 'disabled-row'
    },
    // -----------------on click event--------------------
    // 新增数据
    onAddClick() {
      this.fillForm = {
        TemplateId: this.activeTpl.Id,
        Id: '',
        PanelName: '',
        PanelTypeId: ''
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
            .addTemplatePanel(this.fillForm)
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
            .saveTemplatePanel(this.fillForm)
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
            .removeTemplatePanel(id)
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
<style type="text/css" lang="scss">
.type-panel-tpl-table {
  .enabled-row {
    cursor: pointer;
  }
  .disabled-row {
    cursor: not-allowed;
  }
}
</style>
