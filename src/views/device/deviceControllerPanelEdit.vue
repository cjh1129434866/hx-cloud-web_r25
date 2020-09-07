<!--
 * @Author: jiapeng.Zheng
 * @Date: 2018-12-04 09:43:05
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-04-10 10:42:00
 * @Description:
 -->
<!-- 设备控制编辑 -->
<template>
  <el-row :gutter="10">
    <div class="device_ctrl_area">
      <h1 class="device_ctrl_panel_edit_title">
        {{ $t('accessory') }}
        <div class="option-button">
          <el-button icon="plus" size="small" type="primary" @click="onAccAddClick()">{{ $t('add') }}</el-button>
        </div>
      </h1>
      <!-- 配件 table -->
      <el-table
        v-loading="accessoryLoading"
        :data="deviceAccessory"
        border
        height="auto"
        :highlight-current-row="true"
        @current-change="currentChange"
        ref="accTable"
        id="accTable"
      >
        <el-table-column prop="ICON" label="配件图标">
          <template v-slot="scope">
            <template v-if="scope.row.isEdit">
              <el-popover ref="popoverIcon" placement="right" trigger="hover">
                <icon-list
                  type="accessory"
                  @iconClick="
                    iconName => {
                      scope.row.ICON = iconName
                    }
                  "
                ></icon-list>
                <icon slot="reference" class="icons" :name="scope.row.ICON"></icon>
              </el-popover>
            </template>
            <template v-else>
              <icon :name="scope.row.ICON"></icon>
            </template>
          </template>
        </el-table-column>
        <el-table-column prop="Name" label="配件名称" min-width="150">
          <template v-slot="scope">
            <template v-if="scope.row.isEdit">
              <el-tooltip effect="danger" placement="top" :manual="true" v-model="scope.row.validate.Name.isValidate" :content="`配件名称${scope.row.validate.Name.validateMsg}`">
                <el-input v-model="scope.row.Name" @change="inputValidate(scope.row, 'Name')"></el-input>
              </el-tooltip>
            </template>
            <template v-else>{{ scope.row.Name }}</template>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="220">
          <template v-slot="scope">
            <!-- 编辑/新增 -->
            <template v-if="scope.row.isEdit">
              <el-button @click="onSaveAccClick(scope.row, scope.$index)" type="success" size="small">{{ $t('save') }}</el-button>
              <!-- 编辑 -->
              <template v-if="scope.row.isSave">
                <el-button @click="onDelAccClick(scope.row.Id, scope.row.DeviceSn, scope.$index)" type="danger" size="small">{{ $t('delete') }}</el-button>
                <el-button @click="onCancelAccClick(scope.row, scope.$index)" type="warning" size="small">{{ $t('cancel') }}</el-button>
              </template>
              <!-- 新增 -->
              <template v-else>
                <el-button @click="onAddDelAccClick(scope.$index)" type="danger" size="small">{{ $t('delete') }}</el-button>
              </template>
            </template>
            <!-- 显示 -->
            <template v-else>
              <el-button @click="onEditAccClick(scope.row, scope.$index)" type="primary" size="small">{{ $t('edit') }}</el-button>
              <el-button @click="onDelAccClick(scope.row.Id, scope.row.DeviceSn, scope.$index)" type="danger" size="small">{{ $t('delete') }}</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
      <!-- 配件 table END -->
    </div>
    <!-- 配件控制项 table -->
    <div class="device_ctrl_area" v-if="activeAcc.Id">
      <h1 class="device_ctrl_panel_edit_title">
        【{{ activeAcc.Name }}】{{ $t('accessory') }}{{ $t('controlItem') }}
        <div class="option-button">
          <el-button icon="plus" size="small" type="primary" @click="onAddClick()">{{ $t('add') }}</el-button>
        </div>
      </h1>
      <el-table v-loading="baseDataLoading" :data="baseData" border height="auto" id="accCtrlTable">
        <el-table-column prop="ControlName" label="控制名称" min-width="150">
          <template v-slot="scope">
            <template v-if="scope.row.isEdit">
              <el-tooltip
                effect="danger"
                placement="top"
                :manual="true"
                v-model="scope.row.validate.ControlName.isValidate"
                :content="`控制名称${scope.row.validate.ControlName.validateMsg}`"
              >
                <el-input v-model="scope.row.ControlName" @change="inputValidate(scope.row, 'ControlName')"></el-input>
              </el-tooltip>
            </template>
            <template v-else>{{ scope.row.ControlName }}</template>
          </template>
        </el-table-column>

        <el-table-column prop="DataDefineId" label="数据定义标识" min-width="150">
          <template v-slot="scope">
            <template v-if="scope.row.isEdit">
              <el-tooltip
                effect="danger"
                placement="top"
                :manual="true"
                v-model="scope.row.validate.DataDefineId.isValidate"
                :content="`数据定义标识${scope.row.validate.DataDefineId.validateMsg}`"
              >
                <!-- <el-input v-model="scope.row.DataDefineId"
                @change="inputValidate(scope.row,'DataDefineId')"></el-input>-->
                <el-select
                  v-model="scope.row.DataDefineId"
                  @visible-change="visibleChange"
                  @change="dataDefineIdChange(scope.row)"
                  placeholder="请选择数据定义标识"
                  filterable
                  :filter-method="selectFilter"
                >
                  <el-option v-for="item in filterDataDefine" :key="item.Id" :label="item.DataKey" :value="item.Id">
                    <span class="option-left">{{ item.DataKey }}</span>
                    <span class="option-right">{{ item.DataName }}</span>
                  </el-option>
                </el-select>
              </el-tooltip>
            </template>
            <template v-else>{{ scope.row.DataKey }}</template>
          </template>
        </el-table-column>

        <el-table-column prop="AssociateDefineId" label="关联数据" min-width="150">
          <template v-slot="scope">
            <!-- 只有设定值（string）有关联数据 -->
            <template v-if="scope.row.isEdit">
              <el-tooltip
                effect="danger"
                placement="top"
                :manual="true"
                v-model="scope.row.validate.AssociateDefineId.isValidate"
                :content="`关联数据${scope.row.validate.AssociateDefineId.validateMsg}`"
              >
                <el-select
                  v-model="scope.row.AssociateDefineId"
                  @visible-change="visibleChange"
                  @change="associateDefineIdChange(scope.row)"
                  placeholder="请选择关联数据"
                  filterable
                  clearable
                  :filter-method="selectFilter"
                >
                  <!-- 关联数据只能是当前值（monitor） -->
                  <el-option v-for="item in filterDataDefine" :key="item.Id" :label="item.DataKey" :value="item.Id">
                    <span class="option-left">{{ item.DataKey }}</span>
                    <span class="option-right">{{ item.DataName }}</span>
                  </el-option>
                </el-select>
              </el-tooltip>
            </template>
            <template v-else>{{ scope.row.AssociateKey }}</template>
          </template>
        </el-table-column>

        <!-- <el-table-column prop="DataValue" label="默认值" min-width="150">
        <template v-slot="scope">
          <template v-if="scope.row.isEdit">
            <el-tooltip effect="danger" placement="top"
            :manual="true" v-model="scope.row.validate.DataValue.isValidate"
            :content="`默认值${scope.row.validate.DataValue.validateMsg}`" >
              <el-input v-model="scope.row.DataValue"
              @change="inputValidate(scope.row,'DataValue')"></el-input>
            </el-tooltip>
          </template>
          <template v-else>{{scope.row.DataValue}}</template>
        </template>
        </el-table-column>-->
        <el-table-column label="操作" width="220">
          <template v-slot="scope">
            <!-- 编辑/新增 -->
            <template v-if="scope.row.isEdit">
              <el-button @click="onSaveClick(scope.row, scope.$index)" type="success" size="small">{{ $t('save') }}</el-button>
              <!-- 编辑 -->
              <template v-if="scope.row.isSave">
                <el-button @click="onDelClick(scope.row.Id, scope.row.DeviceSn, scope.$index)" type="danger" size="small">{{ $t('delete') }}</el-button>
                <el-button @click="onCancelClick(scope.row, scope.$index)" type="warning" size="small">{{ $t('cancel') }}</el-button>
              </template>
              <!-- 新增 -->
              <template v-else>
                <el-button @click="onAddDelClick(scope.$index)" type="danger" size="small">{{ $t('delete') }}</el-button>
              </template>
            </template>
            <!-- 显示 -->
            <template v-else>
              <el-button @click="showControlData(scope.row, 0)" type="warning" size="small" v-if="scope.row.IState === 1">隐藏</el-button>
              <el-button @click="showControlData(scope.row, 1)" type="success" size="small" v-else>显示</el-button>
              <el-button @click="onEditClick(scope.row, scope.$index)" type="primary" size="small">{{ $t('edit') }}</el-button>
              <el-button @click="onDelClick(scope.row.Id, scope.row.DeviceSn, scope.$index)" type="danger" size="small">{{ $t('delete') }}</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
      <!-- 配件控制项 table END -->
    </div>
  </el-row>
