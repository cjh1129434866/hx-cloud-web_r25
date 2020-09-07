<template>
  <el-dialog :visible="isVisible" width="30%" @close="onClose" class="edit-dialog" :close-on-click-modal="false" :show-close="false">
    <span slot="title" class="el-dialog__title">{{ option.title }}</span>
    <el-form :model="fillForm" :rules="rules" ref="fillForm">
      <div class="form-group col-sm-11">
        <el-form-item label="角色名称" prop="RoleName">
          <el-input v-model="fillForm.RoleName"></el-input>
        </el-form-item>
        <el-form-item label="角色类型" prop="IsAdmin">
          <el-select v-model="fillForm.IsAdmin" placeholder="请选择角色类型" filterable clearable>
            <el-option v-for="(value, key) in roleTypeDic" :key="key" :label="value" :value="key"> </el-option>
          </el-select>
        </el-form-item>
      </div>
    </el-form>
    <span slot="footer">
      <el-button type="cancel" @click="isVisible = false"> {{ $t('cancel') }}</el-button>
      <el-button type="primary" @click="onSureClick"> {{ $t('confirm') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { ROLE_TYPE_DIC } from '@constants/dictionaries'
// import { $utils } from '@helper'

export default {
  name: 'RoleEditDialog',

  data() {
    return {
      isVisible: false,
      roleTypeDic: ROLE_TYPE_DIC,
      fillForm: {
        RoleName: '',
        IsAdmin: []
      },
      rules: {
        RoleName: [
          {
            required: true,
            message: '请输入角色名称',
            trigger: 'blur'
          },
          {
            min: 2,
            max: 100,
            message: '长度在 2 到 100 个字符',
            trigger: 'blur'
          }
        ],
        IsAdmin: [
          {
            required: true,
            message: '请选择角色类型',
            trigger: 'change'
          }
        ]
      }
    }
  },

  computed: {},

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

  watch: {
    value(newVal) {
      this.isVisible = newVal
      this.fillForm = JSON.parse(JSON.stringify(this.pdata)) // 使用两次JSON对数据进行深拷贝
    }
  },

  methods: {
    onClose() {
      this.isVisible = false
      this.$emit('input', this.isVisible)
    },

    onSureClick() {
      this.$refs.fillForm.validate(valid => {
        if (!valid) return
        // this.fillForm.date = this.$utils.dayConvert(this.fillForm.date)
        const IsAdmin = this.fillForm.IsAdmin
        this.fillForm.IsAdmin = IsAdmin[IsAdmin.length - 1]
        this.$emit('dispatch-data', this.fillForm)
        this.isVisible = false
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
