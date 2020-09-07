<!--
 * @Author: jiapeng.Zheng
 * @Date: 2018-12-18 17:42:41
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-31 16:49:43
 * @Description: 设备编辑
 -->
<template>
  <el-dialog :visible="isVisible" width="30%" @close="onClose" class="edit-dialog" :close-on-click-modal="false" :show-close="false">
    <span slot="title" class="el-dialog__title">{{ option.title }}</span>
    <el-form :model="fillForm" :rules="rules" ref="fillForm">
      <div class="form-group col-sm-11">
        <el-form-item label="设备编号" prop="DeviceNo">
          <el-input v-model="fillForm.DeviceNo"></el-input>
        </el-form-item>
        <el-form-item label="设备名称" prop="DeviceName">
          <el-input v-model="fillForm.DeviceName"></el-input>
        </el-form-item>
        <el-form-item label="设备描述" prop="DeviceDescription">
          <el-input v-model="fillForm.DeviceDescription"></el-input>
        </el-form-item>
        <!-- 只有 “我的设备”或“项目下的全部设备” 才有 “所属站场” 字段 -->
        <el-form-item label="所属站场" prop="ProjectId" v-if="isMyDevice || String(nowProject.ProjectType) === String(project_type_project)">
          <!-- 编辑时不能修改“所属站场” -->
          <project-type-cascader v-model="fillForm.ProjectId" :nowProject="nowProject" name="所属站场" :disabled="option.opt === 'edit'"> </project-type-cascader>
        </el-form-item>
        <el-form-item label="设备类型" prop="TypeId">
          <el-cascader
            v-model="fillForm.TypeId"
            placeholder="设备类型"
            change-on-select
            filterable
            :show-all-levels="false"
            :options="cascaderType"
            :props="defaultProps"
            @change="typeChange"
            ref="deviceType"
          ></el-cascader>
        </el-form-item>
        <!-- 只有选择了设备类型且为新增（DeviceSn不存在）才能选择模板 -->
        <el-form-item v-if="fillForm.TypeId.length && !fillForm.DeviceSn" label="类型模板" prop="TempId">
          <el-select v-model="fillForm.TempId">
            <el-option v-for="(value, key) in deviceTypeTemp" :key="key" :label="value.TempName" :value="value.Id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="所属区域"
          prop="Regions"
          v-if="(isMyDevice && fillForm.ProjectId && fillForm.ProjectId.id) || (!isMyDevice && fillForm.ProjectId && fillForm.ProjectId.id)"
        >
          <el-cascader
            v-model="fillForm.Regions"
            :placeholder="$t('pleaseSelect') + $t('area')"
            change-on-select
            filterable
            :show-all-levels="false"
            :options="regionsOptions"
            :props="regionsProps"
            @change="regionsChange"
            :disabled="option.opt === 'edit'"
            ref="regionsType"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="所属地域" prop="Area" v-if="fillForm.Regions.length > 0">
          <el-cascader
            v-model="fillForm.Area"
            :placeholder="$t('pleaseSelect') + $t('region')"
            change-on-select
            filterable
            :show-all-levels="false"
            :options="areaOptions"
            :props="areaProps"
            :disabled="option.opt === 'edit'"
            @change="areaChange"
            ref="areaType"
          ></el-cascader>
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
import { $utils } from '@helper'
import { REGION_TOP_CODE, PROJECT_TYPE_PROJECT } from '@constants/dictionaries'
import projectTypeCascader from '@views/project/projectTypeCascader'

let _this

