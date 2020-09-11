<!--
 * @Author: jiapeng.Zheng
 * @Date: 2018-12-04 09:43:05
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-31 16:24:57
 * @Description: 设备配置类型模板
 -->
<template>
  <el-card class="box-card">
    <div slot="header" class="clearfix">
      <span style="font-weight:bold">{{ activeNode.data.DeviceTypeName }} / {{ $t('template') }} / {{ activeTpl.TempName }} / {{ $t('panel') }} /</span>
      <span>{{ $t('deviceControlData') }}</span>
      <!-- search from -->
    </div>
    <el-form class="form-group" :inline="true" v-if="activeTpl.Id">
      <el-form-item>
        <el-button type="primary" icon="plus" @click="onAddClick">{{ $t('add') }}</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onpLayoutClick">{{ $t('layout') }}</el-button>
      </el-form-item>
    </el-form>
    <!-- table -->
    <el-table class="ctrl-panel-tpl-table" :data="accessoryData" border row-key="Id" :expand-row-keys="expandRow" @expand="onExpand">
      <el-table-column type="expand">
        <template v-slot="props">
          <el-table :data="props.row.ControlData" border>
            <el-table-column prop="ControlName" label="控制项名称"></el-table-column>
            <el-table-column prop="DataDefineKey" label="数据定义标识"></el-table-column>
            <el-table-column prop="AssociateKey" label="关联数据"></el-table-column>
            <el-table-column label="操作" width="260">
              <template v-slot="scope">
                <el-button @click="onControllerEditClick(scope.row)" type="primary" size="small">{{ $t('edit') }}</el-button>
                <el-button @click="showControlData(scope.row, 0)" type="warning" size="small" v-if="scope.row.IState === 1">隐藏</el-button>
                <el-button @click="showControlData(scope.row, 1)" type="success" size="small" v-else>显示</el-button>
                <el-button @click="onControllerDelClick(scope.row.Id, scope.row.DeviceSn, scope.$index)" type="danger" size="small">{{ $t('delete') }}</el-button>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column prop="Name" label="配件名称">
        <template v-slot="scope">
          <icon :name="scope.row.ICON || default_acc_icon"></icon>
          {{ scope.row.Name }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="260">
        <template v-slot="scope">
          <el-button @click="onAddControllerClick(scope.row.Id, scope.row)" type="success" size="small">新增控制项</el-button>
          <el-button @click="onEditClick(scope.row)" type="primary" size="small">{{ $t('edit') }}</el-button>
          <el-button @click="onDelClick(scope.row.Id)" type="danger" size="small">{{ $t('delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 配件 dialog -->
    <el-dialog :visible="isDialogVisible" width="30%" @close="isDialogVisible = false" class="edit-dialog" :close-on-click-modal="false" :show-close="false">
      <span slot="title" class="el-dialog__title">
        【{{ activeTpl.TempName }}】
        <span>{{ isAdd ? $t('adds') : $t('edits') }}{{ $t('accessory') }}</span>
      </span>
      <el-form :model="fillForm" :rules="rules" ref="fillForm">
        <div class="form-group col-sm-11">
          <el-form-item label="图标" prop="ICON">
            <el-popover ref="popoverIcon" width="296" placement="right" trigger="hover">
              <icon-list
                type="accessory"
                @iconClick="
                  iconName => {
                    fillForm.ICON = iconName
                  }
                "
              ></icon-list>
            </el-popover>
            <icon v-popover:popoverIcon class="input-icon icons" :name="fillForm.ICON"></icon>
          </el-form-item>
        </div>
        <div class="form-group col-sm-11">
          <el-form-item label="配件名称" prop="Name">
            <el-input v-model="fillForm.Name"></el-input>
          </el-form-item>
        </div>
      </el-form>
      <span slot="footer">
        <el-button type="cancel" @click="isDialogVisible = false">{{ $t('cancel') }}</el-button>
        <el-button type="primary" @click="onSureClick">{{ $t('confirm') }}</el-button>
      </span>
    </el-dialog>
    <!-- 控制项 dialog -->
    <el-dialog :visible="isControllerDialogVisible" width="30%" @close="isControllerDialogVisible = false" class="edit-dialog" :close-on-click-modal="false" :show-close="false">
      <span slot="title" class="el-dialog__title">
        【{{ activeTpl.TempName }}】
        <span>{{ isAdd ? $t('adds') : $t('edits') }}{{ $t('deviceControlData') }}</span>
      </span>
      <el-form :model="ControllerForm" :rules="ControllerFormRules" ref="ControllerForm">
        <div class="form-group col-sm-11">
          <el-form-item label="控制名称" prop="ControlName">
            <el-input v-model="ControllerForm.ControlName"></el-input>
          </el-form-item>
        </div>
        <div class="form-group col-sm-11">
          <el-form-item label="数据定义" prop="DataDefineKey">
            <el-select v-model="ControllerForm.DataDefineKey" placeholder="请选择数据定义" filterable clearable @change="selectChange">
              <el-option v-for="(value, key) in dataDefine" :key="key" :label="value.DataKey" :value="value.DataKey">
                <span class="option-left">{{ value.DataKey }}</span>
                <span class="option-right">{{ value.DataName }}</span>
              </el-option>
            </el-select>
          </el-form-item>
        </div>
        <div class="form-group col-sm-11">
          <el-form-item label="关联数据" prop="AssociateKey">
            <el-select v-model="ControllerForm.AssociateKey" placeholder="请选择关联数据定义" filterable clearable>
              <el-option v-for="(value, key) in dataDefine" :key="key" :label="value.DataKey" :value="value.DataKey">
                <span class="option-left">{{ value.DataKey }}</span>
                <span class="option-right">{{ value.DataName }}</span>
              </el-option>
            </el-select>
          </el-form-item>
        </div>
      </el-form>
      <span slot="footer">
        <el-button type="cancel" @click="isControllerDialogVisible = false">{{ $t('cancel') }}</el-button>
        <el-button type="primary" @click="onControllerSureClick">{{ $t('confirm') }}</el-button>
      </span>
    </el-dialog>
    <!-- 布局 dialog -->
    <el-dialog
      :visible="isLayoutDialogVisible"
      :fullscreen="true"
      @close="isLayoutDialogVisible = false"
      class="edit-dialog ctrl-panel-layout-tpl-dialog"
      :show-close="false"
      :close-on-click-modal="false"
    >
      <span slot="title" class="el-dialog__title">
        【{{ activeTpl.TempName }}】
        <span>{{ $t('layout') }}</span>
      </span>

      <EasyScrollbar class="content-scrollbar" :barOption="barOption">
        <!-- 配件布局 -->
        <grid-layout
          class="accessory-layout"
          :layout="accessoryLayoutData"
          :col-num="24"
          :row-height="30"
          :is-draggable="true"
          :is-resizable="true"
          :is-mirrored="false"
          :vertical-compact="true"
          :margin="[5, 5]"
          :use-css-transforms="true"
          :autoSize="true"
          @layout-updated="
            newLayout => {
              typeLayoutUpdatedEvent(newLayout, 0)
            }
          "
        >
          <!-- 配件 -->
          <grid-item v-for="(item, index) in accessoryLayoutData" class="control-layout" :key="index" :x="item.x" :y="item.y" :w="item.w" :h="item.h" :i="item.i">
            <el-card :style="`height:100%;background:url(${$document.canvasWrapText({ text: item.Name })})`" :body-style="{ padding: '10px' }">
              <!-- 配件的控制项布局 -->
              <grid-layout
                :layout="item.ControlData"
                :col-num="12"
                :row-height="10"
                :is-draggable="true"
                :is-resizable="true"
                :is-mirrored="false"
                :vertical-compact="true"
                :margin="[10, 10]"
                :use-css-transforms="true"
                @layout-updated="
                  newLayout => {
                    typeLayoutUpdatedEvent(newLayout, 1)
                  }
                "
              >
                <!-- 配件的控制项 -->
                <!-- <div class="accessory-contoller"></div> -->
                <grid-item v-for="(itemData, itemIndex) in item.ControlData" :key="itemIndex" :x="itemData.x" :y="itemData.y" :w="itemData.w" :h="itemData.h" :i="itemData.i">
                  <!-- <div :class="`contoller-item ${itemData.componentDataType}-contoller`" :key="itemIndex"></div> -->
                  <component
                    :is="itemData.componentType"
                    :key="itemData.Id"
                    :dataKey="itemData.Id"
                    :data="itemData"
                    deviceState="offLine"
                    :accessoryData="item"
                    :ctrlModeConf="{ val: '' }"
                    :deviceInfo="{ ConfigData: [] }"
                    :disabled="true"
                    :ctrlModeStatuVal="'0'"
                    v-model="itemData.DataValue"
                    @change="switchChange(itemData.type, itemData)"
                    @getDeviceData="getDeviceData(itemData.type, itemData)"
                  ></component>
                </grid-item>
                <!-- 配件的控制项END -->
              </grid-layout>
              <!-- 配件的控制项布局END -->
            </el-card>
          </grid-item>
          <!-- 配件END -->
        </grid-layout>
        <!-- 配件布局END -->
      </EasyScrollbar>

      <span slot="footer">
        <el-button type="cancel" @click="isLayoutDialogVisible = false">{{ $t('cancel') }}</el-button>
        <el-button type="primary" @click="isLayoutDialogVisible = false">{{ $t('confirm') }}</el-button>
      </span>
    </el-dialog>
  </el-card>
</template>
<script>
import { DEFAULT_ACC_ICON } from '@constants/deviceConfig'
import { DATA_TYPE_CONFIG } from '@constants/dataTypeConfig'
import { BAR_OPTION } from '@constants/easyScrollbarConfig/index.js'
import VueGridLayout from 'vue-grid-layout'

export default {
  name: 'controller-panel-tpl',

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
      barOption: BAR_OPTION, // 滚动条配置
      isDialogVisible: false,
      isLayoutDialogVisible: false,
      isControllerDialogVisible: false,
      isAdd: true,
      isControllerAdd: true,
      dataTypeConfig: DATA_TYPE_CONFIG, // 控制类型配置
      default_acc_icon: DEFAULT_ACC_ICON,
      accessoryData: [], // 配件信息
      accessoryLayoutData: [], // 配件布局信息,根据 accessoryData 生成
      splitString: '|',
      expandRow: [], // 配件table展开的行
      tempExpandRow: [], // expandRow 的缓存
      dataDefine: {}, // 数据定义
      fillForm: {
        Name: '',
        ICON: ''
      },
      ControllerForm: {
        ControlName: '',
        DataDefineKey: '',
        AssociateKey: ''
      },
      ControllerFormRules: {
        ControlName: [
          {
            required: true,
            message: '请输入控制名称',
            trigger: 'blur'
          },
          {
            min: 1,
            max: 50,
            message: '长度在 1 到 50 个字符',
            trigger: 'blur'
          }
        ],
        DataDefineKey: [
          {
            required: true,
            message: '请选择数据定义',
            trigger: 'blur'
          }
        ]
      },
      rules: {
        Name: [
          {
            required: true,
            message: '请输入配件名称',
            trigger: 'blur'
          },
          {
            min: 1,
            max: 50,
            message: '长度在 1 到 50 个字符',
            trigger: 'blur'
          }
        ]
      }
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
        this.accessoryData = newVal.AccessoryData
        this.expandRow = JSON.parse(JSON.stringify(this.tempExpandRow))
      }
    }
  },

  components: {
    IconList: resolve => require.ensure([], () => resolve(require('@views/common/IconList')), 'iconList'),
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem
  },

  methods: {
    // -----------------Refresh--------------------
    handleRefresh() {
      this.$emit('handleRefresh', this.activeNode, this.activeTpl, this.activePanel)
    },
    // -----------------on click event--------------------
    onpLayoutClick() {
      const accessoryData = JSON.parse(JSON.stringify(this.accessoryData))
      for (const i in accessoryData) {
        accessoryData[i].ControlData.forEach((element, index) => {
          Object.assign(accessoryData[i], JSON.parse(element.SequenceOut)) // 配件的位置信息
          accessoryData[i].i = String(accessoryData[i].Id) // 覆盖由模板生成过来的配件的组间位置信息{ i: '', x: '', y: '', w:'',h:'' }中的 i 属性
          accessoryData[i].x = parseInt(accessoryData[i].x) // 覆盖由模板生成过来的配件的组间位置信息{ i: '', x: '', y: '', w:'',h:'' }中的 x 属性
          accessoryData[i].y = parseInt(accessoryData[i].y) // 覆盖由模板生成过来的配件的组间位置信息{ i: '', x: '', y: '', w:'',h:'' }中的 y 属性
          accessoryData[i].w = parseInt(accessoryData[i].w) // 覆盖由模板生成过来的配件的组间位置信息{ i: '', x: '', y: '', w:'',h:'' }中的 w 属性
          accessoryData[i].h = parseInt(accessoryData[i].h) // 覆盖由模板生成过来的配件的组间位置信息{ i: '', x: '', y: '', w:'',h:'' }中的 h 属性
          accessoryData[i].isResizable = false
          const elementTmp = JSON.stringify(element)
          // Object.assign(element, this.dataDefine[element.DataDefineKey]) // 根据 DataDefineKey 获取数据定义 dataDefine {Id, DataKey, DisplayKey, DataName, Unit, DefaultValue, DataType, Format, TempId}
          const ControlLayout = {
            ...JSON.parse(element.SequenceIn), // 控制数据的位置信息{ i: '', x: '', y: '', w:'',h:'' }
            ...this.dataTypeConfig[element.DataType], // 数据类型配置{ icon: '', componentType: '', data: [] }
            i: String(element.Id), // 位置id,必须在...JSON.parse(element.SequenceIn)后面，覆盖因为新增导致SequenceIn中的i为空
            Id: element.Id,
            isLoding: true,
            disabled: true,
            // title: '控制数据加载中...',
            DataName: element.ControlName, // 控制项名称
            dataFormat: element.Format, // 格式转换
            dataType: element.DataKey, // 数据定义的数据输入标识
            displayKey: element.DisplayKey || element.DataKey, // 数据定义的数据输出标识
            // DeviceNo: this.deviceNo, // 设备编码
            // 关联数据信息
            Associate: {
              key: element.AssociateKey,
              Unit: element.AssociateUnit,
              Format: element.AssociateFormat,
              DataType: element.AssociateDataType
            },
            Unit: element.Unit, // 数据定义的单位
            DataValue: element.DataValue, // 默认数值为''
            historyValue: {} // 历史数据
          }
          ControlLayout.x = parseInt(ControlLayout.x) // 覆盖由模板生成过来的配件的组内位置信息{ i: '', x: '', y: '', w:'',h:'' }中的 x 属性
          ControlLayout.y = parseInt(ControlLayout.y) // 覆盖由模板生成过来的配件的组内位置信息{ i: '', x: '', y: '', w:'',h:'' }中的 y 属性
          ControlLayout.w = parseInt(ControlLayout.w) // 覆盖由模板生成过来的配件的组内位置信息{ i: '', x: '', y: '', w:'',h:'' }中的 w 属性
          ControlLayout.h = parseInt(ControlLayout.h) // 覆盖由模板生成过来的配件的组内位置信息{ i: '', x: '', y: '', w:'',h:'' }中的 h 属性
          ControlLayout.elementTmp = JSON.parse(elementTmp)
          accessoryData[i].ControlData[index] = ControlLayout
        })
      }
      // this.accessoryLayoutData = accessoryData
      // 过滤掉控制项为空的配件
      const accessoryLayoutData = accessoryData.filter(accessory => {
        return accessory.ControlData.length > 0
      })
      this.accessoryLayoutData = accessoryLayoutData
      this.isLayoutDialogVisible = true
    },
    /**
     * 配件布局更新事件
     */
    async typeLayoutUpdatedEvent(newLayout, type) {
      const data = { DeviceSn: this.deviceSn, seq: '', Accessory: '', Id: '', type }
      newLayout.forEach(i => {
        data.seq += this.splitString + JSON.stringify({ i: i.i, w: i.w, h: i.h, x: i.x, y: i.y })
        data.Accessory += this.splitString + i.i
        data.Id += this.splitString + i.i
      })
      data.seq = data.seq.replace(this.splitString, '')
      data.Accessory = data.Accessory.replace(this.splitString, '')
      data.Id = data.Id.replace(this.splitString, '')

      try {
        await this.$apis.deviceType.updateTemplateControlSeqIn(data)
        this.handleRefresh()
      } catch (errMsg) {
        this.$message.error(String(errMsg))
        console.error(errMsg)
      }
    },
    // =============================================== 配件 ==================================================
    onExpand(row, expanded) {
      const temp = this.tempExpandRow
      this.tempExpandRow = []
      if (expanded) {
        temp.push(row.Id)
      } else {
        temp.splice(temp.indexOf(row.Id), 1)
      }
      this.tempExpandRow = temp
    },
    // 新增数据
    onAddClick() {
      this.fillForm = {
        TemplateId: this.activeTpl.Id,
        Id: '',
        Name: '',
        ICON: this.default_acc_icon
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
      this.fillForm.ICON = this.fillForm.ICON || this.default_acc_icon
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
            .addTemplateAccessory(this.fillForm)
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
            .saveTemplateAccessory(this.fillForm)
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
            .removeTemplateAccessory(id)
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
    // =============================================== 控制数据 ==================================================
    selectChange() {
      // 只有新增的时候才根据数据定义(dataDefine)的默认值(DataName)来修改控制名称(ControlName)
      const { Id, DataDefineKey } = this.ControllerForm
      if (Id === '' && DataDefineKey) {
        this.ControllerForm.ControlName = this.dataDefine[DataDefineKey].DataName
      }
    },
    // 新增控制数据
    onAddControllerClick(id, rowData) {
      // 默认的组内排序
      const SequenceInXArray = [0]
      const SequenceInYArray = [0]
      const SequenceInWArray = [9]
      const SequenceInHArray = [3]
      let SequenceOut = null
      rowData.ControlData.forEach(ele => {
        const SequenceIn = JSON.parse(ele.SequenceIn)
        SequenceInXArray.push(SequenceIn.x)
        SequenceInYArray.push(SequenceIn.y)
        SequenceInWArray.push(SequenceIn.w)
        SequenceInHArray.push(SequenceIn.h)
        SequenceOut = ele.SequenceOut
      })
      // 配件不存在控制项
      if (!SequenceOut) {
        // 默认的组间排序
        const SequenceOutXArray = [0]
        const SequenceOutYArray = [0]
        const SequenceOutWArray = [7]
        const SequenceOutHArray = [6]
        this.accessoryData.forEach(ele => {
          if (ele.ControlData.length > 0) {
            const SequenceOut = JSON.parse(ele.ControlData[0].SequenceOut)
            SequenceOutXArray.push(SequenceOut.x)
            SequenceOutYArray.push(SequenceOut.y)
            SequenceOutWArray.push(SequenceOut.w)
            SequenceOutHArray.push(SequenceOut.h)
          }
        })
        SequenceOut = JSON.stringify({
          i: id,
          x: Math.max(...SequenceOutXArray),
          y: Math.max(...SequenceOutYArray) + 1,
          w: Math.max(...SequenceOutWArray),
          h: Math.max(...SequenceOutHArray)
        })
      }
      this.ControllerForm = {
        TemplateId: this.activeTpl.Id,
        Id: '',
        ControlName: '',
        DataValue: '',
        DataDefineKey: '',
        AssociateKey: '',
        AccessoryId: id,
        SequenceIn: JSON.stringify({
          i: '',
          x: Math.max(...SequenceInXArray),
          y: Math.max(...SequenceInYArray) + 1,
          w: Math.max(...SequenceInWArray),
          h: Math.max(...SequenceInHArray)
        }),
        SequenceOut: SequenceOut
      }
      this.isControllerAdd = true
      this.isControllerDialogVisible = true
      this.$nextTick(() => {
        this.$refs.ControllerForm.resetFields()
      })
    },
    // 编辑控制数据
    onControllerEditClick(rowData) {
      this.ControllerForm = JSON.parse(JSON.stringify(rowData))
      this.isControllerAdd = false
      this.isControllerDialogVisible = true
    },
    // 保存数据
    onControllerSureClick() {
      this.$refs.ControllerForm.validate(valid => {
        if (!valid) return
        if (this.isControllerAdd) {
          // 新增
          this.$apis.deviceType
            .addTemplateControlData(this.ControllerForm)
            .then(result => {
              this.$message.success(result.message)
              this.isControllerDialogVisible = false
              this.handleRefresh()
            })
            .catch(errMsg => {
              this.$message.error(errMsg)
              console.error(errMsg)
            })
        } else {
          // 编辑
          this.$apis.deviceType
            .saveTemplateControlData(this.ControllerForm)
            .then(result => {
              this.$message.success(result.message)
              this.isControllerDialogVisible = false
              this.handleRefresh()
            })
            .catch(errMsg => {
              this.$message.error(errMsg)
              console.error(errMsg)
            })
        }
      })
    },
    // 删除控制数据
    onControllerDelClick(id) {
      this.$confirm('是否删除该记录？', '提示', { cancelButtonClass: 'el-button--cancel', closeOnClickModal: false })
        .then(() => {
          this.$apis.deviceType
            .removeTemplateControlData(id)
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
    // 显示控制数据
    async showControlData(rowData, IState) {
      rowData.IState = IState
      try {
        const result = await this.$apis.deviceType.saveTemplateControlData(rowData)
        this.$message.success(result.message)
        // this.refreshDataDefinePanel(false)
      } catch (errMsg) {
        this.$message.error(errMsg)
        console.error(errMsg)
        // this.getDeviceControlData(this.activeAcc.Id)
      }
    }
  }
}
</script>
<style type="text/css" lang="scss">
.ctrl-panel-tpl-table {
  .el-table__expanded-cell {
    padding-top: 0;
    padding-right: 0;
    padding-bottom: 0;
  }
}
.ctrl-panel-layout-tpl-dialog {
  .el-dialog__body {
    height: calc(100% - 36px - 61px);
  }
}
</style>
