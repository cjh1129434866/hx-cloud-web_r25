<!--
 * @Author: jiapeng.Zheng
 * @Date: 2018-10-11 16:18:55
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-31 16:43:52
 * @Description: 角色项目权限
 -->
<template>
  <el-dialog
    :visible="isVisible"
    :fullscreen="true"
    class="edit-dialog"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="true"
    :before-close="onBeforeClose"
    @close="onClose"
    ref="dialog"
  >
    <span slot="title" class="el-dialog__title">
      {{ option.title }}
      <span v-if="!isSave">*</span>
    </span>
    <el-tree
      class="filter-tree"
      v-loading="loading"
      :data="sysProject"
      :props="elTreeProps"
      :show-checkbox="false"
      node-key="Id"
      :default-expand-all="true"
      :highlight-current="true"
      :expand-on-click-node="false"
      :render-content="renderContent"
      ref="deviceTypeTree"
    ></el-tree>
    <span class="jurisdiction-remarks">
      <b>注：</b>
      <p>1、若选择的项目有子项目，当子项目的权限小于父项目的权限时，子项目的权限继承父项目的权限</p>
      <p>2、若选择的项目有子项目，当子项目的权限大于父项目的权限时，子项目的权限不变</p>
      <p>3、若选择的项目有父项目，父项目的权限为其下一级所有项目中权限最小的</p>
      <p>4、同一级项目中，选择权限大的复选框，小于该权限的复选框也默认选中</p>
      <p>5、权限大小：查 &lt; 控 &lt; 改 &lt; 增 == 删</p>
    </span>
    <span slot="footer">
      <el-button type="cancel" @click="$refs.dialog.handleClose()">{{ $t('cancel') }}</el-button>
      <el-button type="primary" @click="onSureClick">{{ $t('confirm') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { ROLE_PROJECT_PERMISSION } from '@constants/permissionConfig'
import { PROJECT_TYPE_DIC, PROJECT_TYPE_PROJECT, PROJECT_TYPE_STATION } from '@constants/dictionaries'
import { $utils } from '@helper'
let self

export default {
  name: 'RoleProjectDialog',

  props: {
    value: {
      type: Boolean,
      required: true
    },
    pdata: {
      type: Object,
      default() {
        return {}
      }
    },
    option: {
      type: Object,
      default() {
        return { title: '编辑' }
      }
    }
  },

  data() {
    return {
      isVisible: false,
      isSave: true,
      loading: false,
      notPermissionCode: -1,
      projectId: '',
      projectPermissionConfig: ROLE_PROJECT_PERMISSION,
      project_type_project: PROJECT_TYPE_PROJECT,
      project_type_station: PROJECT_TYPE_STATION,
      project_type_dic: PROJECT_TYPE_DIC,
      sysProjectPermission: {}, // api返回的项目权限 {"项目ID":"权限ID"}
      allProject: [], // 原始的“所有项目”，created 时获取
      projectCache: [], // 缓存的“所有项目”，每次 handleRefresh 时指向 allProject
      elTreeProps: {
        children: 'children',
        label: 'ProjectName'
      }
    }
  },

  computed: {
    // 根据 projectCache 格式化的数据格式
    sysProject() {
      return $utils.treeDataFormat({
        data: this.projectCache,
        idName: 'Id',
        parentIdName: 'ParentId',
        parentNodeflag: null
      })
    }
  },

  async created() {
    self = this
    const allProject = await this.$apis.project.getAllProject()
    this.allProject = allProject.list
  },

  watch: {
    value(newVal) {
      this.isVisible = newVal
      if (newVal === true) {
        this.handleRefresh()
      }
    }
  },

  methods: {
    renderContent(h, { node, data }) {
      const checkBox = []
      for (const i in this.projectPermissionConfig) {
        const { key } = this.projectPermissionConfig[i]
        checkBox.push(
          h(
            'el-checkbox',
            {
              attrs: {
                value: data.permissionCodeCheckBox[key]
              },
              on: {
                change: () => {
                  this.checkboxChange(data._dataIndex, this.projectPermissionConfig[i])
                }
              }
            },
            this.projectPermissionConfig[i].name
          )
        )
      }
      return (
        <div style="display: inline-block;width: 100%;">
          {h('span', { style: `float: right; margin-right: 35px` }, checkBox)}
          <span>{node.label}</span>
        </div>
      )
    },
    // 表单刷新
    async handleRefresh() {
      this.isSave = true
      this.loading = true
      this.sysProjectPermission = {}
      this.projectCache = [] // projectCache 重新指向空的数组，清空projectCache
      try {
        const sysProjectPermission = await this.$apis.permission.getRoleProject(this.pdata.Id)
        // 格式化项目权限
        sysProjectPermission.list.forEach(item => {
          self.sysProjectPermission[item.ProjectId] = item.TypeId
        })
        // 格式化项目树，把项目权限赋值到项目树上，无权限的默认赋值为 notPermissionCode（即-1）
        this.allProject.forEach((item, index) => {
          self.allProject[index]._dataIndex = index
          self.allProject[index].permissionCode = typeof self.sysProjectPermission[item.Id] === 'undefined' ? self.notPermissionCode : self.sysProjectPermission[item.Id]
          self.allProject[index].permissionCodeCheckBox = {}
          // 权限操作
          self.permissionRule(index, self.allProject[index].permissionCodeCheckBox)
        })
        this.projectCache = this.allProject // projectCache 指向 allProject，allProject 更新时，projectCache会对应着更新
        // 初始化循环项目权限
        for (const projectId in this.sysProjectPermission) {
          const typeId = this.sysProjectPermission[projectId]
          this.selectRelationCheckBox(projectId, typeId)
        }
        this.loading = false
      } catch (errMsg) {
        console.error(errMsg)
        this.$message.error(String(errMsg))
      }
    },

    /**
     * 权限的操作规则
     * @param {number} rowIndex                 项目列表索引
     * @param {object} permissionCodeCheckBox   当前项目对应权限的复选框组
     */
    permissionRule(rowIndex, permissionCodeCheckBox) {
      this.projectPermissionConfig.forEach(i => {
        permissionCodeCheckBox[i.key] = this.allProject[rowIndex].permissionCode >= i.value
      })
      this.$set(this.allProject, rowIndex, this.allProject[rowIndex])
    },
    /**
     * 选中某个项目相关联的父、子节点的复选框
     * @param {number} projectId  项目ID
     * @param {number} typeId     项目权限码
     */
    selectRelationCheckBox(projectId, typeId) {
      // ********************************************************************************
      // *  选中所有子节点的CheckBox,所有的子节点的权限取父节点和该节点中权限码最大的的       *
      // ********************************************************************************
      // 从 sysProject 树形结构中 截取项目ID为 projectId 的子树 childrenTree
      const childrenTree = $utils.getChildrenTreeFromTreeData({
        data: this.sysProject, // sysProject 是根据 projectCache 计算得来的，即 computed
        childrenKey: 'children',
        serachKey: 'Id',
        serachData: parseInt(projectId)
      })
      // 循环子树 childrenTree
      for (const child of childrenTree) {
        // 遍历子树 childrenTree
        $utils.traverseTree({ node: child, childrenKey: 'children' }, data => {
          const { _dataIndex } = data
          // 当父节点选中时，所有的子节点的权限取父节点和该节点中权限码最大的的
          this.allProject[_dataIndex].permissionCode = Math.max(typeId, this.allProject[_dataIndex].permissionCode)
          // 选中子节点
          this.permissionRule(_dataIndex, this.allProject[_dataIndex].permissionCodeCheckBox)
        })
      }
      // **********************************************************************
      // *  选中父节点的CheckBox ,父节点的权限码等于下一级节点中权限码最小的       *
      // **********************************************************************
      // 递归出从顶级节点到 ID 为 projectId节点的所有节点
      $utils.getParentPathFromTreeData(
        {
          data: this.allProject,
          parentKey: 'ParentId',
          parentNoddeflag: null,
          serachKey: 'Id',
          serachData: parseInt(projectId)
        },
        data => {
          const { ParentId } = data
          if (ParentId) {
            let parent = {} // 父节点对象
            const partner = [] // 父节点下一级所有子节点的权限码
            for (const proj of this.allProject) {
              // 寻找同一级的节点
              if (ParentId === proj.ParentId) {
                partner.push(proj.permissionCode)
              }
              // 寻找父节点
              if (ParentId === proj.Id) {
                parent = proj
              }
            }
            const { _dataIndex } = parent
            // 选中父节点，父节点的权限码等于下一级节点中权限码最小的
            this.allProject[_dataIndex].permissionCode = Math.min(typeId, ...partner)
            this.permissionRule(_dataIndex, this.allProject[_dataIndex].permissionCodeCheckBox)
          }
        }
      )
    },

    /**
     * checkbox change事件
     * @param {number} rowIndex     项目列表索引
     * @param {object} permission   权限
     */
    checkboxChange(rowIndex, permission) {
      const { key, value } = permission
      const permissionCodeCheckBox = this.allProject[rowIndex].permissionCodeCheckBox
      const isTrue = permissionCodeCheckBox[key]
      if (isTrue) {
        this.allProject[rowIndex].permissionCode = value - 1 // ( 权限码 - 1 ) 代表取消该权限
      } else {
        this.allProject[rowIndex].permissionCode = value
      }
      this.permissionRule(rowIndex, permissionCodeCheckBox)
      this.selectRelationCheckBox(this.allProject[rowIndex].Id, this.allProject[rowIndex].permissionCode)
      // this.$set(this.allProject, rowIndex, this.allProject[rowIndex])
      this.isSave = false
    },

    onBeforeClose(done) {
      if (!this.isSave) {
        this.$confirm('还未保存是否退出', '提示', {
          cancelButtonClass: 'el-button--cancel',
          closeOnClickModal: true
        })
          .then(() => {
            done()
          })
          .catch(() => {
            this.$message.warning('取消退出')
          })
      } else {
        done()
      }
    },
    onClose() {
      this.projectId = ''
      this.isVisible = false
      this.$emit('input', this.isVisible)
    },

    onSureClick() {
      const project = []
      const type = []
      this.allProject.forEach(item => {
        if (item.permissionCode !== self.notPermissionCode) {
          if (item.ParentId) {
            // 循环搜索出父节点
            for (const parent of this.allProject) {
              if (item.ParentId === parent.Id && item.permissionCode > parent.permissionCode) {
                type.push(item.permissionCode)
                project.push(item.Id)
              }
            }
          } else {
            type.push(item.permissionCode)
            project.push(item.Id)
          }
        }
      })
      this.$confirm('是否更新项目权限', '提示', {
        cancelButtonClass: 'el-button--cancel',
        closeOnClickModal: true
      })
        .then(() => {
          // 更新权限
          this.$apis.permission
            .addOrUpdateRoleProject({ roleId: this.pdata.Id, projectId: project.join(), typeid: type.join() })
            .then(result => {
              this.$message.success(result.message)
              this.onClose()
            })
            .catch(errMsg => {
              this.$message.error(errMsg)
              console.error(errMsg)
            })
        })
        .catch(() => {
          this.$message.warning('取消更新')
        })
    }
  }
}
</script>

<style type="text/css" lang="scss">
@import '~@assets/scss/variables';
.filter-tree {
  width: 100%;
}
.jurisdiction-remarks {
  p {
    margin-left: 2rem;
    margin-bottom: 0;
  }
}
</style>