export default {
  name: 'EditDialog',

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
    nowProject: {
      type: Object,
      default() {
        return {}
      }
    },
    option: {
      type: Object,
      default() {
        return { title: '编辑', opt: 'edit' }
      }
    },
    selectType: {
      type: Array
    },
    cascaderType: {
      type: Array
    },
    isMyDevice: {
      type: Boolean
    }
  },

  data() {
    return {
      initRegionCode: REGION_TOP_CODE,
      project_type_project: PROJECT_TYPE_PROJECT,
      subDialogIsVisible: false,
      isVisible: false,
      defaultProps: {
        // “设备类型”级联框props
        children: 'children',
        label: 'DeviceTypeName',
        value: 'Id'
      },
      deviceTypeTemp: [], // 设备类型模板
      regionsList: [], // 父项目绑定的区域列表，当前项目的区域只能选择父项目绑定的区域
      regionsOptions: [], // regionsList 格式化后符合级联框(el-cascader)组件的数据格式
      regionsProps: {
        // "区域"级联框(el-cascader)的 props 属性
        children: 'children',
        label: 'Name',
        value: 'Id'
      },
      areaOptions: [], // 格式化后符合级联框(el-cascader)组件的数据格式
      areaProps: {
        // "地域"级联框(el-cascader)的 props 属性
        children: 'children',
        label: 'Name',
        value: 'Code'
      },
      parentProject: {}, // 所属项目对象
      fillForm: {
        ProjectId: {},
        DeviceNo: '',
        DeviceName: '',
        DeviceDescription: '',
        TypeId: [],
        TempId: '',
        Regions: [], // 所属区域
        Area: [] // 所属地域
      },
      rules: {
        DeviceNo: [
          {
            required: true,
            message: '请输入设备编码',
            trigger: 'blur'
          },
          {
            min: 2,
            max: 100,
            message: '长度在 2 到 100 个字符',
            trigger: 'blur'
          }
        ],
        DeviceName: [
          {
            required: true,
            message: '请输入设备名称',
            trigger: 'blur'
          },
          {
            min: 2,
            max: 100,
            message: '长度在 2 到 100 个字符',
            trigger: 'blur'
          }
        ],
        DeviceDescription: [
          {
            required: true,
            message: '请输入设备描述',
            trigger: 'blur'
          },
          {
            min: 2,
            max: 100,
            message: '长度在 2 到 100 个字符',
            trigger: 'blur'
          }
        ],
        TypeId: [
          {
            required: true,
            type: 'array',
            message: '请选择设备类型',
            trigger: 'blur'
          }
        ],
        Regions: [
          {
            required: true,
            type: 'array',
            message: this.$t('pleaseSelect') + this.$t('area'),
            trigger: 'blur'
          }
        ],
        Area: [
          {
            required: true,
            type: 'array',
            message: this.$t('pleaseSelect') + this.$t('region'),
            trigger: 'blur'
          }
        ],
        ProjectId: [
          {
            required: this.option.opt !== 'edit', // “编辑时”取消验证“所属站场”
            type: 'object',
            message: '请选择所属的站场',
            trigger: 'blur',
            validator(rule, value, callback) {
              if (_this.option.opt !== 'edit') {
                // “编辑时”取消验证“所属项目”
                if (!value.id) {
                  callback(new Error('请选择所属的站场'))
                } else {
                  callback()
                }
              } else {
                callback()
              }
            }
          }
        ]
      }
    }
  },

  computed: {},

  components: { projectTypeCascader },
  async created() {
    _this = this
    // this.regionsList = await this.findListRegion(this.initRegionCode)
  },

  watch: {
    value(newVal) {
      _this = this
      this.isVisible = newVal
      const fillForm = JSON.parse(JSON.stringify(this.pdata)) // 使用两次JSON对数据进行深拷贝
      fillForm.Area = fillForm.AreaId ? fillForm.AreaId.split(',') : []
      fillForm.Regions = []
      fillForm.TypeId = $utils.selectDataFromTree({
        data: this.selectType,
        parentKey: 'ParentId',
        parentNoddeflag: null,
        serachKey: 'Id',
        serachData: parseInt(fillForm.TypeId)
      })
      const typeId = fillForm.TypeId[fillForm.TypeId.length - 1]
      // 通过“设备类型”获取“设备类型模板”
      if (typeId) {
        this.getDeviceTypeTemplate(typeId)
      }
      // 所属站场， ProjectId:所属站场的ID
      fillForm.ProjectId = { id: fillForm.ProjectId }
      this.fillForm = fillForm
    },
    // 所属项目
    async 'fillForm.ProjectId'(newVal) {
      const id = newVal.id
      if (id) {
        // 根据父项目的ID获取父项目
        const parentProject = await this.$apis.project.findProject(id)
        this.parentProject = parentProject.Data
        const { RegionId } = this.parentProject
        const parentRegionId = RegionId.substring(0, RegionId.length - 3)
        // parentRegionId = parentRegionId === this.initRegionCode ? null : parentRegionId
        // 根据父项目的区域编码获取父项目绑定的区域
        this.regionsList = await this.findListRegion(RegionId, parentRegionId)
        // 根据 RegionId 从 regionsList 中筛选出从父级到该节点的所有节点的数组，用于选中该节点
        this.fillForm.Regions = $utils.selectDataFromTree({
          data: this.regionsList,
          parentKey: 'ParentId',
          parentNoddeflag: null,
          serachKey: 'Id',
          serachData: this.fillForm.RegionId
        })
        // 选中该节点，同时加载对应的地域列表
        this.regionsChange(this.fillForm.Regions)
      }
    }
  },

  methods: {
    /**
     * 根据区域编码异步获取区域信息，并格式化
     * @param {String} regionCode       区域编码
     * @param {String} parentNodeflag   父级区域编码
     */
    async findListRegion(regionCode, parentNodeflag = null) {
      // 区域
      let regionsList = await this.$apis.areaRegion.findListRegion(regionCode)
      regionsList = regionsList.Data
      // 级联结构的区域
      this.regionsOptions = $utils.treeDataFormat({
        data: regionsList,
        idName: 'Id',
        parentIdName: 'ParentId',
        parentNodeflag: parentNodeflag
      })
      return regionsList
    },
    // 区域 change 事件
    regionsChange(val) {
      // 根据选中的区域ID,从区域列表( regionsOptions )中筛选出该区域
      const valueArray = $utils.getCascaderObj(val, this.regionsOptions, this.regionsProps)
      if (valueArray && valueArray.length > 0) {
        // 获取区域绑定的地域列表( Area )
        const { Area } = valueArray[valueArray.length - 1]
        // 处理地域列表，为每一级的地域添加 children 属性，用于异步存放对应的次一级地域列表
        this.areaOptions = Area.map(item => {
          item.children = []
          return item
        })
      } else {
        this.areaOptions = []
      }
    },
    // 地域 change 事件
    async areaChange(val) {
      const areaCode = val[val.length - 1]
      let subArea = await this.$apis.areaRegion.getListArea(areaCode)
      // 筛选出父项目的对象
      let thisArea = _this.areaOptions
      let opt = _this.areaOptions
      val.map(function(value) {
        for (const itm of opt) {
          if (itm[_this.areaProps.value] === value) {
            opt = itm[_this.areaProps.children]
            thisArea = itm
            return itm
          }
        }
        return null
      })
      // 级联结构的地域
      subArea = subArea.Data.map(item => {
        item.children = []
        return item
      })
      // 把子地域添加到父地域的 children 属性下
      thisArea[_this.areaProps.children] = subArea.length ? subArea : [{ [_this.areaProps.value]: this.$t('nodata'), [_this.areaProps.label]: this.$t('nodata'), disabled: true }]
      // 重新 set areaOptions,相当于强制使 el-cascader 更新
      this.$set(this.areaOptions, 0, this.areaOptions[0])
    },
    // “设备类型” change 事件
    typeChange(val) {
      const typeId = val[val.length - 1]
      this.getDeviceTypeTemplate(typeId)
    },
    // 获取设备类型模板
    getDeviceTypeTemplate(typeId) {
      this.$apis.deviceType
        .getDeviceTypeTemplate(typeId)
        .then(result => {
          this.deviceTypeTemp = result.List
        })
        .catch(errMsg => {
          this.$message.error(errMsg)
          console.error(errMsg)
        })
    },

    onClose() {
      this.$refs.fillForm.resetFields()
      this.$emit('input', this.isVisible)
    },

    onSureClick() {
      this.$refs.fillForm.validate(async valid => {
        if (!valid) return
        const TypeId = this.fillForm.TypeId
        this.fillForm.TypeId = TypeId[TypeId.length - 1]
        const { id, pid, pName } = this.fillForm.ProjectId
        const data = { ...this.fillForm, ProjectId: id }
        data.RegionId = data.Regions[data.Regions.length - 1] // 格式化区域编码
        data.AreaId = data.Area[data.Area.length - 1] // 格式化区域编码

        // 若 pid 或 pName 不存在，则手动获取所属场站信息
        if (pid === undefined || pName === undefined) {
          // 若父项目ID不存在，则说明新增的是一级项目，一级项目不需要FullName 和 FullId
          const { FullName, FullId, ProjectName, Id } = this.parentProject
          data.FullName = FullName !== null ? `${FullName}/${ProjectName}` : ProjectName
          data.FullId = FullId !== null ? `${FullId}/${Id}` : Id
        } else {
          data.FullName = pName.join('/')
          data.FullId = pid.join('/')
        }

        this.$emit('dispatch-data', data) // 对 ProjectId 重新赋值
        this.isVisible = false
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
