<!--
 * @Author: jiapeng.Zheng
 * @Date: 2018-08-13 13:55:11
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-31 16:26:39
 * @Description: 菜单编辑
 -->
<template>
  <el-dialog :visible="isVisible" width="30%" @close="onClose" class="edit-dialog" :close-on-click-modal="false" :show-close="false">
    <span slot="title" class="el-dialog__title">{{ option.title }}</span>
    <el-form :model="fillForm" :rules="rules" ref="fillForm" onsubmit="return false;">
      <div class="form-group col-sm-11">
        <el-form-item label="菜单图标" prop="Icon">
          <el-popover ref="popoverIcon" placement="right" width="602" trigger="hover">
            <icon-list @iconClick="iconClick"></icon-list>
          </el-popover>
          <icon v-popover:popoverIcon class="input-icon icons" :name="fillForm.Icon"></icon>
        </el-form-item>
      </div>
      <div class="form-group col-sm-11">
        <el-form-item label="菜单类型" prop="MenuType">
          <el-radio-group v-model="fillForm.MenuType">
            <el-radio-button v-for="(value, key) in menuTypeDic" :label="key" :key="key">{{ value }}</el-radio-button>
          </el-radio-group>
          <el-tooltip content="只有导航菜单可以挂子菜单" placement="top">
            <icon class="url-tips" name="help"></icon>
          </el-tooltip>
        </el-form-item>
      </div>
      <div class="form-group col-sm-11" v-show="fillForm.MenuType !== defaultMenuType">
        <el-form-item label="菜单模块" prop="NameList">
          <el-cascader
            v-model="fillForm.NameList"
            placeholder="请选择菜单模块"
            filterable
            expand-trigger="click"
            :show-all-levels="false"
            :change-on-select="false"
            :options="menuConfig"
            :props="defaultProps"
            @change="navMenuChange"
            ref="navMenuCascader"
          ></el-cascader>
        </el-form-item>
      </div>
      <div class="form-group col-sm-11" v-if="fillForm.MenuType !== defaultMenuType">
        <el-form-item label="菜单地址" prop="Url">
          <el-input v-model="fillForm.Url">
            <template slot="append">
              <el-tooltip content="若菜单地址有:id,请把:id换成具体的数值" placement="top">
                <icon class="url-tips" name="help"></icon>
              </el-tooltip>
            </template>
          </el-input>
        </el-form-item>
      </div>
      <div class="form-group col-sm-11">
        <el-form-item label="菜单名称" prop="Name">
          <el-input v-model="fillForm.Name"></el-input>
        </el-form-item>
      </div>
      <div class="form-group col-sm-11">
        <el-form-item label="菜单备注" prop="Remarks">
          <el-input v-model="fillForm.Remarks"></el-input>
        </el-form-item>
      </div>
    </el-form>
    <span slot="footer">
      <el-button type="cancel" @click="isVisible = false">{{ $t('cancel') }}</el-button>
      <el-button type="primary" @click="onSureClick">{{ $t('confirm') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { MENU_TYPE_DIC } from '@constants/dictionaries'
import MenuConfig from '@router/routes'
import { $utils } from '@helper'

export default {
  name: 'menuEditDialog',

  props: {
    value: {
      type: Boolean,
      required: true
    },
    pdata: {
      type: Object,
      default() {
        return {
          Name: ''
        }
      }
    },
    option: {
      type: Object,
      default() {
        return { title: '编辑', type: 'edit' }
      }
    },
    defaultMenuType: {
      type: String,
      default: '0'
    }
  },

  data() {
    return {
      isVisible: false,
      defaultIcon: 'tips',
      menuSymbol: ' / ', // 注：斜杠/ 前后的空格是必须的
      menuTypeDic: MENU_TYPE_DIC,
      menuConfig: MenuConfig,
      defaultProps: {
        children: 'children',
        label: '',
        value: 'path',
        disabled: 'disabled'
      },
      fillForm: {
        MenuType: ''
      },
      rules: {
        Name: [
          {
            required: true,
            message: '请输入菜单名称',
            trigger: 'blur'
          },
          {
            min: 1,
            max: 6,
            message: '长度在 1 到 6 个字符',
            trigger: 'blur'
          }
        ],
        Url: [
          {
            required: true,
            message: '请输入菜单地址',
            trigger: 'blur'
          },
          {
            min: 1,
            max: 100,
            message: '长度在 1 到 100 个字符',
            trigger: 'blur'
          }
        ],
        Remarks: [
          {
            min: 1,
            max: 100,
            message: '长度在 1 到 100 个字符',
            trigger: 'blur'
          }
        ],
        MenuType: [
          {
            required: true,
            message: '请选择菜单类型',
            trigger: 'change'
          }
        ]
      }
    }
  },

  computed: {},

  watch: {
    $currentLang() {
      this.defaultProps.label = this.$currentLang
    },
    value(newVal) {
      this.isVisible = newVal
      this.fillForm = JSON.parse(JSON.stringify(this.pdata)) // 使用两次JSON对数据进行深拷贝
      this.fillForm.Icon = this.fillForm.Icon ? this.fillForm.Icon : this.defaultIcon
      this.fillForm.MenuType = String(this.fillForm.MenuType || this.defaultMenuType)
      if (this.fillForm.MenuType !== this.defaultMenuType) {
        const url = (this.fillForm.Url || '').split(this.menuSymbol)
        this.fillForm.NameList = url
      }
    }
  },

  created() {
    this.defaultProps.label = this.$currentLang
  },

  methods: {
    // icon图标click事件
    iconClick(iconName) {
      this.$refs.popoverIcon.doToggle()
      this.fillForm.Icon = iconName
    },
    // 导航菜单change事件
    navMenuChange(newVal) {
      const vals = $utils.getCascaderObj(this.fillForm.NameList, this.menuConfig, this.defaultProps)
      const { componentUrl } = vals[vals.length - 1]
      this.fillForm.Router = JSON.stringify({ componentUrl, path: newVal.join(this.menuSymbol) })

      this.fillForm.Url = newVal.join(this.menuSymbol)
      this.$forceUpdate()
    },
    onClose() {
      this.isVisible = false
      this.$emit('input', this.isVisible)
    },

    onSureClick() {
      this.$refs.fillForm.validate(valid => {
        if (!valid) return
        if (this.option.type === 'edit') {
          this.$apis.sysMenu
            .update(this.fillForm)
            .then(result => {
              this.$message.success(result.message)
              this.$emit('dispatch-data', this.fillForm)
              this.isVisible = false
            })
            .catch(errMsg => {
              this.$message.error(errMsg)
              console.error(errMsg)
            })
        } else {
          this.$apis.sysMenu
            .add(this.fillForm)
            .then(result => {
              this.$message.success(result.message)
              this.$emit('dispatch-data', this.fillForm)
              this.isVisible = false
            })
            .catch(errMsg => {
              this.$message.error(errMsg)
              console.error(errMsg)
            })
        }
      })
    }
  },
  components: {
    IconList: resolve => require.ensure([], () => resolve(require('@views/common/IconList')), 'iconList')
  }
}
</script>
<style type="text/css" lang="scss">
@import '~@assets/scss/variables.scss';
.url-tips {
  cursor: pointer;
  font-size: $font-default;
  line-height: $font-default;
  margin: 0;
  color: $element-danger-color;
}
</style>
