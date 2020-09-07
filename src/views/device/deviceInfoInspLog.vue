<template>
  <div class="app-device-log">
    <div class="log-table">
      <div class="table-title card-title">
        <span class="table-title-name">
          <icon name="panel/record"></icon>
          <span>{{ $t('pollRecord') }}</span>
        </span>
        <el-button icon="el-icon-plus" type="primary" size="small" @click="isPollEditVisible = true">{{ $t('add') }}</el-button>
        <!-- <span @click="isPollEditVisible = true">
          <icon class="add-btn" name="circle-add"></icon>
        </span> -->
      </div>
      <el-table :data="pollList" border height="auto" v-loading="isRepairLoading">
        <el-table-column width="200" align="center" prop="PollTime" :label="$t('pollTime')" :formatter="formatterTime"></el-table-column>
        <el-table-column width="145" align="center" prop="PollTitle" :label="$t('pollProject')"></el-table-column>
        <el-table-column header-align="center" prop="PollContent" :label="$t('pollRecord')"></el-table-column>
        <el-table-column width="145" align="center" prop="UserName" :label="$t('pollman')"></el-table-column>
      </el-table>
    </div>
    <div class="log-table">
      <div class="table-title card-title">
        <span class="table-title-name">
          <icon name="panel/record"></icon>
          <span>{{ $t('repairrRecord') }}</span>
        </span>
        <el-button icon="el-icon-plus" type="primary" size="small" @click="isRepairEditVisible = true">{{ $t('add') }}</el-button>
        <!-- <span @click="isRepairEditVisible = true">
          <icon class="add-btn" name="circle-add"></icon>
        </span> -->
      </div>
      <el-table :data="repairList" border height="auto" v-loading="isPollLoading">
        <el-table-column width="200" align="center" prop="RepairTime" :label="$t('repairTime')" :formatter="formatterTime"></el-table-column>
        <el-table-column width="145" align="center" prop="RepairTitle" :label="$t('repairProject')"></el-table-column>
        <el-table-column header-align="center" prop="RepairContent" :label="$t('repairrRecord')"></el-table-column>
        <el-table-column width="145" align="center" prop="UserName" :label="$t('repairman')"></el-table-column>
      </el-table>
    </div>
    <el-dialog
      :visible="isRepairEditVisible"
      width="30%"
      @close="isRepairEditVisible = false"
      class="edit-dialog"
      :modal-append-to-body="false"
      :close-on-click-modal="false"
      :show-close="false"
    >
      <span slot="title" class="el-dialog__title">{{ $t('adds') + $t('repairrRecord') }}</span>
      <el-form :model="repairForm" :rules="repairRules" ref="repairForm">
        <div class="form-group col-sm-11">
          <el-form-item :label="$t('pollProject')" prop="RepairTitle">
            <el-input v-model="repairForm.RepairTitle" :placeholder="$t('pollProject')"></el-input>
          </el-form-item>
        </div>
        <div class="form-group col-sm-11">
          <el-form-item :label="$t('repairrRecord')" prop="RepairContent">
            <el-input v-model="repairForm.RepairContent" :placeholder="$t('repairrRecord')"></el-input>
          </el-form-item>
        </div>
      </el-form>
      <span slot="footer">
        <el-button type="cancel" @click="isRepairEditVisible = false">{{ $t('cancel') }}</el-button>
        <el-button type="primary" @click="onAddRepairClick">{{ $t('confirm') }}</el-button>
      </span>
    </el-dialog>
    <el-dialog
      :visible="isPollEditVisible"
      width="30%"
      @close="isPollEditVisible = false"
      class="edit-dialog"
      :modal-append-to-body="false"
      :close-on-click-modal="false"
      :show-close="false"
    >
      <span slot="title" class="el-dialog__title">{{ $t('adds') + $t('pollRecord') }}</span>
      <el-form :model="pollForm" :rules="pollRules" ref="pollForm">
        <div class="form-group col-sm-11">
          <el-form-item :label="$t('pollProject')" prop="PollTitle">
            <el-input v-model="pollForm.PollTitle" :placeholder="$t('pollProject')"></el-input>
          </el-form-item>
        </div>
        <div class="form-group col-sm-11">
          <el-form-item :label="$t('pollRecord')" prop="PollContent">
            <el-input v-model="pollForm.PollContent" :placeholder="$t('pollRecord')"></el-input>
          </el-form-item>
        </div>
      </el-form>
      <span slot="footer">
        <el-button type="cancel" @click="isPollEditVisible = false">{{ $t('cancel') }}</el-button>
        <el-button type="primary" @click="onAddPollClick">{{ $t('confirm') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: 'app-device-insp-log',

  props: {
    deviceSn: {
      required: true,
      type: String
    }
  },

  data() {
    return {
      isRepairEditVisible: false,
      isRepairLoading: false,
      repairList: [],
      repairForm: {
        RepairTitle: '',
        RepairContent: ''
      },
      repairRules: {
        RepairTitle: [
          {
            required: true,
            message: '请输入维修项目',
            trigger: 'blur'
          }
        ],
        RepairContent: [
          {
            required: true,
            message: '请输入维修内容',
            trigger: 'blur'
          }
        ]
      },
      isPollEditVisible: false,
      isPollLoading: false,
      pollList: [],
      pollForm: {
        PollTitle: '',
        PollContent: ''
      },
      pollRules: {
        PollTitle: [
          {
            required: true,
            message: '请输入巡检项目',
            trigger: 'blur'
          }
        ],
        PollContent: [
          {
            required: true,
            message: '请输入巡检内容',
            trigger: 'blur'
          }
        ]
      }
    }
  },

  computed: {},

  created() {
    console.log('GetPollList created')
    this.init()
  },

  watch: {},

  methods: {
    async init() {
      try {
        // -------------- 维修记录 -----------------------
        this.isRepairLoading = true
        const repairList = await this.$apis.log.getRepairList(this.deviceSn)
        this.isRepairLoading = false
        this.repairList = repairList.Data
        // -------------- 巡检记录 -----------------------
        this.isPollLoading = true
        const pollList = await this.$apis.log.getPollList(this.deviceSn)
        this.isPollLoading = false
        this.pollList = pollList.Data
      } catch (errMsg) {
        this.isRepairLoading = false
        this.isPollLoading = false
        this.$message.error(errMsg)
        console.error(errMsg)
      }
    },
    /**
     * 新增维修记录
     */
    onAddRepairClick() {
      this.$refs.repairForm.validate(async valid => {
        if (!valid) return
        try {
          this.repairForm.deviceSn = this.deviceSn
          const result = await this.$apis.log.repairAdd(this.repairForm)
          this.isRepairEditVisible = false
          this.init()
          this.$message.success(result.Message)
        } catch (errMsg) {
          this.$message.error(errMsg)
          console.error(errMsg)
        }
      })
    },
    /**
     * 新增巡检记录
     */
    onAddPollClick() {
      this.$refs.pollForm.validate(async valid => {
        if (!valid) return
        try {
          this.pollForm.deviceSn = this.deviceSn
          const result = await this.$apis.log.pollAdd(this.pollForm)
          this.isPollEditVisible = false
          this.init()
          this.$message.success(result.Message)
        } catch (errMsg) {
          this.$message.error(errMsg)
          console.error(errMsg)
        }
      })
    },
    formatterTime(row, column) {
      return this.$utils.dateConvert(row[column.property])
    }
  }
}
</script>
<style lang="scss">
@import '~@assets/scss/variables.scss';
.app-device-log {
  margin: 0 $spacing-size $spacing-small-size 0;
  .log-table {
    height: 50%;
    padding: $spacing-size $spacing-large-size;
    display: flex;
    flex-direction: column;
    margin-bottom: 5px;
    // .app-device-log 下最后两个 .log-table 类型（div）的元素是 edit-dialog，故选择最后第3个
    &:nth-last-of-type(3) {
      margin-bottom: 0;
    }
    .table-title {
      padding: 5px 0;
      .table-title-name {
        display: flex;
        align-items: center;
        .icon {
          margin-right: 0.5em;
        }
      }
      .add-btn {
        cursor: pointer;
        margin: 0 0 0 0.5em;
        &:hover {
          opacity: 0.8;
        }
      }
    }
  }
}
</style>
