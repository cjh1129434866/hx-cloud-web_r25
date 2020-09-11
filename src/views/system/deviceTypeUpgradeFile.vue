<!--
 * @Author       : jiapeng.Zheng
 * @Date         : 2018-12-04 09:43:04
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-31 16:29:22
 * @Description  : 设备类型升级文件
 -->
<template>
  <el-card class="box-card">
    <div slot="header" class="clearfix">
      <span style="font-weight:bold">{{ activeNode.data.DeviceTypeName }} /</span>
      <span>{{ $t('upgradeFile') }}</span>
    </div>
    <el-row>
      <el-col>
        <el-form class="form-group" :inline="true" v-if="activeNode.data.Id">
          <el-form-item>
            <el-button @click="selectFileClick()" icon="plus" type="primary">{{ $t('selects') + $t('upgradeFile') }}</el-button>
            <!-- 上传控件（隐藏） -->
            <el-upload
              class="upload-image"
              ref="upload"
              :action="filePostUrl"
              :accept="fileConfig.type"
              :data="fileData"
              :auto-upload="false"
              :on-remove="onFileRemove"
              :on-change="onFileChnage"
              :on-success="onFileSuccess"
              :on-error="onFileError"
            >
              <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
              <el-button style="margin-left: 10px;" size="small" type="success" @click="fileUpload">上传到服务器</el-button>
            </el-upload>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
    <el-table :data="baseData" border>
      <!-- Level -->
      <el-table-column prop="Level" label="文件类型" min-width="100">
        <template v-slot="scope">
          <template v-if="scope.row.isEdit">
            <!-- <el-tooltip
              effect="danger"
              placement="top"
              :manual="true"
              v-model="scope.row.validate.Level.isValidate"
              :ref="`DataLeveltooltip${scope.$index}`"
              :content="`文件类型${scope.row.validate.Level.validateMsg}`"
            >
              <el-input v-model="scope.row.Level" @change="inputValidate(scope.row, 'Level')"></el-input>
            </el-tooltip>-->
            <el-select v-model="scope.row.Level">
              <el-option v-for="(val, key) in typeFileDic" :key="key" :label="val" :value="Number(key)"></el-option>
            </el-select>
          </template>
          <template v-else>{{ typeFileDic[scope.row.Level] }}</template>
        </template>
      </el-table-column>
      <el-table-column prop="fileName" label="文件名称" min-width="200">
        <template v-slot="scope">
          <template v-if="scope.row.isEdit">
            <el-tooltip
              effect="danger"
              placement="top"
              :manual="true"
              v-model="scope.row.validate.fileName.isValidate"
              :ref="`DatafileNametooltip${scope.$index}`"
              :content="`文件名称${scope.row.validate.fileName.validateMsg}`"
            >
              <el-input v-model="scope.row.fileName" @change="inputValidate(scope.row, 'fileName')"></el-input>
            </el-tooltip>
          </template>
          <template v-else>{{ scope.row.fileName }}</template>
        </template>
      </el-table-column>
      <el-table-column prop="Version" label="版本号" min-width="200">
        <template v-slot="scope">
          <template v-if="scope.row.isEdit">
            <el-tooltip
              effect="danger"
              placement="top"
              :manual="true"
              v-model="scope.row.validate.Version.isValidate"
              :ref="`DataVersiontooltip${scope.$index}`"
              :content="`版本号${scope.row.validate.Version.validateMsg}`"
            >
              <el-input v-model="scope.row.Version" @change="inputValidate(scope.row, 'Version')"></el-input>
            </el-tooltip>
          </template>
          <template v-else>{{ scope.row.Version }}</template>
        </template>
      </el-table-column>
      <el-table-column prop="Description" label="描述" min-width="200">
        <template v-slot="scope">
          <template v-if="scope.row.isEdit">
            <el-tooltip
              effect="danger"
              placement="top"
              :manual="true"
              v-model="scope.row.validate.Description.isValidate"
              :ref="`DataVersiontooltip${scope.$index}`"
              :content="`描述${scope.row.validate.Description.validateMsg}`"
            >
              <el-input v-model="scope.row.Description" @change="inputValidate(scope.row, 'Description')"></el-input>
            </el-tooltip>
          </template>
          <template v-else>{{ scope.row.Description }}</template>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template v-slot="scope">
          <template v-if="scope.row.isEdit">
            <el-button @click="onSaveClick(scope.row, scope.$index)" type="success" size="small">{{ $t('save') }}</el-button>
            <template v-if="scope.row.isSave">
              <el-button @click="onDelClick(scope.row.Id, scope.$index)" type="danger" size="small">{{ $t('delete') }}</el-button>
            </template>
            <template v-else>
              <el-button @click="onAddDelClick(scope.$index)" type="danger" size="small">{{ $t('delete') }}</el-button>
            </template>
          </template>
          <template v-else>
            <!-- <el-button @click="onEditClick(scope.row, scope.$index)" type="primary" size="small">{{$t('edit')}}</el-button> -->
            <el-button @click="onDelClick(scope.row.Id, scope.$index)" type="danger" size="small">{{ $t('delete') }}</el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script>
