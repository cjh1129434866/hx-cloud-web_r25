<!--
 * @Author: jiapeng.Zheng
 * @Date: 2018-12-18 17:42:41
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-31 16:48:33
 * @Description: 设备回收站
 -->
<template>
  <el-dialog :visible="isVisible" width="30%" @close="onClose" class="edit-dialog" :close-on-click-modal="false" :show-close="false">
    <span slot="title" class="el-dialog__title">{{ option.title }}</span>
    <el-form :model="fillForm" :rules="rules" ref="fillForm">
      <div class="form-group col-sm-11">
        <el-form-item label="设备编号：" prop="DeviceNo">{{ fillForm.DeviceNo }}</el-form-item>
        <el-form-item label="设备名称：" prop="DeviceName">{{ fillForm.DeviceName }}</el-form-item>
        <!-- <el-form-item label="设备描述" prop="DeviceDescription">
          <el-input v-model="fillForm.DeviceDescription"></el-input>
        </el-form-item>-->
        <el-form-item label="设备类型：" prop="TypeId">{{ fillForm.TypeName }}</el-form-item>
        <el-form-item label="所属站场" prop="projectId">
          <project-type-cascader v-model="fillForm.projectId" name="所属站场"></project-type-cascader>
          <!-- <el-cascader placeholder="请选择所属站场"
            v-model="fillForm.projectId"
            :show-all-levels="false"
            :options="projectList"
            :props="cascaderProps"
            @active-item-change="onCascaderItemChange"
          ></el-cascader>-->
        </el-form-item>
        <el-form-item label="所属区域" prop="Regions" v-if="fillForm.projectId && fillForm.projectId.id">
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
import projectTypeCascader from '@views/project/projectTypeCascader'

let _this

export default {
  name: 'recycle-bin-edit',

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
        return { title: '编辑' }
      }
    }
  },

  data() {
    return {
      isVisible: false,
      projectList: [],
      cascaderProps: {
        children: 'children',
        label: 'Name',
        value: 'Id'
      },
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
      fillForm: {
        projectId: { id: '' },
        DeviceNo: '',
        DeviceName: '',
        DeviceDescription: '',
        TypeName: '',
        TypeId: '',
        Regions: [], // 所属区域
        Area: [] // 所属地域
      },
      rules: {
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
        projectId: [
          {
            required: true,
            type: 'object',
            message: '请选择所属站场',
            trigger: 'blur',
            validator(rule, value, callback) {
              if (!value.id) {
                callback(new Error('请选择所属站场'))
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

  watch: {
    value(newVal) {
      this.isVisible = newVal
      const fillForm = JSON.parse(JSON.stringify(this.pdata)) // 使用两次JSON对数据进行深拷贝
      fillForm.projectId = { id: fillForm.ProjectId } // 所属站场， ProjectId:所属站场的ID,回收站的projectId为null
      fillForm.Regions = []
      fillForm.TypeName = this.$commonParam.deviceTypeNameDict[fillForm.TypeId]
      this.fillForm = fillForm
    },
    // 所属项目
    async 'fillForm.projectId'(newVal) {
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
        this.fillForm.Regions = this.$utils.selectDataFromTree({
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
  components: { projectTypeCascader },

  created() {
    _this = this
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
      this.regionsOptions = this.$utils.treeDataFormat({
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
      const valueArray = this.$utils.getCascaderObj(val, this.regionsOptions, this.regionsProps)
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

    onClose() {
      this.isVisible = false
      this.$emit('input', this.isVisible)
      this.$refs.fillForm.resetFields()
    },

    onSureClick() {
      this.$refs.fillForm.validate(valid => {
        if (!valid) return
        const { id, pid, pName } = this.fillForm.projectId
        this.fillForm.FullName = pName.join('/')
        this.fillForm.FullId = pid.join('/')
        // this.fillForm.projectId = projectId[projectId.length - 1]
        const data = { ...this.fillForm, projectId: id }
        data.RegionId = data.Regions[data.Regions.length - 1] // 格式化区域编码
        data.AreaId = data.Area[data.Area.length - 1] // 格式化区域编码
        this.$apis.device
          .changeDeviceProject(data)
          .then(result => {
            this.$message.success(result.Message)
            this.$emit('dispatch-data', data)
            this.isVisible = false
          })
          .catch(errMsg => {
            this.$message.error(errMsg)
            console.error(errMsg)
          })
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
