<template>
  <el-dialog :visible="isVisible" width="30%" @close="onClose" class="edit-dialog" :close-on-click-modal="false" :show-close="false">
    <span slot="title" class="el-dialog__title">{{ option.title }}</span>
    <el-form :model="currentRowData" ref="currentRowData">
      <div class="form-group col-sm-11">
        <el-form-item :label="$t('clientSn') + '：'" prop="ClientSn">
          {{ currentRowData.ClientSn }}
        </el-form-item>
      </div>
      <div class="form-group col-sm-11">
        <el-form-item :label="$t('clientName') + '：'" prop="ClientName">
          {{ currentRowData.ClientName }}
        </el-form-item>
      </div>
      <div class="form-group col-sm-11">
        <el-form-item :label="$t('linkman') + '：'" prop="Linkman">
          {{ currentRowData.Linkman }}
        </el-form-item>
      </div>
      <div class="form-group col-sm-11">
        <el-form-item :label="$t('telephone') + '：'" prop="Telephone">
          {{ currentRowData.Telephone }}
        </el-form-item>
      </div>
      <div class="form-group col-sm-11">
        <el-form-item :label="$t('mobile') + '：'" prop="Mobile">
          {{ currentRowData.Mobile }}
        </el-form-item>
      </div>
      <div class="form-group col-sm-11">
        <el-form-item :label="$t('address') + '：'" prop="Address">
          {{ currentRowData.Address }}
        </el-form-item>
      </div>
      <div class="form-group col-sm-11">
        <el-form-item :label="$t('description') + '：'" prop="Description">
          {{ currentRowData.Description }}
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
  name: 'client-info',

  data() {
    return {
      loading: false,
      isVisible: false,
      currentRowData: { ClientId: '' }
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
        return { title: 'clientInfo' }
      }
    }
  },

  watch: {
    value(newVal) {
      this.isVisible = newVal
      this.currentRowData = JSON.parse(JSON.stringify(this.pdata)) // 使用两次JSON对数据进行深拷贝
      if (newVal === true) {
        this.handleRefresh()
      }
    }
  },

  methods: {
    async handleRefresh() {
      this.loading = true // 设置loading
      try {
        // 获取客户信息
        const result = await this.$apis.client.get(this.currentRowData.ClientId)
        this.currentRowData = result
      } catch (errMsg) {
        this.$message.error(errMsg)
        console.error(errMsg)
      } finally {
        this.loading = false // 移除loading
      }
    },

    onClose() {
      this.isVisible = false
      this.$emit('input', this.isVisible)
    },

    onSureClick() {
      this.$emit('dispatch-data', this.fillForm)
      this.isVisible = false
    }
  }
}
</script>

<style type="text/css" lang="scss"></style>
