<!--
 * @Author: jiapeng.Zheng
 * @Date: 2019-01-22 11:38:06
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-31 16:31:12
 * @Description: 设备类型模式
 -->
<template>
  <el-card class="box-card ">
    <div slot="header" class="clearfix">
      <span style="font-weight:bold">{{ activeNode.data.DeviceTypeName }} /</span>
      <span>{{ $t('deviceType') + $t('mode') }}</span>
    </div>
    <el-form class="form-group" :inline="true" v-if="activeNode.data.Id">
      <el-form-item>
        <el-button type="primary" icon="plus" @click="onAddClick()">{{ $t('add') }}</el-button>
      </el-form-item>
    </el-form>
    <el-tree
      class="schema-tree"
      v-loading="loading"
      :data="tableData"
      :props="defaultProps"
      :show-checkbox="false"
      node-key="Id"
      default-expand-all
      :highlight-current="true"
      :expand-on-click-node="false"
      :render-content="renderContent"
    ></el-tree>
    <el-dialog :visible="isDialogVisible" width="30%" @close="isDialogVisible = false" class="edit-dialog device-type-schema" :close-on-click-modal="false" :show-close="false">
      <span slot="title" class="el-dialog__title">
        【{{ activeNode.data.DeviceTypeName }}】 <span>{{ isAdd ? $t('adds') : $t('edits') }}</span
        >{{ $t('deviceType') + $t('mode') }}
      </span>
      <el-form :model="fillForm" :rules="rules" ref="fillForm">
        <div class="form-group col-sm-11">
          <el-form-item label="模式类型" prop="SchemaType">
            <el-radio-group v-model="fillForm.SchemaType" :disabled="!isAdd || !isAddTopNode">
              <el-radio v-for="(value, key) in type_schema_config_dic" :label="key" :key="key">{{ value }}</el-radio>
            </el-radio-group>
            <el-tooltip content="只有新增顶级节点时才可以选择模式类型" placement="top">
              <icon class="url-tips" name="help"></icon>
            </el-tooltip>
          </el-form-item>
          <el-form-item label="数据定义Key" prop="Key">
            <el-input v-model="fillForm.Key"></el-input>
          </el-form-item>
          <el-form-item label="数据定义Value" prop="Value">
            <el-input v-model.number="fillForm.Value"></el-input>
          </el-form-item>
          <el-form-item label="模式名称" prop="Name">
            <el-input v-model="fillForm.Name"></el-input>
          </el-form-item>
        </div>
      </el-form>
      <span slot="footer">
        <el-button type="cancel" @click="isDialogVisible = false">{{ $t('cancel') }}</el-button>
        <el-button type="primary" @click="onSureClick">{{ $t('confirm') }}</el-button>
      </span>
    </el-dialog>
  </el-card>
</template>

<script>
import { $validate } from '@helper'
import { TYPE_SCHEMA_CONFIG_DIC } from '@constants/dictionaries'

let __this

