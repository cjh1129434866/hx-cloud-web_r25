<template>
  <el-dialog
    :visible="isVisible"
    width="30%"
    class="edit-dialog"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="true"
    :before-close="onBeforeClose"
    @close="onClose"
    ref="dialog"
  >
    <span slot="title" class="el-dialog__title">{{ option.title }}<span v-if="!isSave"> *</span></span>
    <el-table :data="sysMenu" max-height="500" v-loading="loading">
      <el-table-column type="index" width="80"></el-table-column>
      <el-table-column prop="Name" label="菜单名称" min-width="100" max-width="100"></el-table-column>
      <el-table-column v-for="(item, key) in menuPermissionConfig" :key="key" :label="item.name" width="50">
        <template v-slot="scope">
          <el-checkbox v-model="scope.row.permissionCodeCheckBox[item.key]" @change="permissionChange(scope.$index, item)"></el-checkbox>
        </template>
      </el-table-column>
    </el-table>
    <span slot="footer">
      <el-button type="cancel" @click="$refs.dialog.handleClose()"> {{ $t('cancel') }}</el-button>
      <el-button type="primary" @click="onSureClick"> {{ $t('confirm') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { ROLE_MENU_PERMISSION } from '@constants/permissionConfig'
// import { $utils } from '@helper'
let self

export default {
  name: 'RoleMenuDialog',

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
      menuPermissionConfig: ROLE_MENU_PERMISSION,
      sysMenu: [],
      sysMenuPermission: {}
    }
  },

  computed: {},

  created() {
    self = this
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
    // 表单刷新
    async handleRefresh() {
      this.isSave = true
      this.loading = true
      this.sysMenu = []
      this.sysMenuPermission = {}
      try {
        const sysMenu = await this.$apis.sysMenu.getAll()
        const sysMenuPermission = await this.$apis.permission.getRoleMenu(this.pdata.Id)
        this.sysMenu = sysMenu.list
        // 格式化菜单权限
        sysMenuPermission.list.forEach(item => {
          self.sysMenuPermission[item.SysMenuId] = item.Operate
        })
        // 把菜单权限赋值到菜单列表
        this.sysMenu.forEach((item, index) => {
          self.sysMenu[index].permissionCode = typeof self.sysMenuPermission[item.Id] === 'undefined' ? self.notPermissionCode : self.sysMenuPermission[item.Id]
          self.sysMenu[index].permissionCodeCheckBox = {}
          // 权限操作
          self.permissionRule(index, self.sysMenu[index].permissionCodeCheckBox)
        })
        this.loading = false
      } catch (errMsg) {
        this.$message.error(errMsg)
        console.error(errMsg)
      }
    },

    /**
     * 权限的操作规则
     * @param {number} rowIndex                 菜单列表索引
     * @param {object} permissionCodeCheckBox   当前菜单对应权限的复选框的值
     */
    permissionRule(rowIndex, permissionCodeCheckBox) {
      this.menuPermissionConfig.forEach(i => {
        permissionCodeCheckBox[i.key] = this.sysMenu[rowIndex].permissionCode >= i.value
      })
    },

    /**
     * 权限选择事件
     * @param {number} rowIndex     菜单列表索引
     * @param {object} permission   权限
     */
    permissionChange(rowIndex, permission) {
      const { key, value } = permission
      const permissionCodeCheckBox = this.sysMenu[rowIndex].permissionCodeCheckBox
      const isTrue = permissionCodeCheckBox[key]
      if (!isTrue) {
        // 权限码 - 1 代表取消该权限
        this.sysMenu[rowIndex].permissionCode = value - 1
      } else {
        this.sysMenu[rowIndex].permissionCode = value
      }
      this.permissionRule(rowIndex, permissionCodeCheckBox)
      this.$set(this.sysMenu, rowIndex, this.sysMenu[rowIndex])
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
      this.isVisible = false
      this.$emit('input', this.isVisible)
    },

    onSureClick() {
      const menu = []
      const type = []
      this.sysMenu.forEach(item => {
        if (item.permissionCode !== self.notPermissionCode) {
          type.push(item.permissionCode)
          menu.push(item.Id)
        }
      })

      this.$confirm('是否更新菜单权限', '提示', {
        cancelButtonClass: 'el-button--cancel',
        closeOnClickModal: true
      })
        .then(() => {
          // 更新权限
          this.$apis.permission
            .addOrUpdateRoleMenu({ roleId: this.pdata.Id, menu: menu.join(), type: type.join() })
            .then(result => {
              this.$message.success(result.Message)
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
.filter-tree {
  width: 100%;
}
</style>
