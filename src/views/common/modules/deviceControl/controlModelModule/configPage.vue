<!--
 * @Author       : jiapeng.Zheng
 * @Date         : 2020-04-07 12:32:57
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-05-19 16:31:53
 * @Description  : 设备控制配置
 -->
<template>
  <div :class="[$style['config-page']]">
    <el-tabs v-model="activeTab" type="card" :class="[$style['config-page-tabs']]" addable @tab-add="onTabAdd" @tab-remove="onTabRemove">
      <!-- 数据定义 -->
      <el-tab-pane :class="[$style['tab-panel']]" :label="$t('deviceDataDefine')" name="dataDefined" v-if="dataDefinedPanelObj">
        <data-defined-panel-edit
          :class="[$style['tab-panel-content']]"
          v-if="activeTab === 'dataDefined'"
          :dataDefinedPanelObj="dataDefinedPanelObj"
          :deviceSn="deviceInfo.DeviceSn"
        ></data-defined-panel-edit>
      </el-tab-pane>
      <!-- 设备控制 -->
      <el-tab-pane :class="[$style['tab-panel']]" :label="$t('deviceControlData')" name="deviceControl" v-if="deviceControlPanelObj">
        <device-controller-panel-edit
          :class="[$style['tab-panel-content']]"
          v-if="activeTab === 'deviceControl'"
          :deviceControlPanelObj="deviceControlPanelObj"
          :deviceSn="deviceInfo.DeviceSn"
        ></device-controller-panel-edit>
      </el-tab-pane>
      <!-- 设备配置信息 -->
      <el-tab-pane :class="[$style['tab-panel']]" :label="$t('deviceConfig')" name="deviceConfig">
        <device-config-panel-edit :class="[$style['tab-panel-content']]" v-if="activeTab === 'deviceConfig'" :deviceSn="deviceInfo.DeviceSn"></device-config-panel-edit>
      </el-tab-pane>
      <!-- 动态添加的 Tab, 允许删除 -->
      <el-tab-pane :class="[$style['tab-panel']]" v-for="(item, key) in dynamicTab" :label="item.label" :name="key" :key="key" :closable="true">
        <component :class="[$style['tab-panel-content']]" :is="item.type" v-if="activeTab === key" :deviceInfo="deviceInfo" :currentDeviceSys="item.data"></component>
      </el-tab-pane>
      <!-- 设备控制日志 -->
      <el-tab-pane :class="[$style['tab-panel']]" :label="$t('deviceCtrlLog')" name="deviceCtrlLog">
        <device-ctrl-log v-if="activeTab === 'deviceCtrlLog'" :deviceInfo="deviceInfo"></device-ctrl-log>
      </el-tab-pane>
      <!-- 水质水量统计 -->
      <el-tab-pane :class="[$style['tab-panel']]" :label="$t('wqtSta')" name="inputData">
        <device-info-input-data :class="[$style['tab-panel-content']]" v-if="activeTab === 'inputData'" :deviceSn="deviceInfo.DeviceSn"></device-info-input-data>
      </el-tab-pane>
      <!-- 巡检记录、维修记录 -->
      <el-tab-pane :class="[$style['tab-panel']]" :label="$t('pollRecord') + '、' + $t('repairrRecord')" name="pollRepairrRecord">
        <device-info-insp-log :class="[$style['tab-panel-content']]" v-if="activeTab === 'pollRepairrRecord'" :deviceSn="deviceInfo.DeviceSn"></device-info-insp-log>
      </el-tab-pane>
    </el-tabs>
    <!-- “新增Tab”弹窗 -->
    <el-dialog :title="$t('adds') + $t('config')" width="30%" :modal-append-to-body="false" :visible.sync="isTabsEditShow">
      <el-form class="valid-form" :model="addTabForm" ref="addTabForm">
        <el-form-item :label="$t('type')" prop="type">
          <el-select v-model="addTabForm.type" :placeholder="$t('pleaseSelect') + $t('type')">
            <el-option v-for="[key, item] of dynamicTabType" v-show="item.enabled" :label="item.label" :value="key" :key="key"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('name')" prop="label">
          <el-input v-model="addTabForm.label" :placeholder="$t('pleaseEnter') + $t('name')"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button type="cancel" @click="onTabAddCancel">{{ $t('cancel') }}</el-button>
        <el-button type="primary" @click="onTabAddConfirm">{{ $t('confirm') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator'
import { ElForm } from 'element-ui/types/form'

import dataDefinedPanelEdit from '@views/device/dataDefinedPanelEdit.vue'
import deviceConfigPanelEdit from '@views/device/deviceConfigPanelEdit.vue'
import deviceControllerPanelEdit from '@views/device/deviceControllerPanelEdit.vue'
import deviceSysEdit from '@views/device/deviceSysEdit.vue'
import deviceInfoInspLog from '@views/device/deviceInfoInspLog.vue'
import deviceInfoInputData from '@views/device/deviceInfoInputData.vue'
import deviceCtrlLog from '@views/device/deviceCtrlLog.vue'

import { DEVICE_DATADEFINE_PANEL, DEVICE_CONTROLDATA_PANEL } from '@constants/panelConfig'
import PanelApi from '@helper/apis/panel.js'
import DeviceSysApi from '@helper/apis/deviceSys.js'

type DynamicTabType = 'device-sys-edit' // | 'other' // 允许动态添加的 Tab 类型,同时也是该类型的“组件名称”
type Tab = { label: string; type: DynamicTabType; Id: number; data: DeviceSysVO } // 动态添加的 Tab
type TabTypes = { label: string; enabled: boolean; tabAddCallBack: () => Promise<void>; tabDelCallBack: () => Promise<void> } // 动态添加的 Tab 类型所包含的属性

@Component({ components: { dataDefinedPanelEdit, deviceConfigPanelEdit, deviceControllerPanelEdit, deviceSysEdit, deviceInfoInspLog, deviceInfoInputData, deviceCtrlLog } })
export default class ConfigPage extends Vue {
  // ------------------------ prop ------------------------
  @Prop({
    default() {
      return { DeviceSn: '' }
    }
  })
  deviceInfo: DeviceVO
  @Prop({
    default: false
  })
  isConfigDataChange: boolean
  // ------------------------ data ------------------------
  isTabsEditShow = false // 是否显示“新增配置”弹窗
  activeTab: 'dataDefined' | 'deviceControl' | 'deviceConfig' | 'inputData' | 'pollRepairrRecord' | 'deviceCtrlLog' = 'dataDefined' // 激活的Tab
  dynamicTab: { [propName: string]: Tab } = {} // 动态添加的 tab
  dynamicTabType: Map<DynamicTabType, TabTypes> = new Map() // 允许动态添加的 tab
  // 要新增的tab
  addTabForm: Tab = {
    Id: null,
    label: '', // 用户自定义的名称
    type: 'device-sys-edit', // 用户手动选择的类型
    data: null
  }
  delTabForm: Tab = null // 要删除的tab

  // ------------------------ computed ------------------------
  get isChange() {
    return this.$store.state.deviceConfig.isChange
  }
  // 数据定义面板
  get dataDefinedPanelObj(): DevicePanelBO | null {
    return this.$store.getters['devicePanel/getPanelObj'](DEVICE_DATADEFINE_PANEL)
  }
  // 设备控制面板
  get deviceControlPanelObj(): DevicePanelBO | null {
    return this.$store.getters['devicePanel/getPanelObj'](DEVICE_CONTROLDATA_PANEL)
  }
  // ------------------------  Watch  ------------------------
  @Watch('isChange')
  onIsChangeChange(newValue: boolean) {
    this.$emit('update:isConfigDataChange', newValue)
  }
  // ------------------------ Lifecycle ------------------------
  created() {
    this.dynamicTabType.set('device-sys-edit', { label: this.$t('deviceSys').toString(), enabled: true, tabAddCallBack: this.onSysAdd, tabDelCallBack: this.onSysDel })
    this.$store.commit('deviceConfig/setIsChange', false) // 重置 setIsChange
    this.autoAddLostPanel()
    this.getSubSys()
  }
  // ------------------------  面板api  ------------------------
  // 自动添加缺少的面板
  autoAddLostPanel() {
    // 添加缺少的“数据定义”面板
    if (this.dataDefinedPanelObj === null) {
      PanelApi.addPanel(DEVICE_DATADEFINE_PANEL, String(this.$t('deviceDataDefine')), this.deviceInfo.DeviceSn)
        .then(result => {
          this.$store.commit('devicePanel/addPanel', result)
        })
        .catch(errMsg => {
          this.$message.error(String(errMsg))
          console.error(errMsg)
        })
    }
    // 添加缺少的“设备控制”面板
    if (this.deviceControlPanelObj === null) {
      PanelApi.addPanel(DEVICE_CONTROLDATA_PANEL, String(this.$t('deviceControlData')), this.deviceInfo.DeviceSn)
        .then(result => {
          this.$store.commit('devicePanel/addPanel', result)
        })
        .catch(errMsg => {
          this.$message.error(String(errMsg))
          console.error(errMsg)
        })
    }
  }
  // ------------------------ 子系统api ------------------------
  // 获取设备子系统
  getSubSys() {
    this.dynamicTab = {}
    DeviceSysApi.getDeviceSystemList(this.deviceInfo.DeviceSn)
      .then(res => {
        for (const sys of res.List) {
          const tab: Tab = {
            Id: sys.Id,
            type: 'device-sys-edit',
            label: sys.Name,
            data: sys
          }
          this.$set(this.dynamicTab, `deviceSys_${sys.Id}`, tab)
        }
      })
      .catch(errMsg => {
        console.error(errMsg)
        this.$message.error(String(errMsg))
      })
  }
  // 新增设备子系统
  async onSysAdd() {
    try {
      await DeviceSysApi.addDeviceSystem({ DeviceSn: this.deviceInfo.DeviceSn, Name: this.addTabForm.label })
      this.$message.success(`新增【${this.addTabForm.label}】子系统成功`)
      this.getSubSys() // 重新获取子系统
    } catch (error) {
      this.$message.error(`新增【${this.addTabForm.label}】子系统失败：${String(error)}`)
    }
  }
  // 删除设备子系统
  async onSysDel() {
    try {
      await DeviceSysApi.removeDeviceSystem(this.delTabForm.Id, this.deviceInfo.DeviceSn)
      this.$message.success(`删除【${this.delTabForm.label}】子系统成功`)
      this.getSubSys() // 重新获取子系统
    } catch (error) {
      this.$message.error(`删除【${this.delTabForm.label}】子系统失败：${String(error)}`)
    }
  }
  // ------------------------ tab组件事件 ------------------------
  // Tab 删除事件
  onTabRemove(tabName) {
    const delTab = this.dynamicTab[tabName]
    this.$confirm(`是否删除【${delTab.label}】？`, '提示')
      .then(() => {
        const delTabType = this.dynamicTabType.get(delTab.type)
        if (delTabType) {
          this.delTabForm = delTab
          delTabType.tabDelCallBack().then(() => {
            this.isTabsEditShow = false
          })
        } else {
          this.$message.error('删除失败，不存在该类型的标签')
        }
      })
      .catch(err => {
        console.error(err)
      })
  }
  // Tab 添加事件
  onTabAdd() {
    this.isTabsEditShow = true
  }
  // ------------------------ dialog事件 ------------------------
  // Tab 新增弹窗确定事件
  onTabAddConfirm() {
    const addTabType = this.dynamicTabType.get(this.addTabForm.type)
    if (addTabType) {
      addTabType.tabAddCallBack().then(() => {
        this.isTabsEditShow = false
        ;(this.$refs.addTabForm as ElForm).resetFields()
      })
    } else {
      this.$message.error('新增失败，不存在该类型的标签')
    }
  }
  // Tab 新增弹窗取消事件
  onTabAddCancel() {
    this.isTabsEditShow = false
    ;(this.$refs.addTabForm as ElForm).resetFields()
  }
}
</script>
<style lang="scss" module>
.config-page {
  height: 100%;
  .config-page-tabs {
    .tab-panel {
      .tab-panel-content {
        height: 100%;
      }
    }
  }
}
</style>
