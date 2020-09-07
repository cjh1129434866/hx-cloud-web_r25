<template>
  <el-dialog :visible="isVisible" width="30%" @close="onClose" class="edit-dialog" :close-on-click-modal="false" :show-close="false">
    <span slot="title" class="el-dialog__title">{{ option.title }}</span>
    <el-form :model="fillForm" :rules="rules" ref="fillForm">
      <div class="form-group col-sm-11">
        <el-form-item label="附属名" prop="AffiliateName">
          <el-input v-model="fillForm.AffiliateName"></el-input>
        </el-form-item>
        <el-form-item label="附属值" prop="AffiliateValue">
          <el-input v-model="fillForm.AffiliateValue"></el-input>
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
export default {
  name: 'affiliateEdit',

  data() {
    return {
      isVisible: false,
      fillForm: {
        projectId: '',
        AffiliateName: '',
        AffiliateValue: ''
      },
      rules: {
        AffiliateName: [
          {
            required: true,
            message: '请输入附属名',
            trigger: 'blur'
          },
          {
            min: 2,
            max: 5,
            message: '长度在 2 到 5 个字符',
            trigger: 'blur'
          }
        ],
        AffiliateValue: [
          {
            required: true,
            message: '请输入附属值',
            trigger: 'blur'
          },
          {
            min: 2,
            max: 10,
            message: '长度在 2 到 10 个字符',
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
    pdata: {
      type: Object,
      default() {
        return {}
      }
    },
    option: {
      type: Object,
      default() {
        return { title: '编辑附属属性' }
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
        this.$emit('dispatch-data', this.fillForm)
        this.isVisible = false
      })
    }
  }
}
</script>

<style type="text/css" lang="scss"></style>
