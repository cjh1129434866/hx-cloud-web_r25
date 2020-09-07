<template>
  <el-dialog :visible="isVisible" width="30%" @close="onClose" class="edit-dialog" :close-on-click-modal="false" :show-close="false">
    <span slot="title" class="el-dialog__title">{{ option.title }}</span>
    <el-form :model="fillForm" :rules="rules" ref="fillForm">
      <div class="form-group col-sm-12">
        <el-form-item :label="$t('accounts')" prop="UserAccount">
          <el-input v-model="fillForm.UserAccount"></el-input>
        </el-form-item>
        <el-form-item :label="$t('realname')" prop="RealName">
          <el-input v-model="fillForm.RealName"></el-input>
        </el-form-item>
        <el-form-item :label="$t('passwords')" prop="Password">
          <el-input type="password" v-model="fillForm.Password"></el-input>
        </el-form-item>
        <el-form-item :label="$t('passwordAgain')" prop="PasswordAgain">
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
import { $validate } from '@helper'

export default {
  name: 'user-edit',

  data() {
    return {
      isVisible: false,
      fillForm: {
        UserAccount: '',
        RealName: '',
        Password: '',
        PasswordAgain: ''
      },
      rules: {
        UserAccount: [
          {
            required: true,
            message: this.$t('pleaseEnter') + this.$t('accounts'),
            trigger: 'blur,change'
          },
          {
            type: 'string',
            required: true,
            ...$validate.LettersOrNumber(6, 15).rule(),
            trigger: 'blur'
          }
        ],
        RealName: [
          {
            required: true,
            message: this.$t('pleaseEnter') + this.$t('realname'),
            trigger: 'blur,change'
          },
          {
            required: true,
            ...$validate.lengthLimt(2, 5).rule(),
            trigger: 'blur,change'
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
                callback(new Error(this.$t('pleaseEnter') + this.$t('passwordAgain')))
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
    },
    pdata: {
      type: Object,
      default() {
        return {}
      }
    }
  },

  watch: {
    value(newVal) {
      this.isVisible = newVal
      if (newVal) {
        this.fillForm = JSON.parse(JSON.stringify(this.pdata))
      }
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
        this.$emit('dispatch-data', this.fillForm)
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