import { UPLOAD_CONFIG } from '@constants/index'
import { TYPE_FILE_MAINSYS } from '@constants/deviceTypeConfig/index'
import { TYPE_FILE_DIC } from '@constants/dictionaries'
import { $utils, $validate } from '@helper'

let self

export default {
  name: 'device-type-upgrade-file',

  props: {
    activeNode: {
      required: true
    }
  },

  data() {
    return {
      baseData: [],
      updateFile: [],
      validate: {
        fileName: {
          isValidate: false,
          validateMsg: ''
        },
        Version: {
          isValidate: false,
          validateMsg: ''
        },
        Description: {
          isValidate: false,
          validateMsg: ''
        }
      },
      typeFileDic: TYPE_FILE_DIC,
      filePostUrl: UPLOAD_CONFIG.deviceTypeUpgradeFileCof.url || UPLOAD_CONFIG.url,
      fileConfig: UPLOAD_CONFIG.deviceTypeUpgradeFileCof,
      fileData: {}
    }
  },
  computed: {},

  watch: {
    'activeNode.data'(newVal) {
      this.updateFile = newVal.UpdateFile
      this.handRefresh()
    }
  },

  components: {},

  created() {
    self = this
  },

  filters: {},

  methods: {
    // -----------------Refresh--------------------
    handRefresh() {
      this.baseData = []
      this.updateFile.forEach(item => {
        this.baseData.push({
          ...item,
          // isEdit用来显示不同的操作按钮以及控制表格编辑框的显示:
          // true  表示该数据准备修改（启用编辑框、显示保存按钮、删除按钮结合isEdit进行功能切换：若isSave为true切换为服务端删除onDelClick，为false切换为客户端删除onAddDelClick）;
          // false 表示该数据已经修改完毕且更新成功（禁用编辑框、显示编辑按钮、删除按钮功能切换为服务端删除onDelClick）;
          isEdit: false,
          // isSave用来区分调用保存Or新增接口:
          // ture  表示该数据来源于服务器,调用保存接口;
          // false 表示该数据来源于手动添加且还未保存到服务器，调用新增接口;
          isSave: true,
          validate: this.$_.cloneDeep(this.validate)
        })
      })
    },
    // -----------------validate--------------------
    tooltipShow(rowData, modelName, msg) {
      rowData.validate[modelName].isValidate = true
      rowData.validate[modelName].validateMsg = msg
    },
    tooltipHide(rowData, modelName) {
      rowData.validate[modelName].isValidate = false
    },
    inputValidate(rowData, modelName) {
      const inputValue = rowData[modelName]
      if (!inputValue) {
        this.tooltipShow(rowData, modelName, '不能为空')
      } else if (inputValue.length > 100) {
        this.tooltipShow(rowData, modelName, '不能大于100字符')
      } else {
        this.tooltipHide(rowData, modelName)
      }
    },
    rowDataValidate(rowData) {
      let isValidate = false
      const { fileName, Version, Description } = rowData
      const { validate, rule } = $validate.fileVersion()
      if (!fileName) {
        this.tooltipShow(rowData, 'fileName', '不能为空')
      } else if (fileName.length > 100) {
        this.tooltipShow(rowData, 'fileName', '不能大于100字符')
      } else if (!validate(Version)) {
        this.tooltipShow(rowData, 'Version', rule().message)
      } else if (!Description) {
        this.tooltipShow(rowData, 'Description', '不能为空')
      } else if (Description.length > 100) {
        this.tooltipShow(rowData, 'Description', '不能大于100字符')
      } else {
        isValidate = true
      }
      return isValidate
    },
    // --------------------file handle--------------------
    // 手动选择文件，选择后会回调onFileChnage
    selectFileClick() {
      this.$refs.upload.$refs['upload-inner'].handleClick()
    },
    // 手动上传文件,上传成功后会回调 onFileSuccess
    fileUpload() {
      this.$refs.upload.submit()
    },
    // 手动删除文件，删除后回调onFileRemove
    fileRemove(file) {
      this.$refs.upload.handleRemove(file) // 移除不通过验证的文件
    },
    onFileRemove(/*file, fileList */) {
      this.fileData = {}
    },
    onFileChnage(file /*,fileList */) {
      if (file.status === 'ready') {
        if (!this.fileValidate(file)) {
          this.fileRemove(file)
        } else {
          this.handleAddData(file)
        }
      }
    },
    onFileSuccess(response /*, file, fileList */) {
      const { Success, Message } = response
      if (Success === true) {
        this.$message.success('文件上传成功')
      } else {
        this.$message.error(Message)
      }
      this.fileData.isEdit = false
      this.$emit('handleRefresh', this.activeNode) // 调用父组件deviceType.vue 的更新方法 handleRefresh
      this.handRefresh() // 刷新表单
    },
    onFileError(err /*, file, fileList */) {
      console.error(err)
      this.onAddDelClick(this.fileData._index)
      this.$message.error('文件上传失败')
    },
    fileValidate(file) {
      const { type, size } = this.fileConfig
      const isImage = type.indexOf(file.raw.type) > -1
      const isLtM = file.size / 1024 / 1024 < size
      if (!isImage) {
        this.$message.error('文件类型有误，请选择*.bin文件!')
      }
      if (!isLtM) {
        this.$message.error(`文件大小不能超过 ${size}MB!`)
      }
      return isImage && isLtM
    },
    // -----------------on click event--------------------
    // 新增数据
    handleAddData(file) {
      const fileData = {
        Id: '',
        Version: '', // 版本号
        Description: '',
        TypeId: this.activeNode.data.Id,
        Level: TYPE_FILE_MAINSYS,
        fileName: file.name, // 文件名称
        account: $utils.getCookie('account'),
        token: $utils.getCookie('token'),
        fileObj: file,
        isEdit: true,
        isSave: false,
        validate: this.$_.cloneDeep(this.validate),
        _index: this.baseData.length
      }
      this.baseData.push(fileData)
      this.fileData = fileData
    },
    // 保存刚刚新增的数据
    onSaveClick(rowData, index) {
      const { isSave } = rowData
      if (this.rowDataValidate(rowData, index)) {
        if (isSave) {
          rowData.isEdit = false
          // 更新
          // this.$apis.image
          //   .typeImageSave(rowData)
          //   .then(result => {
          //     this.$message.success(result.message)
          //     rowData.isEdit = false
          //   })
          //   .catch(errMsg => {
          //     this.$message.error(errMsg)
          //   })
        } else {
          // 新增
          this.fileUpload() // 文件上传
        }
      }
    },
    // // 编辑已经保存的数据
    // onEditClick(rowData, index) {
    //   rowData.isEdit = true
    // },
    // 删除刚刚新增但未保存的数据
    onAddDelClick(index) {
      this.fileRemove(this.baseData[index].fileObj) // 移除文件
      this.$delete(this.baseData, index)
    },
    // 删除已经保存的数据
    onDelClick(id, index) {
      this.$confirm('是否删除该文件？', '提示', { cancelButtonClass: 'el-button--cancel', closeOnClickModal: false })
        .then(() => {
          self.$apis.deviceType
            .typeUpdateFileDelete(id)
            .then(result => {
              this.$message.success(result.message)
              this.$delete(self.baseData, index)
              this.$emit('handleRefresh', this.activeNode) // 调用父组件deviceType.vue 的更新方法 handleRefresh
            })
            .catch(errMsg => {
              this.$message.error(errMsg)
              console.error(errMsg)
            })
        })
        .catch(() => {
          this.$message.warning('取消删除')
        })
    }
  }
}
</script>
<style lang="scss"></style>
