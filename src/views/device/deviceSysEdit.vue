<!--
 * @Author: jiapeng.Zheng
 * @Date: 2019-08-26 14:01:37
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-04-10 10:57:35
 * @Description: 设备子系统编辑
 -->
<template>
  <el-row :gutter="10">
    <div class="device_ctrl_area">
      <h1 class="device_sys_edit_title">
        {{ $t('accessory') }}
        <div class="option-button">
          <el-button icon="plus" size="small" type="primary" @click="onAccAddClick()">{{ $t('add') }}</el-button>
        </div>
      </h1>
      <!-- 配件 table -->
      <el-table
        v-loading="accessoryLoading"
        :data="deviceSysAccessory"
        border
        height="200"
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
                <el-button @click="onDelAccClick(scope.row.Id, scope.$index)" type="danger" size="small">{{ $t('delete') }}</el-button>
                <el-button @click="onCancelAccClick(scope.row, scope.$index)" type="warning" size="small">{{ $t('cancel') }}</el-button>
              </template>
              <!-- 新增 -->
              <template v-else>
                <el-button @click="onAddDelAccClick(scope.$index)" type="warning" size="small">{{ $t('cancel') }}</el-button>
              </template>
            </template>
            <!-- 显示 -->
            <template v-else>
              <el-button @click="onEditAccClick(scope.row, scope.$index)" type="primary" size="small">{{ $t('edit') }}</el-button>
              <el-button @click="onDelAccClick(scope.row.Id, scope.$index)" type="danger" size="small">{{ $t('delete') }}</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
      <!-- 配件 table END -->
    </div>
    <!-- 配件控制项 table -->
    <div class="device_ctrl_area" v-if="activeSysAcc && activeSysAcc.Id">
      <h1 class="device_sys_edit_title">
        【{{ activeSysAcc.Name }}】{{ $t('accessory') }}{{ $t('controlItem') }}
        <div class="option-button">
          <el-button icon="plus" size="small" type="primary" @click="onAddClick()">{{ $t('add') }}</el-button>
        </div>
      </h1>
      <el-table v-loading="baseDataLoading" :data="systemControlData" border height="200" id="accCtrlTable">
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
              <el-select
                v-model="scope.row.AssociateDefineId"
                placeholder="请选择关联数据"
                @visible-change="visibleChange"
                @change="associateDefineIdChange(scope.row)"
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
                <el-button @click="onDelClick(scope.row.Id, scope.$index)" type="danger" size="small">{{ $t('delete') }}</el-button>
                <el-button @click="onCancelClick(scope.row, scope.$index)" type="warning" size="small">{{ $t('cancel') }}</el-button>
              </template>
              <!-- 新增 -->
              <template v-else>
                <el-button @click="onAddDelClick(scope.$index)" type="warning" size="small">{{ $t('cancel') }}</el-button>
              </template>
            </template>
            <!-- 显示 -->
            <template v-else>
              <el-button @click="onEditClick(scope.row, scope.$index)" type="primary" size="small">{{ $t('edit') }}</el-button>
              <el-button @click="onDelClick(scope.row.Id, scope.$index)" type="danger" size="small">{{ $t('delete') }}</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
      <!-- 配件控制项 table END -->
    </div>
  </el-row>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import IconList from '@views/common/IconList.vue'

import { DEFAULT_ACC_ICON } from '@constants/deviceConfig'

import $_ from '@helper/lodash.js'
import DeviceSysApi from '@helper/apis/deviceSys.js'
import DeviceDataDefineApi from '@helper/apis/deviceDataDefine.js'

@Component({ components: { IconList } })
export default class DeviceSysEdit extends Vue {
  // 设备信息
  @Prop({
    required: true,
    type: Object,
    default() {
      return {}
    }
  })
  deviceInfo: DeviceVO
  // 设备子系统
  @Prop({
    required: true,
    type: Object,
    default() {
      return { Accessories: [], DeviceSn: '', Id: null, Name: '', Order: 0 }
    }
  })
  currentDeviceSys: DeviceSysVO

