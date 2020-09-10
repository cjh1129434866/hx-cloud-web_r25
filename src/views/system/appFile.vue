<!--
 * @Author       : jiapeng.Zheng
 * @Date         : 2020-05-20 17:11:21
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-05-22 14:58:58
 * @Description  : 移动app上传模块
-->
<template>
  <div class="module-content app-upgrade-file">
    <!-- 临时添加的关闭按钮 -->
    <i class="el-icon-close module-content-close" :title="$t('close')" @click="$vueRouterGenerator.goBackByHistoryPath($route.fullPath)"></i>
    <div class="panel panel-default">
      <div class="panel-body">
        <el-card class="box-card">
          <el-row :gutter="10">
            <el-col :xs="24" :sm="12" :md="12" :lg="12">
              <el-input placeholder="请输入版本号" v-model="searchForm.search" clearable>
                <template slot="prepend">
                  版本号
                </template>
              </el-input>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="12">
              <el-button type="primary" icon="search" @click="onSearchClick()">{{ $t('search') }}</el-button>
              <el-button type="primary" icon="plus" @click="onAddClick()">{{ $t('add') }}</el-button>
              <!-- 上传控件（隐藏） -->
              <el-upload
                style="display:none;"
                ref="upload"
                :action="filePostUrl"
                :accept="fileConfig.type"
                :data="fileData"
                :auto-upload="false"
                :on-remove="onFileRemove"
                :on-change="onFileChange"
                :on-success="onFileSuccess"
                :on-error="onFileError"
                :on-progress="onFileProgress"
              >
                <el-button slot="trigger" size="small" type="primary"></el-button>
                <el-button style="margin-left: 10px;" size="small" type="success"></el-button>
              </el-upload>
            </el-col>
          </el-row>
        </el-card>
        <el-card v-loading.body="isLoading">
          <el-table :data="appList" border>
            <el-table-column type="index" width="80"></el-table-column>
            <el-table-column prop="Type" label="类型" min-width="150">
              <template v-slot="scope">{{ typeDict[scope.row.Type] }}</template>
            </el-table-column>
            <el-table-column prop="VersionNo" label="版本" min-width="150"></el-table-column>
            <el-table-column prop="Description" label="描述" min-width="150"></el-table-column>
            <el-table-column prop="State" label="是否强制升级" min-width="150">
              <template v-slot="scope">{{ scope.row.State ? '是' : '否' }}</template>
            </el-table-column>
            <el-table-column prop="Date" label="日期" min-width="150"></el-table-column>
            <el-table-column label="操作" min-width="250">
              <template v-slot="scope">
                <el-button @click="onEditClick(scope.row)" type="primary" size="small">编辑</el-button>
                <el-button @click="onDelClick(scope.row.Id)" type="danger" size="small">删除</el-button>
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
            >
            </el-pagination>
          </div>
        </el-card>
      </div>
    </div>
    <!-- 新增、编辑弹窗 -->
    <el-dialog :visible="isDialogVisible" width="30%" class="edit-dialog" @close="onDialogClose" :close-on-click-modal="false" :show-close="false">
      <span slot="title" class="el-dialog__title">
        <el-progress v-show="fileUploadProgress" class="file-progress" :percentage="fileUploadProgress" :show-text="false"></el-progress>
        <span>{{ currentRowData._title }}</span>
      </span>
      <el-form :model="currentRowData" :rules="editFormRules" ref="editForm" onsubmit="return false;">
        <div class="form-group col-sm-11">
          <el-form-item label="强制升级" prop="State">
            <el-checkbox v-model="currentRowData.State"></el-checkbox>
          </el-form-item>
        </div>
        <div class="form-group col-sm-11">
          <el-form-item label="版本" prop="VersionNo">
            <el-input v-model="currentRowData.VersionNo" :disabled="!!currentRowData.Id"></el-input>
          </el-form-item>
        </div>
        <div class="form-group col-sm-11">
          <el-form-item label="描述" prop="Description">
            <el-input v-model="currentRowData.Description"></el-input>
          </el-form-item>
        </div>
      </el-form>
      <span slot="footer">
        <el-button type="cancel" @click="isDialogVisible = false" :disabled="fileUploadProgress != 0"> {{ $t('cancel') }}</el-button>
        <el-button type="primary" @click="onSureClick(currentRowData)" :disabled="fileUploadProgress != 0"> {{ $t('confirm') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { UPLOAD_CONFIG } from '@constants/index'
// import { TYPE_FILE_MAINSYS } from '@constants/deviceTypeConfig/index'
// import { TYPE_FILE_DIC } from '@constants/dictionaries'
import { $utils, $validate } from '@helper'
import $apis from '@helper/apis'

export default {
  name: 'app-upgrade-file',

  props: {},

  data() {
    return {
      appList: [], // 升级文件列表
      pageSizes: [10, 20, 30], // 分页
      pageTotal: 0, // 总页数
      // 搜索条件
      searchForm: {
        pageSize: 0,
        pageNo: 1,
        order: 'VersionNo', // 排序字段
        orderType: 'desc', // 排序类型
        search: '', // 搜索字段 针对 VersionNo 筛选
      },
      typeDict: ['android', 'ios'], // 文件类型，以该数组对应的索引作为文件类型标识，即0代表安卓，1代表ios
      currentRowData: { _title: '新增' }, // 当前编辑的数据
      // 数据校验规则
      editFormRules: {
        VersionNo: [
          {
            required: true,
            ...$validate.fileVersion().rule(), // 使用物联网控制器升级文件版本号规则
            trigger: 'change'
          }
        ],
        Description: [
          {
            required: true,
            message: '请输入描述',
            trigger: 'blur'
          }
        ]
      },
      isLoading: false, // 是否显示loading
      isDialogVisible: false, // 是否显示编辑/新增弹窗,当窗口关闭时会调用 onDialogClose 方法（清除选择的文件和表单内容，重置进度条）
      filePostUrl: UPLOAD_CONFIG.appFileCof.url || UPLOAD_CONFIG.url,
      fileConfig: UPLOAD_CONFIG.appFileCof,
      fileData: {},
      fileUploadProgress: 0
    }
  },
  computed: {},

  watch: {},

  components: {},

  filters: {},

  methods: {
    // ---------------------------------- 数据操作 api ----------------------------------
    // 数据获取
    async getDataList(param) {
      const data = await $apis.file.getAppFilePageList(param)
      this.appList = data.List
      this.pageTotal = data.DataCount
    },
    // 修改
    updateData(param) {
      $apis.file
        .editAppFile(param)
        .then(result => {
          this.$message.success(result.Message)
          this.isDialogVisible = false
          this.getDataList(this.searchForm)
        })
        .catch(errMsg => {
          this.$message.error(String(errMsg))
          this.isDialogVisible = false
          console.error(errMsg)
        })
    },
    // 新增
    addData(param) {
      this.fileData = JSON.parse(JSON.stringify(param))
      this.fileData.account = $utils.getCookie('account')
      this.fileData.token = $utils.getCookie('token')
      this.$nextTick(() => {
        this.$refs.upload.submit() // 手动上传文件,上传成功后会回调 onFileSuccess
      })
    },
    // ---------------------------------- 分页 ----------------------------------
    // 每页显示条目个数改变时
    handleSizeChange(val) {
      this.searchForm.pageSize = val
      this.getDataList(this.searchForm)
    },
    // 页码改变时的事件
    handleCurrentChange(val) {
      this.searchForm.pageNo = val
      this.getDataList(this.searchForm)
    },
    // 弹窗
    onDialogClose() {
      this.$refs.editForm.resetFields()
      this.onFileRemove()
    },
    // ---------------------------------- 按钮事件 ----------------------------------
    // 搜索按钮
    async onSearchClick() {
      this.getDataList(this.searchForm)
    },
    // 新增按钮
    onAddClick() {
      this.currentRowData = { _title: '新增', type: 0, State: false }
      this.$refs.upload.$refs['upload-inner'].handleClick() // 手动选择文件
    },
    // 编辑按钮
    onEditClick(data) {
      this.currentRowData = JSON.parse(JSON.stringify(data))
      this.currentRowData._title = '编辑'
      this.isDialogVisible = true
    },
    // 删除按钮
    onDelClick(id) {
      this.$confirm('是否删除该升级文件？', '提示', { cancelButtonClass: 'el-button--cancel', closeOnClickModal: false })
        .then(() => {
          $apis.file
            .delAppFile(id)
            .then(result => {
              this.$message.success(result.Message)
              this.getDataList(this.searchForm)
            })
            .catch(errMsg => {
              this.$message.error(errMsg)
              console.error(errMsg)
            })
        })
        .catch(() => {
          this.$message.warning('取消删除')
        })
    },
    // 提交按钮
    onSureClick(param) {
      this.$refs.editForm.validate(valid => {
        if (!valid) return
        if (param.Id) {
          this.updateData(param)
        } else {
          this.addData(param)
        }
      })
    },
    // ---------------------------------- 文件 ----------------------------------
    fileValidate(file) {
      const { type, size } = this.fileConfig
      // 根据文件类型('application/vnd.android.package-archive')，从typeDict中(['android', 'ios'])查找对应的索引
      this.currentRowData.type = this.typeDict.findIndex(ele => file.raw.type.indexOf(ele) > -1)
      const isApk = type.indexOf(file.raw.type) > -1
      const isLtM = file.size / 1024 / 1024 < size
      if (!isApk) {
        this.$message.error('文件类型有误，请选择*.apk文件!')
      }
      if (!isLtM) {
        this.$message.error(`文件大小不能超过 ${size}MB!`)
      }
      return isApk && isLtM
    },
    onFileRemove() {
      this.fileData = {}
      this.fileUploadProgress = 0
    },
    onFileChange(file) {
      if (file.status === 'ready') {
        if (!this.fileValidate(file)) {
          this.$refs.upload.handleRemove(file) // 移除不通过验证的文件
        } else {
          this.isDialogVisible = true // 显示新增弹窗
        }
      }
    },
    onFileSuccess(response) {
      const { Success, Message } = response
      if (Success === true) {
        this.$message.success('文件上传成功')
      } else {
        this.$message.error(Message)
      }
      this.isDialogVisible = false
      this.getDataList(this.searchForm) // 刷新列表
    },
    onFileError(err) {
      console.error(err)
      this.isDialogVisible = false
      this.$message.error('文件上传失败')
    },
    onFileProgress(event) {
      this.fileUploadProgress = event.percent
    }
  },
  // ---------------------------------- 声明周期 ----------------------------------
  created() {
    this.searchForm.pageSize = this.pageSizes[0]
    this.getDataList(this.searchForm)
  }
}
</script>
<style lang="scss">
.app-upgrade-file {
  .file-progress {
    margin-top: -20px;
    margin-left: -20px;
    position: absolute;
    width: 100%;
  }
}
</style>