export default {
  name: 'device-type-schema',

  props: {
    activeNode: {
      required: true
    }
  },

  data() {
    return {
      loading: false,
      isDialogVisible: false,
      isAdd: true, // 编辑Or新增
      isAddTopNode: true, // 新增的子节点Or顶级节点
      type_schema_config_dic: TYPE_SCHEMA_CONFIG_DIC,
      defaultProps: {
        children: 'Child',
        label: 'Name'
      },
      fillForm: {
        SchemaType: '',
        Key: '',
        Name: '',
        ParentId: '',
        Value: '',
        TypeId: ''
      },
      rules: {
        Key: [
          {
            required: true,
            message: '请输入数据定义Key',
            trigger: 'blur'
          },
          {
            min: 1,
            max: 20,
            message: '长度在 1 到 20 个字符',
            trigger: 'blur'
          }
        ],
        Name: [
          {
            required: true,
            message: '请输入模式名称',
            trigger: 'blur'
          },
          {
            min: 1,
            max: 20,
            message: '长度在 1 到 20 个字符',
            trigger: 'blur'
          }
        ],
        Value: [
          {
            type: 'number',
            message: '请输入数字',
            trigger: 'blur'
          },
          {
            trigger: 'blur',
            ...$validate.checkNumber().rule()
          }
        ]
      },
      tableData: [],
      searchForm: {
        SchemaType: '',
        Key: '',
        Name: '',
        ParentId: '',
        Value: '',
        TypeId: ''
      }
    }
  },
  computed: {},

  watch: {
    'activeNode.data'(newVal) {
      this.searchForm.TypeId = newVal.Id
      this.fillForm.TypeId = newVal.Id
      this.handleRefresh()
    }
  },

  components: {},

  created() {
    __this = this
  },

  filters: {},

  methods: {
    // 树节点的内容区的渲染 Function
    renderContent(h, { data }) {
      // 删除按钮
      const deleteBtn = (
        <el-button size="mini" type="danger" on-click={() => __this.onDelClick(data)}>
          {__this.$t('delete')}
        </el-button>
      )

      // 添加按钮
      const appendBtn = (
        <el-button size="mini" type="primary" on-click={() => __this.onSubNodeAdd(data)}>
          {__this.$t('append')}
        </el-button>
      )
      // 编辑按钮
      const editBtn = (
        <el-button size="mini" type="primary" on-click={() => __this.onEditClick(data)}>
          {__this.$t('edit')}
        </el-button>
      )

      const treeNameEle = (
        <span>
          <span class="tree-name">
            [{TYPE_SCHEMA_CONFIG_DIC[data.SchemaType]}] {data.Name}（{data.Key}：{data.Value}）
          </span>
        </span>
      )
      const treeBtnEle = (
        <span style="float: right; margin-right: 35px">
          {appendBtn}
          {editBtn}
          {deleteBtn}
        </span>
      )

      const resultEle = (
        <div style="display: inline-block;width: 100%;">
          {treeBtnEle}
          {treeNameEle}
        </div>
      )
      return resultEle
    },
    /* ----------------------------refresh---------------------------- */
    // 表单刷新
    handleRefresh() {
      this.loading = true
      if (this.searchForm.TypeId) {
        this.$apis.deviceType
          .getTypeSchema(this.searchForm.TypeId)
          .then(result => {
            this.tableData = result.List
          })
          .catch(errMsg => {
            console.error(errMsg)
            __this.$message.error(String(errMsg))
          })
          .fin(() => {
            this.loading = false
          })
      }
    },

    // （新增/编辑）确认事件
    onSureClick() {
      const data = JSON.parse(JSON.stringify(this.fillForm))

      this.$refs.fillForm.validate(valid => {
        if (!valid) return
        if (this.isAdd) {
          // 新增
          this.$apis.deviceType
            .addSchema(data)
            .then(result => {
              this.$message.success(result.message)
              this.isDialogVisible = false
              this.handleRefresh()
            })
            .catch(errMsg => {
              console.error(errMsg)
              this.$message.error('新增模式失败')
            })
        } else {
          // 编辑
          this.$apis.deviceType
            .updateSchema(data)
            .then(result => {
              this.$message.success(result.message)
              this.isDialogVisible = false
              this.handleRefresh()
            })
            .catch(errMsg => {
              console.error(errMsg)
              this.$message.error('修改模式失败')
            })
        }
      })
    },
    // 新增
    onAddClick() {
      this.isAdd = true
      this.isAddTopNode = true
      this.isDialogVisible = true
      this.fillForm.Name = ''
      this.fillForm.Key = ''
      this.fillForm.ParentId = ''
      this.fillForm.SchemaType = '0'
      this.fillForm.Value = ''
    },
    // tree添加按钮事件
    onSubNodeAdd(data) {
      this.isAdd = true
      this.isAddTopNode = false
      this.isDialogVisible = true
      this.fillForm.Name = ''
      this.fillForm.Key = ''
      this.fillForm.Value = ''
      this.fillForm.ParentId = data.Id
      this.fillForm.SchemaType = String(data.SchemaType)
    },
    // 编辑
    onEditClick(rowData) {
      this.isAdd = false
      this.isAddTopNode = false
      this.isDialogVisible = true
      this.fillForm = JSON.parse(JSON.stringify(rowData))
      this.fillForm.SchemaType = String(this.fillForm.SchemaType)
    },
    // 删除模式
    onDelClick(rowData) {
      this.$confirm('是否删除该记录？', '提示', { cancelButtonClass: 'el-button--cancel', closeOnClickModal: false })
        .then(() => {
          this.$apis.deviceType
            .removeSchema(rowData.Id)
            .then(result => {
              this.$message.success(result.message)
              this.handleRefresh()
            })
            .catch(errMsg => {
              this.$message.error(String(errMsg))
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
<style lang="scss">
.device-type-schema {
  .el-form-item__label {
    width: 10em;
  }
  .el-dialog .el-form-item__content {
    margin-left: 10em;
  }
}
</style>
