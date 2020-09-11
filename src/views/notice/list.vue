<!--
 * @Author: jiapeng.Zheng
 * @Date: 2019-06-26 14:29:25
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-05-19 15:33:10
 * @Description: 通知中心
 -->
<template>
  <div class="module-content notice-center">
    <!-- 临时添加的关闭按钮 -->
    <i class="el-icon-close module-content-close" :title="$t('close')" @click="$vueRouterGenerator.goBackByHistoryPath($route.fullPath)"></i>
    <div class="panel panel-default">
      <div class="panel-body">
        <el-card class="search-card">
          <div v-if="titleName">
            <icon name="bell"></icon>
            {{ titleName }}
          </div>
          <el-form :model="searchForm" class="search-form" :inline="true" ref="searchForm">
            <!-- 获取某一个设备的报警信息的接口不支持 typeId 筛选 -->
            <el-form-item v-if="!searchForm.deviceSn">
              <el-select v-model="searchForm.typeId" clearable placeholder="报警类型">
                <el-option v-for="(value, key) in $commonParam.warnTypeDict" :key="key" :label="value.TypeName" :value="key"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-select v-model="searchForm.State" clearable placeholder="状态">
                <el-option v-for="(value, key) in notice_status_dic" :key="key" :label="value" :value="key"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item prop="dateRange">
              <el-date-picker
                v-model="searchForm.dateRange"
                type="daterange"
                align="right"
                :clearable="false"
                :placeholder="$t('pleaseSelect') + $t('dateRange')"
                :picker-options="pickerOptions"
              ></el-date-picker>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="search" @click="handleRefresh()">{{ $t('search') }}</el-button>
            </el-form-item>
            <el-form-item v-if="searchForm.deviceSn">
              <el-button type="primary" icon="search" :loading="resertLoading" @click="handleReset()">{{ $t('alert') + $t('reset') }}</el-button>
            </el-form-item>
          </el-form>
        </el-card>
        <el-card v-loading.body="loading" style="height:calc(100% - 63px)" :body-style="{ display: 'flex', flexDirection: 'column', height: '100%' }">
          <el-table :data="tableData" class="noticeTable" height="auto">
            <el-table-column prop="TypeId" column-key="typeId" label="报警类型" width="100">
              <template v-slot="scope">
                <icon class="icons" :name="$commonParam.warnTypeDict[scope.row.TypeId].Icon" :style="`fill:${$commonParam.warnTypeDict[scope.row.TypeId].Color}`"></icon>
                <span :style="`color:${$commonParam.warnTypeDict[scope.row.TypeId].Color}`">{{ $commonParam.warnTypeDict[scope.row.TypeId].TypeName }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="CodeDescription" label="报警内容" min-width="150">
              <template v-slot="scope">
                <li
                  v-if="!searchForm.deviceSn"
                  class="text-link"
                  @click="onLinkClick(scope.row)"
                  :style="!scope.row.State ? `color:${$commonParam.warnTypeDict[scope.row.TypeId].Color}` : ''"
                >
                  设备【{{ scope.row.DeviceName }}（{{ scope.row.DeviceNo }}）】 {{ scope.row.CodeDescription }}（{{ scope.row.Code }}）
                </li>
                <li v-else :style="!scope.row.State ? `color:${$commonParam.warnTypeDict[scope.row.TypeId].Color}` : ''">
                  设备【{{ scope.row.DeviceName }}（{{ scope.row.DeviceNo }}）】 {{ scope.row.CodeDescription }}（{{ scope.row.Code }}）
                </li>
              </template>
            </el-table-column>
            <el-table-column
              prop="Dt"
              label="报警时间"
              width="175"
              :formatter="
                (row, column) => {
                  return $utils.dateConvert(row.Dt)
                }
              "
            ></el-table-column>
            <el-table-column prop="State" column-key="State" label="状态" width="80">
              <template v-slot="scope">{{ notice_return_status_dic[scope.row.State] }}</template>
            </el-table-column>
            <el-table-column label="操作" width="140">
              <template v-slot="scope">
                <el-button v-if="scope.row.State === false" @click="onHandleWarn(scope.row, scope.$index)" type="primary" size="small">{{ $t('deal') }}</el-button>
                <el-button v-else @click="onShowHandle(scope.row, scope.$index)" type="success" size="small">{{ $t('view') }}</el-button>
                <el-button @click="onDelHandle(scope.row, scope.$index)" type="danger" size="small">{{ $t('deletes') }}</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="table-operate">
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="searchForm.pageNo"
              :page-sizes="pageSizes"
              :page-size="searchForm.pageSize"
              :total="pageTotal"
              layout="total, sizes, prev, pager, next, jumper"
            ></el-pagination>
          </div>
        </el-card>
        <el-dialog :visible="isHandleVisible" width="30%" @close="isHandleVisible = false" class="edit-dialog" :close-on-click-modal="false" :show-close="false">
          <span slot="title" class="el-dialog__title"
            >报警处理
            <el-tooltip class="item" effect="dark" content="注：未复位的报警即使“点击处理”，设备任会继续报警！" placement="right">
              <i class="el-icon-question"></i>
            </el-tooltip>
          </span>
          <template v-if="isHandle">
            <el-form :model="currentRowData" :rules="handelFormRules" ref="handelForm" class="handle-form valid-form" onsubmit="return false;">
              <el-form-item label="处理意见" prop="Comments">
                <el-input type="textarea" v-model="currentRowData.Comments"></el-input>
              </el-form-item>
            </el-form>
          </template>
          <el-form v-else class="handle-form">
            <div class="col-sm-12">
              <el-form-item label="处理人：">{{ currentRowData.Handle }}</el-form-item>
            </div>
            <div class="col-sm-12">
              <el-form-item label="处理时间：">{{ $utils.dateConvert(currentRowData.HandleTime) }}</el-form-item>
            </div>
            <div class="col-sm-12">
              <el-form-item label="处理状态：">{{ notice_return_status_dic[currentRowData.State] }}</el-form-item>
            </div>
            <div class="col-sm-12">
              <el-form-item label="处理意见：">{{ currentRowData.Comments }}</el-form-item>
            </div>
          </el-form>
          <span slot="footer">
            <el-button type="cancel" @click="isHandleVisible = false">{{ $t('cancel') }}</el-button>
            <el-button type="primary" @click="onSureClick">{{ $t('confirm') }}</el-button>
          </span>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script>
// import store from '@store'
import { $utils, $vueRouterGenerator } from '@helper'
import { NOTICE_STATUS_DIC, NOTICE_RETURN_STATUS_DIC } from '@constants/dictionaries'
import { NOTICE_STATE_ALL, NOTICE_TYPE_ALL, NOTICE_STATE_UNSOLVED } from '@constants/noticeTypeConfig'
import { SEARCH_DATE_RANGE } from '@constants/index'
import DeviceControlApi from '@helper/apis/deviceControl'

let _this
// let _nowDate = new Date()

export default {
  name: 'notice-center',
  props: {
    deviceInfo: {
      type: Object,
      default() {
        return {}
      }
    },
    deviceSn: {
      type: String,
      default: ''
    },
    deviceNo: {
      type: String,
      default: ''
    },
    deviceWarnResetConf: {
      type: Object,
      default() {
        return {}
      }
    },
    isOnline: {
      type: Boolean,
      default: false
    },
    warnTypeId: {
      type: String,
      default: ''
    },
    titleName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now() - 8.64e7
        },
        onPick({ maxDate, minDate }) {
          if (maxDate && minDate) {
            const range = new Date(maxDate).getTime() - new Date(minDate).getTime()
            if (range > SEARCH_DATE_RANGE) {
              this.$message.error('不允许查询超过3个月的数据')
              this.$nextTick(() => {
                _this.dateRange = ''
              })
            }
          }
        },
        shortcuts: [
          {
            text: '最近一周',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            }
          }
        ]
      },
      loading: false,
      resertLoading: false,
      homePath: '/common/home',
      deviceUrl: '/common/app/device/',
      nowDate: new Date(),
      pageTotal: 0, // 总条数
      pageSizes: [10, 20, 30], // 每页显示个数选择器的选项设置
      searchDateRangeUnit: 's', // 允许搜索的时间范围的单位
      searchForm: {
        // beginTime: _nowDate,
        // endTime: _nowDate,
        projectId: '',
        deviceSn: '',
        dateRange: [new Date(new Date().setTime(new Date().getTime() - 3600 * 1000 * 24 * 31)), new Date()],
        Code: '', // 报警编码
        State: NOTICE_STATE_UNSOLVED, // 报警状态，0表示全部，1表示未处理，2表示已处理
        typeId: '', // 报警类型
        sortData: 'dt',
        sortType: 'desc',
        pageNo: 1, // 当前第几页
        pageSize: 0 // 每页显示个数
      },
      handelFormRules: {
        Comments: [
          {
            required: true,
            message: '请输入处理意见',
            trigger: 'blur'
          },
          {
            min: 1,
            max: 100,
            message: '长度在 1 到 100 个字符',
            trigger: 'blur'
          }
        ]
      },
      tableData: [],
      currentRowData: {},
      currentRowIndex: -1,
      isHandleVisible: false, // 查看弹窗是否显示
      isHandle: false, // 是否已处理
      notice_status_dic: NOTICE_STATUS_DIC, // 提交时的状态字典
      notice_return_status_dic: NOTICE_RETURN_STATUS_DIC // 返回的状态字典
    }
  },

  components: {},

  computed: {},

  watch: {
    $route(to) {
      // “通知中心”(notice/list/:id/:status)和“设备报警模块”(/common/home/:activeTitle/:activeItemId)共用同一组件
      this.searchForm.typeId = to.params.id === NOTICE_TYPE_ALL ? '' : to.params.id
      this.searchForm.State = to.params.status === NOTICE_STATE_ALL ? '' : to.params.status || NOTICE_STATE_UNSOLVED
      // this.searchForm.projectId = to.params.projectId
      this.searchForm.deviceSn = this.deviceSn // to.params.activeItemId
      this.handleRefresh()
    },
    warnTypeId(newVal) {
      this.searchForm.typeId = newVal
      this.handleRefresh()
    }
  },

  created() {
    _this = this
    // 初始化pageSize
    this.searchForm.pageSize = this.pageSizes[0]
    this.searchForm.typeId = this.warnTypeId || this.$route.params.id
    this.searchForm.typeId = this.searchForm.typeId === NOTICE_TYPE_ALL ? '' : this.searchForm.typeId
    this.searchForm.State = this.$route.params.status || NOTICE_STATE_UNSOLVED
    this.searchForm.deviceSn = this.deviceSn
  },

  mounted() {
    // 刷新加载数据
    this.handleRefresh()
  },

  filters: {},

  methods: {
    handleSizeChange(val) {
      this.searchForm.pageSize = val
      this.handleRefresh()
    },

    handleCurrentChange(val) {
      this.searchForm.pageNo = val
      this.handleRefresh()
    },
    /* ----------------------------refresh---------------------------- */
    // 表单刷新
    handleRefresh() {
      this.$refs.searchForm.validate(async valid => {
        if (!valid) return
        this.loading = true // 设置loading
        this.tableData = []
        try {
          const data = JSON.parse(JSON.stringify(this.searchForm))
          data.endTime = $utils.dateConvert(data.dateRange[1], 'YYYY-MM-DD 23:59:59')
          data.beginTime = $utils.dateConvert(data.dateRange[0], 'YYYY-MM-DD 00:00:00')
          let result = { WarnData: [], DataCount: 0, PageSize: 10, PageNo: 1 }
          if (this.searchForm.deviceSn) {
            // 获取某一个设备的报警信息
            result = await this.$apis.warn.getPageWarnInfo(data)
          } else {
            // 获取所有设备的报警信息
            result = await this.$apis.warn.getMyPageWarnCode(data)
          }
          this.tableData = result.WarnData

          // 数据处理
          this.searchForm.pageSize = result.PageSize
          this.searchForm.PageNo = result.PageNo
          this.pageTotal = result.DataCount
        } catch (errMsg) {
          this.$message.error(errMsg.toString())
          console.error(errMsg)
        } finally {
          this.loading = false // 移除loading
        }
      })
    },
    // 报警复位
    async handleReset() {
      let resertKey = '0C0161' // 暂时写死，二期后端数据定义逻辑会进行重构
      if (!this.searchForm.deviceSn) {
        return false
      }
      if (this.isOnline === false) {
        this.$message.warning('报警复位失败：设备离线，无法复位！')
        return false
      }
      if (this.deviceWarnResetConf) {
        resertKey = this.deviceWarnResetConf.DefineKey
        // this.$message.warning('报警复位失败：“设备配置信息”中没有配置“报警复位”！')
        // return false
      }
      // 复位
      this.resertLoading = true
      const { IsAccess, Message } = await DeviceControlApi.resertWarn(this.deviceInfo, resertKey)
      if (!IsAccess) {
        this.$alert(`报警复位失败：${Message}`, '提示')
      } else {
        this.$alert('报警复位成功：请手动处理“未处理”的报警信息！', '提示')
      }
      this.resertLoading = false
    },

    /* ----------------------------On Click Event---------------------------- */
    onHandleWarn(rowData, rowIndex) {
      this.isHandle = true
      this.isHandleVisible = true
      this.currentRowData = JSON.parse(JSON.stringify(rowData))
      this.currentRowIndex = rowIndex
    },
    onShowHandle(rowData, rowIndex) {
      this.isHandle = false
      this.isHandleVisible = true
      this.currentRowData = JSON.parse(JSON.stringify(rowData))
      this.currentRowIndex = rowIndex
    },
    onDelHandle(rowData) {
      const { Id } = rowData
      this.$confirm(`是否删除该信息？`, '提示', { cancelButtonClass: 'el-button--cancel', closeOnClickModal: false })
        .then(() => {
          this.$apis.warn
            .warnDelete(Id)
            .then(result => {
              this.$message.success(result.message)
              this.handleRefresh()
            })
            .catch(errMsg => {
              this.$message.error(errMsg)
              console.error(errMsg)
            })
        })
        .catch(() => {
          this.$message.warning(`取消删除！`)
        })
    },
    onSureClick() {
      if (this.isHandle) {
        this.$refs.handelForm.validate(valid => {
          if (!valid) return
          this.$apis.warn
            .warnSave(this.currentRowData)
            .then(result => {
              this.$message.success(result.message)
              this.handleRefresh()
              this.isHandleVisible = false
            })
            .catch(errMsg => {
              this.$message.error(errMsg)
              console.error(errMsg)
            })
        })
      } else {
        this.isHandleVisible = false
      }
    },
    onLinkClick(rowData) {
      const { DeviceSn, DeviceName, FullId, FullName } = rowData
      const fromPath = { fullPath: `${this.homePath}?id=`, fullPathName: FullName, fullPathID: FullId }
      const path = `${this.deviceUrl}${DeviceSn}`

      $vueRouterGenerator.goToPage(path, DeviceName, fromPath)
    }
  }
}
</script>
<style lang="scss">
@import '~@assets/scss/variables.scss';
.notice-center {
  height: 100%;
  .panel {
    height: 100%;
    .panel-body {
      height: calc(100% - #{$spacing-size});
    }
  }
}
.search-form,
.handle-form {
  .el-form-item {
    margin: {
      bottom: 0;
    }
  }
  .el-col {
    padding: {
      top: 0;
      bottom: 0;
    }
  }
}
.noticeTable {
  height: 100%;
}
</style>
