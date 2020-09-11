<!--
 * @Author: jiapeng.Zheng
 * @Date: 2018-08-13 13:55:11
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-31 16:23:25
 * @Description: 修改密码
 -->
<template>
  <el-dialog :visible="isVisible" width="30%" @close="onClose" class="edit-dialog" :close-on-click-modal="false" :show-close="false">
    <span slot="title" class="el-dialog__title">{{ option.title }}</span>
    <el-form :model="fillForm" :rules="rules" ref="fillForm">
      <div class="form-group col-sm-12">
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input type="password" v-model="fillForm.oldPassword"></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="Password">
          <el-input type="password" v-model="fillForm.Password"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="PasswordAgain">
          <el-input type="password" v-model="fillForm.PasswordAgain"></el-input>
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
import { $validate } from '@helper'
// import { $utils } from '@helper'

export default {
  name: 'ChangePwdDialog',

  data() {
    return {
      isVisible: false,
      roleTypeDic: ROLE_TYPE_DIC,
      fillForm: {
        oldPassword: '',
        Password: '',
        PasswordAgain: ''
      },
      rules: {
        oldPassword: [
          {
            type: 'string',
            required: true,
            ...$validate.LettersOrNumber(3, 10).rule(),
            trigger: 'blur'
          }
        ],
        Password: [
          {
            type: 'string',
            required: true,
            ...$validate.LettersOrNumber(3, 10).rule(),
            trigger: 'blur'
          }
        ],
        PasswordAgain: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (value === '') {
                callback(new Error('请输入确认密码'))
              } else if (value !== this.fillForm.Password) {
                callback(new Error('两次输入密码不一致!'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
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
        this.$apis.user
          .changePwd(this.fillForm)
          .then(() => {
            this.$alert('修改密码成功，将重新登录', '重新登录', {
              showClose: false,
              confirmButtonText: '确定',
              callback: () => {
                this.$router.push('/login')
              }
            })
            // this.$message.success(result.message)
            // this.isVisible = false
          })
          .catch(errMsg => {
            this.$message.error(errMsg)
            console.error(errMsg)
          })
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
