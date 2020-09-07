<!--
 * @Author: jiapeng.Zheng
 * @Date: 2018-12-14 17:38:07
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-31 13:41:45
 * @Description: 设备类型
 -->
<template>
  <div class="module-content" style="height: calc(100% - 10px)">
    <!-- 临时添加的关闭按钮 -->
    <i class="el-icon-close module-content-close" :title="$t('close')" @click="$vueRouterGenerator.goBackByHistoryPath($route.fullPath)"></i>
    <div class="panel panel-default" style="height:100%">
      <div class="panel-body" style="height:100%">
        <div class="sys-device-type">
          <el-row class="info-row" :gutter="5">
            <el-col class="info-col left" :xs="24" :sm="24" :md="8" :lg="8">
              <EasyScrollbar :barOption="barOption">
                <el-card class="box-card">
                  <div slot="header" class="clearfix">
                    <span>{{ $t('deviceType') }}</span>
                  </div>
                  <el-form class="form-group" :inline="true" @submit.native.prevent>
                    <el-form-item>
                      <el-input placeholder="输入设备类型名称进行过滤" v-model="filterText"></el-input>
                    </el-form-item>
                    <el-form-item>
                      <el-button @click="onAddClick" type="primary">{{ $t('add') }}</el-button>
                    </el-form-item>
                  </el-form>
                  <el-tree
                    class="filter-tree"
                    v-loading="loading"
                    :data="deviceTypeData"
                    :props="defaultProps"
                    :show-checkbox="false"
                    node-key="Id"
                    default-expand-all
                    :highlight-current="true"
                    :expand-on-click-node="false"
                    :filter-node-method="filterNode"
                    :render-content="renderContent"
                    @node-click="handleNodeClick"
                    ref="deviceTypeTree"
                  ></el-tree>
                </el-card>
              </EasyScrollbar>
            </el-col>
            <el-col class="info-col right" :xs="24" :sm="24" :md="16" :lg="16">
              <EasyScrollbar :barOption="barOption">
                <div class="device-type-content">
                  <!-- 类型图片 -->
                  <device-type-img :activeNode="activeNode"></device-type-img>
                  <!-- 升级文件 -->
                  <device-type-upgrade-file :activeNode="activeNode" @handleRefresh="handleRefresh"></device-type-upgrade-file>
                  <!-- 统计配置 -->
                  <device-type-statistics-info :activeNode="activeNode"></device-type-statistics-info>
                  <!-- 模式配置 -->
                  <device-type-schema :activeNode="activeNode"></device-type-schema>
                  <!-- 模板,tplClick是为了改变 activeTpl -->
                  <device-type-template :activeNode="activeNode" :activeTpl="activeTpl" @tplClick="tplClick"></device-type-template>
                  <!-- 配置文件 -->
                  <config-tpl v-show="activeTpl.Id" :activeNode="activeNode" :activeTpl="activeTpl" @handleRefresh="handleRefresh"></config-tpl>
                  <!-- 面板 panelClick 是为了改变 activePanel -->
                  <panel-tpl
                    v-show="activeTpl.Id"
                    :activeNode="activeNode"
                    :activeTpl="activeTpl"
                    :activePanel="activePanel"
                    @panelClick="panelClick"
                    @handleRefresh="handleRefresh"
                  ></panel-tpl>
                  <!-- 数据定义面板 -->
                  <data-define-panel-tpl
                    v-show="activePanel.PanelTypeId === dataDefinePanelId"
                    :activeNode="activeNode"
                    :activeTpl="activeTpl"
                    :activePanel="activePanel"
                  ></data-define-panel-tpl>
                  <!-- 参数面板 -->
                  <param-panel-tpl
                    v-show="activePanel.PanelTypeId === deviceParamPanelId"
                    :activeNode="activeNode"
                    :activeTpl="activeTpl"
                    :activePanel="activePanel"
                    @handleRefresh="handleRefresh"
                  ></param-panel-tpl>
                  <!-- 控制面板 -->
                  <controller-panel-tpl
                    v-show="activePanel.PanelTypeId === controDataPanelId"
                    :activeNode="activeNode"
                    :activeTpl="activeTpl"
                    :activePanel="activePanel"
                    @handleRefresh="handleRefresh"
                  ></controller-panel-tpl>
                </div>
              </EasyScrollbar>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
    <el-dialog :visible="isDialogVisible" width="30%" @close="isDialogVisible = false" class="edit-dialog" :show-close="false" :close-on-click-modal="false">
      <span slot="title" class="el-dialog__title">{{ $t('adds') + $t('deviceType') }}</span>
      <el-form :model="fillForm" :rules="rules" ref="fillForm">
        <div class="form-group col-sm-11">
          <el-form-item label="图标" prop="ICON">
            <el-popover ref="popoverIcon" placement="right" trigger="hover">
              <icon-list type="deviceType" @iconClick="iconClick"></icon-list>
            </el-popover>
            <icon v-popover:popoverIcon class="input-icon icons" :name="fillForm.ICON"></icon>
          </el-form-item>
        </div>
        <div class="form-group col-sm-11">
          <el-form-item :label="$t('name')" prop="DeviceTypeName">
            <el-input v-model="fillForm.DeviceTypeName"></el-input>
          </el-form-item>
        </div>
        <div class="form-group col-sm-11">
          <el-form-item :label="$t('order')" prop="Order">
            <el-input v-model="fillForm.Order"></el-input>
          </el-form-item>
        </div>
        <div class="form-group col-sm-11">
          <el-form-item :label="$t('description')" prop="Description">
            <el-input v-model="fillForm.Description"></el-input>
          </el-form-item>
        </div>
      </el-form>
      <span slot="footer">
        <el-button type="cancel" @click="isDialogVisible = false">{{ $t('cancel') }}</el-button>
        <el-button type="primary" @click="onSureClick">{{ $t('confirm') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { $utils } from '@helper'
import { DEVICE_DATADEFINE_PANEL, DEVICE_PARAM_PANEL, DEVICE_CONTROLDATA_PANEL } from '@constants/panelConfig'
import { BAR_OPTION } from '@constants/easyScrollbarConfig/index.js'

let self
let treeNameEleContext

export default {
  name: 'device-type',

  props: {},

  data() {
    return {
      loading: true,
      isDialogVisible: false,
      fillForm: {
        ICON: 'deviceType/chtank',
        DeviceTypeName: '',
        Description: '',
        Order: 0
      },
      rules: {
        ICON: [
          {
            required: true,
            message: this.$t('pleaseEnter') + this.$t('icon'), // '请输入ICON',
            trigger: 'blur'
          }
        ],
        DeviceTypeName: [
          {
            required: true,
            message: this.$t('pleaseEnter') + this.$t('deviceType') + this.$t('name'), // '请输入设备类型名称',
            trigger: 'blur'
          },
          {
            min: 2,
            max: 50,
            message: '长度在 2 到 50 个字符',
            trigger: 'blur'
          }
        ],
        Description: [
          {
            min: 2,
            max: 50,
            message: '长度在 2 到 50 个字符',
            trigger: 'blur'
          }
        ]
      },
      tableData: [],
      deviceTypeData: [],
      filterText: '',
      defauleLabelText: '',
      defaultProps: {
        children: 'children',
        label: 'DeviceTypeName'
      },
      validate: {
        DeviceTypeName: {
          isValidate: false,
          validateMsg: ''
        }
      },
      originalValue: '', // 用于保存编辑框的原始值
      // 激活的树形 node
      activeNode: {
        data: {}
        // DeviceTypeName: ''
      },
      activeTpl: {
        TempName: ''
      },
      activePanel: {},
      dataDefinePanelId: DEVICE_DATADEFINE_PANEL,
      deviceParamPanelId: DEVICE_PARAM_PANEL,
      controDataPanelId: DEVICE_CONTROLDATA_PANEL,
      // 滚动条属性
      barOption: BAR_OPTION
    }
  },
  computed: {},

  watch: {
    filterText(val) {
      this.$refs.deviceTypeTree.filter(val)
    }
  },

  components: {
    IconList: resolve => require.ensure([], () => resolve(require('@views/common/IconList')), 'iconList'),
    DeviceTypeImg: resolve => require.ensure([], () => resolve(require('@views/system/deviceTypeImg')), 'deviceTypeImg'),
    DeviceTypeUpgradeFile: resolve => require.ensure([], () => resolve(require('@views/system/deviceTypeUpgradeFile')), 'deviceTypeUpgradeFile'),
    DeviceTypeTemplate: resolve => require.ensure([], () => resolve(require('@views/system/deviceTypeTemplate')), 'deviceTypeTemplate'),
    DeviceTypeStatisticsInfo: resolve => require.ensure([], () => resolve(require('@views/system/deviceTypeStatisticsInfo')), 'deviceTypeStatisticsInfo'),
    DeviceTypeSchema: resolve => require.ensure([], () => resolve(require('@views/system/deviceTypeSchema')), 'deviceTypeSchema'),
    ConfigTpl: resolve => require.ensure([], () => resolve(require('@views/template/deviceType/configTpl')), 'configTpl'),
    PanelTpl: resolve => require.ensure([], () => resolve(require('@views/template/deviceType/panelTpl')), 'panelTpl'),
    DataDefinePanelTpl: resolve => require.ensure([], () => resolve(require('@views/template/deviceType/dataDefinePanelTpl')), 'dataDefinePanelTpl'),
    ParamPanelTpl: resolve => require.ensure([], () => resolve(require('@views/template/deviceType/paramPanelTpl')), 'paramPanelTpl'),
    ControllerPanelTpl: resolve => require.ensure([], () => resolve(require('@views/template/deviceType/controllerPanelTpl')), 'controllerPanelTpl')
  },

  created() {
    self = this
    this.handleRefresh()
  },

  filters: {},

  methods: {
    /* ----------------------------refresh---------------------------- */
    /**
     * 表单刷新
     * @param {Number} activeNode   选中的设备类型
     * @param {Object} activeTpl    选中的设备类型模板
     * @param {Object} activePanel  选中的设备类型模板中的面板
     */
    handleRefresh(activeNode = { data: {} }, activeTpl, activePanel) {
      self.loading = true
      self.tableData = []

      this.$store
        .dispatch('getDeviceType')
        .then(result => {
          result.List.forEach(item => {
            self.tableData.push({
              ...item,
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
            if (activeNode.data.Id === item.Id) {
              this.$nextTick(() => {
                activeNode.data = item
                self.activeNode = activeNode
                // this.$refs.deviceTypeTree.store.setCurrentNode(self.activeNode)
              })
            }
          })
          self.deviceTypeData = $utils.treeDataFormat({
            data: self.tableData,
            idName: 'Id',
            parentIdName: 'ParentId',
            parentNodeflag: null
          })
          if (activeTpl) {
            this.activeTpl = activeTpl
          }
          if (activePanel) {
            this.activePanel = activePanel
          }
        })
        .catch(errMsg => {
          console.error(errMsg)
          self.$message.error(String(errMsg))
        })
        .finally(() => {
          self.loading = false
        })
    },

    // icon图标click事件
    iconClick(iconName) {
      this.$refs.popoverIcon.doToggle()
      this.fillForm.ICON = iconName
    },

    /* ---------------------------- tree component init --------------- */

    // 树节点筛选方法
    filterNode(value, data) {
      if (!value) return true
      const dataVal = String(data[self.defaultProps.label]).toLowerCase()
      const searchVal = String(value).toLowerCase()
      return dataVal.indexOf(searchVal) !== -1
    },

    // 树节点的内容区的渲染 Function
    renderContent(h, { node, data, store }) {
      // 删除按钮
      const removeBtn = (
        <el-button size="mini" type="danger" on-click={() => self.remove(store, data)}>
          {self.$t('delete')}
        </el-button>
      )
      // 删除按钮
      const deleteBtn = (
        <el-button size="mini" type="danger" on-click={() => self.delete(data)}>
          {self.$t('delete')}
        </el-button>
      )
      // 取消按钮
      const cancelBtn = (
        <el-button size="mini" type="danger" on-click={() => self.cancel(data)}>
          {self.$t('cancel')}
        </el-button>
      )
      // 保存按钮
      const saveBtn = (
        <el-button size="mini" type="success" on-click={() => self.save(data)}>
          {self.$t('save')}
        </el-button>
      )
      // 添加按钮
      const appendBtn = (
        <el-button size="mini" type="primary" on-click={() => self.append(store, data)}>
          {self.$t('append')}
        </el-button>
      )
      // 编辑按钮
      const editBtn = (
        <el-button size="mini" type="primary" on-click={() => self.edit(data)}>
          {self.$t('edit')}
        </el-button>
      )

      let treeNameEle = (
        <span>
          <span class="tree-name">
            <icon name={data.ICON} />
            {node.label}
          </span>
        </span>
      )
      let treeBtnEle = (
        <span style="float: right; margin-right: 35px">
          {appendBtn}
          {editBtn}
          {deleteBtn}
        </span>
      )

      let resultEle

      if (data.isEdit) {
        treeNameEle = (
          <el-tooltip
            effect="danger"
            placement="top"
            manual={true}
            value={data.validate[self.defaultProps.label].isValidate}
            content={`名称${data.validate[self.defaultProps.label].validateMsg}`}
            ref="tooltip"
            on-tooltipIsShow={val => {
              data.validate[self.defaultProps.label].isValidate = val
            }}
          >
            <el-input style="margin-right:10px" value={data[self.defaultProps.label]} on-input={val => self.change(data, val)} />
          </el-tooltip>
        )
        if (data.isSave) {
          treeBtnEle = (
            <span style="">
              {saveBtn}
              {cancelBtn}
            </span>
          )
        } else {
          treeBtnEle = (
            <span style="">
              {saveBtn}
              {removeBtn}
            </span>
          )
        }
        resultEle = (
          <div style="display:inline-block;width:100%;padding-right:135px;">
            {treeNameEle}
            {treeBtnEle}
          </div>
        )
      } else {
        resultEle = (
          <div style="display: inline-block;width: 100%;">
            {treeBtnEle}
            {treeNameEle}
          </div>
        )
      }
      // 保存编辑框的上下文
      treeNameEleContext = treeNameEle.context
      return resultEle
    },

    /* ---------------------------- tree input Validate ------------------ */

    tooltipShow(rowData, modelName, msg) {
      rowData.validate[modelName].isValidate = true
      rowData.validate[modelName].validateMsg = msg
      treeNameEleContext.$refs.tooltip.$emit('tooltipIsShow', true)
    },
    tooltipHide(rowData, modelName) {
      rowData.validate[modelName].isValidate = false
      treeNameEleContext.$refs.tooltip.$emit('tooltipIsShow', false)
    },
    // 输入框验证
    inputValidate(rowData, modelName) {
      const inputValue = rowData[modelName]
      let isValidate = false
      if (!inputValue) {
        this.tooltipShow(rowData, modelName, '不能为空')
      } else if (inputValue.length > 100) {
        this.tooltipShow(rowData, modelName, '不能大于100字符')
      } else {
        this.tooltipHide(rowData, modelName)
        isValidate = true
      }
      return isValidate
    },

    /* ----------------------------On Click Event-------------------------- */

    // 编辑框change事件
    change(data, val) {
      data[self.defaultProps.label] = val
      this.inputValidate(data, self.defaultProps.label)
    },

    onAddClick() {
      this.fillForm = {
        ICON: 'deviceType/chtank',
        DeviceTypeName: '',
        Description: '',
        Order: 0
      }
      this.isDialogVisible = true
    },

    // 添加按钮事件
    append(store, data) {
      const newData = {
        Id: self.$_.uniqueId(),
        ICON: data.ICON,
        DeviceTypeName: self.defauleLabelText,
        Description: '',
        Order: 0,
        ParentId: data.Id,
        children: [],
        isEdit: true,
        isSave: false,
        validate: self.$_.cloneDeep(this.validate)
      }
      // store.append(newData, data)
      this.fillForm = newData
      this.isDialogVisible = true
    },

    // 删除按钮事件
    remove(store, data) {
      store.remove(data)
    },

    // 删除按钮事件
    delete(data) {
      const { Id, DeviceTypeName } = data

      this.$confirm(`是否删除【${DeviceTypeName}】设备？`, '提示', {
        cancelButtonClass: 'el-button--cancel',
        closeOnClickModal: false
      })
        .then(() => {
          this.$apis.deviceType
            .deviceTypeRemove(Id)
            .then(result => {
              this.$message.success(result.Message)
              this.handleRefresh()
            })
            .catch(errMsg => {
              this.$message.error(errMsg)
              console.error(errMsg)
            })
        })
        .catch(() => {
          this.$message.warning(`取消删除【${DeviceTypeName}】设备`)
        })
    },

    // 取消按钮事件
    cancel(data) {
      data[this.defaultProps.label] = this.originalValue
      data.isEdit = false
    },

    // 编辑按钮事件
    edit(data) {
      // this.originalValue = data[this.defaultProps.label]
      // data.isEdit = true
      this.fillForm = JSON.parse(JSON.stringify(data)) // data
      this.isDialogVisible = true
    },

    // 保存按钮事件
    save(data) {
      if (this.inputValidate(data, self.defaultProps.label)) {
        const { isSave } = data
        if (isSave) {
          // 更新
          this.$apis.deviceType
            .updateDeviceType(data)
            .then(result => {
              this.$message.success(result.Message)
              this.handleRefresh()
            })
            .catch(errMsg => {
              this.$message.error(errMsg)
              console.error(errMsg)
            })
        } else {
          // 新增
          this.$apis.deviceType
            .addDeviceType(data)
            .then(result => {
              this.$message.success(result.Message)
              this.handleRefresh()
            })
            .catch(errMsg => {
              this.$message.error(errMsg)
              console.error(errMsg)
            })
        }
      }
    },

    // 新增确认事件
    onSureClick() {
      this.$refs.fillForm.validate(valid => {
        if (!valid) return
        const { isSave } = this.fillForm
        if (isSave) {
          // 更新
          this.$apis.deviceType
            .updateDeviceType(this.fillForm)
            .then(result => {
              this.$message.success(result.Message)
              this.isDialogVisible = false
              this.handleRefresh()
            })
            .catch(errMsg => {
              this.$message.error(errMsg)
              console.error(errMsg)
            })
        } else {
          // 新增
          this.$apis.deviceType
            .addDeviceType(this.fillForm)
            .then(result => {
              this.$message.success(result.Message)
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

    // 树节点点击事件
    handleNodeClick(data, node) {
      this.activeNode = node // data
      this.activeTpl = {}
      this.activePanel = {}
    },

    // 模板列表点击
    tplClick(data) {
      this.activeTpl = data
      // 判断激活的面板所属的模板是否是激活的模板
      if (this.activeTpl.Id !== this.activePanel.TemplateId) {
        // 若激活的面板所属的模板不是激活的模板，清空激活的面板
        this.activePanel = {}
      } else {
        // 若激活的面板所属的模板是激活的模板，
        // 说明 activePanel 是通过 this.$emit('handleRefresh', this.activeNode, this.activeTpl, this.activePanel) 设置的
      }
    },
    // 模板面板列表点击
    panelClick(data) {
      this.activePanel = data
    }
  }
}
</script>
<style lang="scss">
@import '~@assets/scss/variables.scss';
.el-tree {
  .tree-des {
    font-size: $font-small;
    color: $text-grey;
    margin-left: 0.5em;
  }
}
.sys-device-type {
  height: 100%;
  .info-row {
    height: 100%;
    .info-col {
      height: 100%;
      &.left {
        .box-card {
          margin-right: $spacing-size;
        }
      }
      &.right {
        .device-type-content {
          margin-right: $spacing-size;
        }
      }
      .easy-scrollbar {
        height: 100%;
      }
      .easy-scrollbar__wrap {
        overflow-x: hidden;
      }
    }
  }
}
</style>
