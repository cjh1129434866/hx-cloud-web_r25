<template>
  <el-dialog :visible="isVisible" width="30%" @close="onClose" class="edit-dialog" :close-on-click-modal="false" :show-close="false">
    <span slot="title" class="el-dialog__title">{{ option.title }}</span>
    <el-form :model="fillForm" :rules="rules" ref="fillForm">
      <div class="form-group col-sm-11">
        <el-form-item label="角色" prop="RoleName">
          <el-select v-model="fillForm.RoleId" placeholder="请选择角色" filterable clearable>
            <el-option v-for="(item, index) in userRoles" :key="index" :label="item.RoleName" :value="item.Id"></el-option>
          </el-select>
        </el-form-item>
      </div>
    </el-form>
    <span slot="footer">
      <el-button type="cancel" @click="isVisible = false">{{ $t('cancel') }}</el-button>
      <el-button type="primary" @click="onSureClick">{{ $t('confirm') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'UserRoleEdit',

  data() {
    return {
      loading: false,
      isVisible: false,
      userRoles: [],
      fillForm: {
        RoleId: ''
      },
      rules: {
        RoleId: [
          {
            required: true,
            message: '请选择角色',
            trigger: 'change'
          }
        ]
      }
    }
  },

  computed: {},

  async created() {
    try {
      // 获取角色信息
      const result = await this.$apis.role.get()
      this.userRoles = result.List
    } catch (errMsg) {
      this.$message.error(errMsg.toString())
      console.error(errMsg)
    }
  },

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
        return { title: '用户角色' }
      }
    }
  },

  watch: {
    value(newVal) {
      this.isVisible = newVal
      this.fillForm = JSON.parse(JSON.stringify(this.pdata)) // 使用两次JSON对数据进行深拷贝
      // this.fillForm.RoleId = ''
      this.handleRefresh()
    }
  },

  methods: {
    async handleRefresh() {
      this.loading = true // 设置loading
      try {
        // 获取角色信息
        const result = await this.$apis.user.getUserRole(this.fillForm.Id)
        this.$set(this.fillForm, 'RoleId', result.RoleId ? result.RoleId : '')
      } catch (errMsg) {
        this.$message.error(errMsg.toString())
        console.error(errMsg)
      } finally {
        this.loading = false // 移除loading
      }
      // getUserRole
    },
    onClose() {
      this.isVisible = false
      this.$emit('input', this.isVisible)
    },

    onSureClick() {
      this.$refs.fillForm.validate(async valid => {
        if (!valid) return
        this.loading = true // 设置loading
        try {
          const result = await this.$apis.user.addOrUpdateUserRole({
            userId: this.fillForm.Id,
            roleId: this.fillForm.RoleId
          })
          this.$message.success(result.message)
          this.$emit('dispatch-data', this.fillForm)
          this.isVisible = false
        } catch (errMsg) {
          this.$message.error(errMsg)
          console.error(errMsg)
        } finally {
          this.loading = false // 移除loading
        }
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