  accessoryLoading = false
  baseDataLoading = false
  defaultAccIcon: string = DEFAULT_ACC_ICON
  deviceSn = ''
  deviceSysAccessory: Array<AccessoriesBO> = [] // 设备子系统配件
  /**
   * 当前选中的配件，从配件列表中copy过来的，
   * 确保编辑配件和控制项时不会影响到当前的值
   * 当取消编辑时，使用该值覆盖要取消编辑的配件/控制项
   */
  activeSysAcc: AccessoriesBO = null
  systemControlData: Array<SystemControlBO> = []
  dataDefine: Array<DeviceDataDefinedVO> = []
  filterDataDefineName = ''
  validate: ValidateBO = {
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
    }
  }

  get filterDataDefine() {
    return this.dataDefine.filter(ele => {
      return ele.DataName.indexOf(this.filterDataDefineName) > -1 || ele.DataKey.indexOf(this.filterDataDefineName) > -1
    })
  }
  /**
   * 当前子系统所有的控制数据
   */
  get allDeviceSysAccessoryControlData() {
    const allCtrData: Array<SystemControlDTO> = []
    // 遍历配件
    this.deviceSysAccessory.forEach(acc => {
      if (this.activeSysAcc.Id === acc.Id) {
        this.systemControlData.forEach(ctrData => {
          allCtrData.push(ctrData)
        })
      } else {
        // 遍历配件中的控制项目
        acc.List.forEach(ctrData => {
          allCtrData.push(ctrData)
        })
      }
    })
    return allCtrData
  }

  @Watch('activeSysAcc')
  onActiveAccChange(newVal: AccessoriesBO) {
    if (newVal && newVal.Id) {
      this.getDeviceSystemAceessoryControlData(newVal.Id)
    } else {
      this.systemControlData = [] // 清除配件的控制项
    }
  }

  // components: {
  //   IconList: resolve => require.ensure([], () => resolve(require('@views/common/IconList')), 'iconList')
  // },

  created() {
    this.deviceSn = this.deviceInfo.DeviceSn // this.$route.params.id
    // ------------------- 获取数据定义 -------------------
    DeviceDataDefineApi.getDeviceDataDefine(this.deviceSn)
      .then((result: { list: Array<DeviceDataDefinedVO> }) => {
        this.dataDefine = result.list
      })
      .catch(errMsg => {
        console.error(errMsg)
        this.$message.error(String(errMsg))
      })
    this.handRefresh()
  }

  // -----------------Refresh--------------------
  handRefresh() {
    // ------------------- 获取子系统配件列表 -------------------
    this.deviceSysAccessory = []
    this.accessoryLoading = true
    DeviceSysApi.getSystemAccessory(this.deviceSn, this.currentDeviceSys.Id)
      .then((result: { List: Array<AccessoriesVO> }) => {
        result.List.forEach(item => {
          this.deviceSysAccessory.push({
            ...item,
            ICON: item.ICON || this.defaultAccIcon,
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
  }
  // 当前数据发生了变化
  onDataChange() {
    this.$store.commit('deviceConfig/setIsChange', true)
  }
  // -------------- 获取控制数据 -------------------
  getDeviceSystemAceessoryControlData(accessoryId) {
    this.systemControlData = []
    this.baseDataLoading = true
    DeviceSysApi.getDeviceSystemAceessoryControlData(this.deviceSn, accessoryId)
      .then((result: { List: Array<SystemControlVO> }) => {
        result.List.forEach(item => {
          // item.DataDefineId = item.DataDefineId // String(item.DataDefineId)
          item.AssociateDefineId = item.AssociateDefineId ? item.AssociateDefineId : null // 确保 AssociateDefineId 不为 0
          this.systemControlData.push({
            ...item,
            isEdit: false,
            isSave: true,
            validate: $_.cloneDeep(this.validate)
          })
        })
        this.$set(this.activeSysAcc, 'List', JSON.parse(JSON.stringify(this.systemControlData))) // 更新其中的控制项
      })
      .catch(errMsg => {
        this.$message.error(errMsg)
        console.error(errMsg)
      })
      .fin(() => {
        this.baseDataLoading = false
      })
  }
  // ========================== validate ==========================
  tooltipShow(rowData: AccessoriesBO | SystemControlBO, modelName: string, msg: string) {
    rowData.validate[modelName].isValidate = true
    rowData.validate[modelName].validateMsg = msg
  }
  tooltipHide(rowData: AccessoriesBO | SystemControlBO, modelName: string) {
    rowData.validate[modelName].isValidate = false
  }
  inputValidate(rowData, modelName: string) {
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
  }
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
  }
  rowAccDataValidate(rowData) {
    let isValidate = false
    if (this.inputValidate(rowData, 'Name') && this.inputValidate(rowData, 'ICON')) {
      isValidate = true
    }
    return isValidate
  }
  // ========================== 配件 ==========================
  // 配件列表行切换事件
  currentChange(currentRow) {
    this.activeSysAcc = JSON.parse(JSON.stringify(currentRow)) || { Id: '' }
  }
  // 新增配件
  onAccAddClick() {
    const acc: AccessoriesBO = {
      Id: '',
      // DeviceSn: this.deviceSn,
      Name: '',
      List: [],
      ICON: this.defaultAccIcon,
      SystemId: this.currentDeviceSys.Id,
      isEdit: true,
      isSave: false,
      validate: $_.cloneDeep(this.validate)
    }
    this.deviceSysAccessory.unshift(acc) // 添加新的未保存的配件
    // this.activeSysAcc = acc   // 当前默认的
    this.$nextTick(() => {
      const $accTable = this.$refs.accTable as any
      $accTable.setCurrentRow(null) // 清除选中的行,会回调 currentChange 事件
      document.querySelector('#accTable .el-table__body-wrapper').scrollTop = 0
    })
  }
  // 保存刚刚新增的配件
  onSaveAccClick(rowData: AccessoriesBO) {
    const { isSave } = rowData
    if (this.rowAccDataValidate(rowData)) {
      rowData.isEdit = false
      if (isSave) {
        // 更新
        DeviceSysApi.updateDeviceSystemAccessory(rowData, this.deviceSn)
          .then(result => {
            this.onDataChange()
            this.$message.success(result.message)
            rowData.isEdit = false
            this.activeSysAcc = JSON.parse(JSON.stringify(rowData))
          })
          .catch(errMsg => {
            this.$message.error(errMsg)
            console.error(errMsg)
          })
      } else {
        // 新增
        DeviceSysApi.addDeviceSystemAccessory(rowData, this.deviceSn) // DeviceSn, Name, ICON, SystemId
          .then(result => {
            this.onDataChange()
            this.$message.success(result.message)
            rowData.isEdit = false // 禁止编辑
            rowData.isSave = true // 已经保存
            rowData.Id = result.Id // 设置id
            this.activeSysAcc = JSON.parse(JSON.stringify(rowData))
          })
          .catch(errMsg => {
            this.$message.error(errMsg)
            console.error(errMsg)
          })
      }
    }
  }
  // 删除刚刚新增但未保存的配件
  onAddDelAccClick(index) {
    this.$delete(this.deviceSysAccessory, index)
    this.activeSysAcc = null // { Id: '' }
  }
  // 删除已经保存的配件
  onDelAccClick(id, index) {
    this.$confirm('是否删除该数据？', '提示', { cancelButtonClass: 'el-button--cancel', closeOnClickModal: false })
      .then(() => {
        DeviceSysApi.deleteDeviceSystemAccessory(id, this.deviceSn)
          .then(result => {
            this.onDataChange()
            this.$message.success(result.message)
            this.$delete(this.deviceSysAccessory, index)
            this.activeSysAcc = null // { Id: '' }
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
  // ========================== 配件控制项 ==========================

  // 新增配件控制项目
  async onAddClick() {
    const { SequenceIn, SequenceOut } = await this.getSequence(this.activeSysAcc.Id)
    this.systemControlData.unshift({
      Id: null,
      DataDefineId: null, // '',
      AssociateDefineId: null, // '',
      DataValue: '',
      DataKey: '',
      AssociateKey: '',
      ControlName: '',
      AccessoryId: this.activeSysAcc.Id,
      SequenceIn: SequenceIn, // JSON.stringify({ i: '', x: 0, y: 0, w: 3, h: 1 }),
      SequenceOut: SequenceOut,
      isEdit: true,
      isSave: false,
      validate: $_.cloneDeep(this.validate),
      AutoControl: true
    })
    document.querySelector('#accCtrlTable .el-table__body-wrapper').scrollTop = 0
  }
  // 控制项数据标识 change 事件）
  dataDefineIdChange(rowData: SystemControlBO) {
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
  }
  // 控制项关联数据标识 change 事件
  associateDefineIdChange(rowData: SystemControlBO) {
    // AssociateDefineId el-select 设置了 clearable ,导致 AssociateDefineId change 时可能为空，需判断不为空的情况
    if (rowData.AssociateDefineId) {
      const { DataKey } = this.filterDataDefine.find(ele => {
        return ele.Id === rowData.AssociateDefineId
      })
      rowData.AssociateKey = DataKey // 主要用来显示,不会传到后台，后台更新控制类型只需要关联的数据定义ID(AssociateDefineId)
    }
  }
  // 控制项数据标识 Filter 事件
  selectFilter = $_.throttle(dataName => {
    if (this.dataDefine.findIndex((ele: DeviceDataDefinedVO) => ele.DataKey === dataName) > -1) {
      this.filterDataDefineName = ''
    } else {
      this.filterDataDefineName = dataName
    }
  }, 500)

  // 控制项数据标识下拉 展开与隐藏事件
  visibleChange(isVisible) {
    if (!isVisible) {
      this.filterDataDefineName = ''
    }
  }
  async getSequence(id) {
    const allCtrData = this.allDeviceSysAccessoryControlData // await DeviceApi.getDeviceSystemAceessoryControlData(this.deviceSn)
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
    allCtrData.forEach(ele => {
      console.log(ele.ControlName)
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
  }
  // 保存刚刚新增的配件控制项
  onSaveClick(rowData: SystemControlBO) {
    const { isSave } = rowData
    if (this.rowDataValidate(rowData)) {
      rowData.isEdit = false
      if (isSave) {
        // 更新
        DeviceSysApi.updateDeviceSystemControlData(this.deviceSn, rowData)
          .then(result => {
            this.onDataChange()
            this.$message.success(result.message)
            rowData.isEdit = false
            this.getDeviceSystemAceessoryControlData(this.activeSysAcc.Id)
          })
          .catch(errMsg => {
            this.$message.error(String(errMsg))
            console.error(errMsg)
          })
      } else {
        // 新增
        DeviceSysApi.addDeviceSystemControlData(this.deviceSn, rowData)
          .then(result => {
            this.onDataChange()
            this.$message.success(result.message)
            rowData.isEdit = false // 禁止编辑
            rowData.isSave = true // 已经保存
            rowData.Id = result.Id // 设置id
            this.getDeviceSystemAceessoryControlData(this.activeSysAcc.Id)
          })
          .catch(errMsg => {
            this.$message.error(String(errMsg))
            console.error(errMsg)
          })
      }
    }
  }
  // 删除刚刚新增但未保存的配件控制项
  onAddDelClick(index) {
    this.$delete(this.systemControlData, index)
  }
  // 编辑数据已经保存的配件
  onEditAccClick(rowData: AccessoriesBO) {
    rowData.isEdit = true
  }
  // 取消配件编辑
  onCancelAccClick(rowData: AccessoriesBO) {
    rowData.isEdit = false
    Object.assign(rowData, this.activeSysAcc)
  }
  // 编辑数据已经保存的配件控制项
  onEditClick(rowData: SystemControlBO) {
    rowData.isEdit = true
  }
  // 取消控制项编辑
  onCancelClick(rowData: SystemControlBO) {
    rowData.isEdit = false
    Object.assign(this.systemControlData, this.activeSysAcc.List)
  }
  // 删除已经保存的配件控制项
  onDelClick(id, index) {
    this.$confirm('是否删除该数据？', '提示', { cancelButtonClass: 'el-button--cancel', closeOnClickModal: false })
      .then(() => {
        DeviceSysApi.deleteDeviceSystemControlData(this.deviceSn, id)
          .then(result => {
            this.onDataChange()
            this.$message.success(result.message)
            this.$delete(this.systemControlData, index)
            this.getDeviceSystemAceessoryControlData(this.activeSysAcc.Id)
          })
          .catch(errMsg => {
            this.$message.error(String(errMsg))
          })
      })
      .catch(err => {
        console.error(err)
        this.$message.warning('取消删除')
      })
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
.device_sys_edit_title {
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
.device_sys_edit_title:first-child {
  margin-top: 0;
}
</style>