</template>
<script>
import { DEFAULT_ACC_ICON } from '@constants/deviceConfig'
import DeviceDataDefineApi from '@helper/apis/deviceDataDefine'
import DeviceAccessoryApi from '@helper/apis/deviceAccessory'
import DeviceApi from '@helper/apis/device'
import $_ from '@helper/lodash.js'

export default {
  name: 'device-contoller-panel-edit',

  props: {
    deviceSn: {
      type: String,
      required: true,
      default: ''
    },
    deviceControlPanelObj: {
      type: Object,
      required: true,
      default() {
        return {}
      }
    }
  },

  data() {
    return {
      accessoryLoading: false,
      baseDataLoading: false,
      default_acc_icon: DEFAULT_ACC_ICON,
      deviceAccessory: [], // 设备配件
      activeAcc: { Id: '' },
      baseData: [],
      dataDefine: [],
      filterDataDefineName: '',
      validate: {
        ICON: {
          isValidate: false,
          validateMsg: ''
        },
        Name: {
          isValidate: false,
          validateMsg: ''
        },
        ControlName: {
          isValidate: false,
          validateMsg: ''
        },
        DataDefineId: {
          isValidate: false,
          validateMsg: ''
        },
        AssociateDefineId: {
          isValidate: false,
          validateMsg: ''
        }
      }
    }
  },

  computed: {
    filterDataDefine() {
      return this.dataDefine.filter(ele => {
        return ele.DataName.indexOf(this.filterDataDefineName) > -1 || ele.DataKey.indexOf(this.filterDataDefineName) > -1
      })
    }
  },

  watch: {
    activeAcc(newVal) {
      if (newVal.Id) {
        this.getDeviceControlData(newVal.Id)
      } else {
        this.baseData = [] // 清除配件的控制项
      }
    }
  },

  components: {
    IconList: resolve => require.ensure([], () => resolve(require('@views/common/IconList')), 'iconList')
  },

  created() {
    this.handRefresh()
  },

  methods: {
    // -----------------Refresh--------------------
    handRefresh() {
      this.deviceAccessory = []
      // --------------1、获取数据定义-------------------
      DeviceDataDefineApi.getDeviceDataDefine(this.deviceSn)
        .then(result => {
          this.dataDefine = result.list
          // -------------- 2、配件列表 -------------------
          this.accessoryLoading = true
          DeviceAccessoryApi.getAllDeviceAccessory(this.deviceSn)
            .then(result => {
              result.AccessoryList.forEach(item => {
                this.deviceAccessory.push({
                  ...item,
                  ICON: item.ICON || this.default_acc_icon,
                  isEdit: false,
                  isSave: true,
                  validate: $_.cloneDeep(this.validate)
                })
              })
            })
            .catch(errMsg => {
              this.$message.error(errMsg)
              console.error(errMsg)
            })
            .fin(() => {
              this.accessoryLoading = false
            })
        })
        .catch(errMsg => {
          console.error(errMsg)
          this.$message.error(String(errMsg))
        })
    },
    // 当前数据发生了变化
    onDataChange() {
      this.$store.commit('deviceConfig/setIsChange', true)
    },
    // -------------- 获取控制数据 -------------------
    getDeviceControlData(accessoryId) {
      this.baseData = []
      this.baseDataLoading = true
      DeviceApi.findControlDataByAccessory(this.deviceSn, accessoryId)
        .then(result => {
          result.list.forEach(item => {
            // item.DataDefineId = String(item.DataDefineId)
            item.AssociateDefineId = String(item.AssociateDefineId ? item.AssociateDefineId : '')
            this.baseData.push({
              ...item,
              // isEdit用来显示不同的操作按钮以及控制表格编辑框的显示:
              // true  表示该数据准备修改（启用编辑框、显示保存按钮、删除按钮结合isEdit进行功能切换：若isSave为true切换为服务端删除onDelClick，为false切换为客户端删除onAddDelClick）;
              // false 表示该数据已经修改完毕且更新成功（禁用编辑框、显示编辑按钮、删除按钮功能切换为服务端删除onDelClick）;
              isEdit: false,
              // isSave用来区分调用保存Or新增接口:
              // ture  表示该数据来源于服务器,调用保存接口;
              // false 表示该数据来源于手动添加且还未保存到服务器，调用新增接口;
              isSave: true,
              validate: $_.cloneDeep(this.validate)
            })
          })
          this.$set(this.activeAcc, 'List', JSON.parse(JSON.stringify(this.baseData))) // 更新其中的控制项
        })
        .catch(errMsg => {
          this.$message.error(errMsg)
          console.error(errMsg)
        })
        .fin(() => {
          this.baseDataLoading = false
        })
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
        this.tooltipShow(rowData, modelName, '不能大于100字符') // 字符长度的验证必须与 dataDefinedPanelEdit.vue 一致
      } else {
        this.tooltipHide(rowData, modelName)
        isValidate = true
      }
      return isValidate
    },
    rowDataValidate(rowData) {
      let isValidate = false
      if (
        this.inputValidate(rowData, 'ControlName') &&
        this.inputValidate(rowData, 'DataDefineId')
        // && this.inputValidate(rowData, 'DataValue')
      ) {
        isValidate = true
      }
      return isValidate
    },
    rowAccDataValidate(rowData) {
      let isValidate = false
      if (this.inputValidate(rowData, 'Name') && this.inputValidate(rowData, 'ICON')) {
        isValidate = true
      }
      return isValidate
    },
    // -----------------------select change----------------
    dataDefineIdChange(rowData) {
      if (this.inputValidate(rowData, 'DataDefineId')) {
        const { DataName, Id, DataKey } = this.filterDataDefine.find(ele => {
          return ele.Id === rowData.DataDefineId
        })
        // 只有新增的时候(rowData.Id = null)才根据数据定义(dataDefine)的名称(DataName)来修改控制数据(systemControlData)的名称(ControlName)
        if (!rowData.Id) {
          rowData.ControlName = DataName
        }
        rowData.DataDefineId = Id
        rowData.DataKey = DataKey // 主要用来显示,不会传到后台，后台更新控制类型只需要数据定义ID(DataDefineId)
      }
    },
    // 控制项关联数据标识 change 事件
    associateDefineIdChange(rowData) {
      // AssociateDefineId el-select 设置了 clearable ,导致 AssociateDefineId change 时可能为空，需判断不为空的情况
      if (rowData.AssociateDefineId) {
        const { DataKey } = this.filterDataDefine.find(ele => {
          return ele.Id === rowData.AssociateDefineId
        })
        rowData.AssociateKey = DataKey // 主要用来显示,不会传到后台，后台更新控制类型只需要关联的数据定义ID(AssociateDefineId)
      }
    },
    // 控制项数据标识 Filter 事件
    selectFilter: $_.throttle(function(dataName) {
      if (this.dataDefine.findIndex(ele => ele.DataKey === dataName) > -1) {
        this.filterDataDefineName = ''
      } else {
        this.filterDataDefineName = dataName
      }
    }, 500),
    // 控制项数据标识下拉 展开与隐藏事件
    visibleChange(isVisible) {
      if (!isVisible) {
        this.filterDataDefineName = ''
      }
    },
    // -----------------on click event--------------------

    // 配件列表行切换事件
    currentChange(currentRow) {
      this.activeAcc = currentRow || { Id: '' }
    },
    // 新增配件
    onAccAddClick() {
      const acc = {
        Id: '',
        DeviceSn: this.deviceSn,
        Name: '',
        ICON: this.default_acc_icon,
        isEdit: true,
        isSave: false,
        validate: this.$_.cloneDeep(this.validate)
      }
      this.deviceAccessory.unshift(acc) // 添加新的未保存的配件
      // this.activeAcc = acc   // 当前默认的
      this.$nextTick(() => {
        this.$refs.accTable.setCurrentRow(null) // 清除选中的行,会回调 currentChange 事件
        document.querySelector('#accTable .el-table__body-wrapper').scrollTop = 0
      })
      // this.$refs.accTable.setCurrentRow(acc) // 选中新增的行
    },
    // 保存刚刚新增的配件
    onSaveAccClick(rowData, index) {
      const { isSave } = rowData
      if (this.rowAccDataValidate(rowData, index)) {
        rowData.isEdit = false
        if (isSave) {
          // 更新
          DeviceAccessoryApi.saveDeviceAccessory(rowData)
            .then(result => {
              this.onDataChange()
              this.$message.success(result.Message)
              rowData.isEdit = false
            })
            .catch(errMsg => {
              this.$message.error(errMsg)
              console.error(errMsg)
            })
        } else {
          // 新增
          DeviceAccessoryApi.deviceAccessoryAdd(rowData)
            .then(result => {
              this.onDataChange()
              this.$message.success(result.Message)
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
    // 删除刚刚新增但未保存的配件
    onAddDelAccClick(index) {
      this.$delete(this.deviceAccessory, index)
      this.activeAcc = { Id: '' }
    },
    // 编辑数据已经保存的配件
    onEditAccClick(rowData) {
      rowData.isEdit = true
    },
    // 取消配件编辑
    onCancelAccClick(rowData) {
      rowData.isEdit = false
      Object.assign(rowData, this.activeAcc)
    },
    // 删除已经保存的配件
    onDelAccClick(id, deviceSn, index) {
      this.$confirm('是否删除该数据？', '提示', { cancelButtonClass: 'el-button--cancel', closeOnClickModal: false })
        .then(() => {
          DeviceAccessoryApi.removeDeviceAccessory(id, deviceSn)
            .then(result => {
              this.onDataChange()
              this.$message.success(result.Message)
              this.$delete(this.deviceAccessory, index)
              this.activeAcc = { Id: '' }
            })
            .catch(errMsg => {
              this.$message.error(errMsg)
            })
        })
        .catch(err => {
          console.error(err)
          this.$message.warning('取消删除')
        })
    },
    // 新增数据
    async onAddClick() {
      const { SequenceIn, SequenceOut } = await this.getSequence(this.activeAcc.Id, this.baseData)
      this.baseData.unshift({
        Id: null,
        DeviceSn: this.deviceSn,
        DataDefineId: null,
        AssociateDefineId: null,
        DataKey: '',
        ControlName: '',
        // DataValue: '',
        PanelId: this.deviceControlPanelObj.Id,
        AccessoryId: this.activeAcc.Id,
        SequenceIn: SequenceIn, // JSON.stringify({ i: '', x: 0, y: 0, w: 3, h: 1 }),
        SequenceOut: SequenceOut,
        isEdit: true,
        isSave: false,
        validate: this.$_.cloneDeep(this.validate)
      })
      document.querySelector('#accCtrlTable .el-table__body-wrapper').scrollTop = 0
    },
    async getSequence(id) {
      const allCtrData = await DeviceApi.getDeviceControlData(this.deviceSn)
      // 默认的组内排序
      const SequenceInXArray = [0]
      const SequenceInYArray = [0]
      const SequenceInWArray = [9]
      const SequenceInHArray = [3]
      // 默认的组间排序
      const SequenceOutXArray = [0]
      const SequenceOutYArray = [0]
      const SequenceOutWArray = [7]
      const SequenceOutHArray = [6]
      // 遍历所有的控制项，获取组间和组内排序字段
      allCtrData.list.forEach(ele => {
        if (ele.AccessoryId === id) {
          const SequenceIn = JSON.parse(ele.SequenceIn) // 组内排序字段
          SequenceInXArray.push(SequenceIn.x)
          SequenceInYArray.push(SequenceIn.y)
          SequenceInWArray.push(SequenceIn.w)
          SequenceInHArray.push(SequenceIn.h)
        }
        const SequenceOut = JSON.parse(ele.SequenceOut) // 组间排序字段，即配件的排序
        SequenceOutXArray.push(SequenceOut.x)
        SequenceOutYArray.push(SequenceOut.y)
        SequenceOutWArray.push(SequenceOut.w)
        SequenceOutHArray.push(SequenceOut.h)
      })
      const SequenceOut = JSON.stringify({
        i: id,
        x: Math.max(...SequenceOutXArray),
        y: Math.max(...SequenceOutYArray) + 1,
        w: Math.max(...SequenceOutWArray),
        h: Math.max(...SequenceOutHArray)
      })

      const SequenceIn = JSON.stringify({
        i: '',
        x: Math.max(...SequenceInXArray),
        y: Math.max(...SequenceInYArray) + 1,
        w: Math.max(...SequenceInWArray),
        h: Math.max(...SequenceInHArray)
      })
      return { SequenceIn, SequenceOut }
    },
    // 保存刚刚新增的数据
    onSaveClick(rowData, index) {
      const { isSave } = rowData
      if (this.rowDataValidate(rowData, index)) {
        rowData.isEdit = false
        if (isSave) {
          // 更新
          DeviceApi.updateDeviceControlData(rowData)
            .then(result => {
              this.onDataChange()
              this.$message.success(result.Message)
              rowData.isEdit = false
            })
            .catch(errMsg => {
              this.$message.error(errMsg)
              console.error(errMsg)
              this.getDeviceControlData(this.activeAcc.Id)
            })
        } else {
          // 新增
          DeviceApi.deviceControlDataAdd(rowData)
            .then(result => {
              this.onDataChange()
              this.$message.success(result.Message)
              rowData.isEdit = false // 禁止编辑
              rowData.isSave = true // 已经保存
              rowData.Id = result.Id // 设置id
            })
            .catch(errMsg => {
              this.$message.error(errMsg)
              console.error(errMsg)
              this.getDeviceControlData(this.activeAcc.Id)
            })
        }
      }
    },
    // 删除刚刚新增但未保存的数据
    onAddDelClick(index) {
      this.$delete(this.baseData, index)
    },
    // 编辑数据已经保存的数据
    onEditClick(rowData) {
      rowData.isEdit = true
    },
    // 取消控制项编辑
    onCancelClick(rowData) {
      rowData.isEdit = false
      Object.assign(this.baseData, this.activeAcc.List)
    },
    // 删除已经保存的数据
    onDelClick(id, deviceSn, index) {
      this.$confirm('是否删除该数据？', '提示', { cancelButtonClass: 'el-button--cancel', closeOnClickModal: false })
        .then(() => {
          DeviceApi.deleteDeviceControlData(id, deviceSn)
            .then(result => {
              this.onDataChange()
              this.$message.success(result.Message)
              this.$delete(this.baseData, index)
            })
            .catch(errMsg => {
              this.$message.error(errMsg)
            })
        })
        .catch(err => {
          console.error(err)
          this.$message.warning('取消删除')
        })
    },
    // 显示控制数据
    async showControlData(rowData, IState) {
      rowData.IState = IState
      try {
        const result = await DeviceApi.updateDeviceControlData(rowData)
        this.$message.success(result.Message)
      } catch (errMsg) {
        this.$message.error(errMsg)
        console.error(errMsg)
        this.getDeviceControlData(this.activeAcc.Id)
      }
    }
  }
}
</script>
<style type="text/css" lang="scss">
@import '~@assets/scss/variables.scss';
.device_ctrl_area {
  height: 50%;
  display: flex;
  flex-direction: column;
}
.device_ctrl_panel_edit_title {
  line-height: 50px;
  font-size: $font-medium;
  font-weight: 400;
  padding: 0 $spacing-size;
  margin: 30px 0 $spacing-size;
  border-bottom: 2px dotted $border-grey;
  .option-button {
    float: right;
  }
}
.device_ctrl_panel_edit_title:first-child {
  margin-top: 0;
}
</style>
