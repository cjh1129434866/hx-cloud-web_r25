<!--
 * @Author: jiapeng.Zheng
 * @Date: 2019-04-23 17:29:00
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-31 16:35:52
 * @Description: 编辑项目
 -->
<template>
  <el-dialog :visible.sync="isVisible" width="30%" @close="onClose" class="edit-dialog" :close-on-click-modal="false" :show-close="false">
    <span slot="title" class="el-dialog__title">{{ option.title }}</span>
    <el-form :model="fillForm" :rules="rules" ref="fillForm" onsubmit="return false;">
      <div class="form-group col-sm-12">
        <el-form-item :label="$t('name')" prop="ProjectName">
          <el-input v-model="fillForm.ProjectName"></el-input>
        </el-form-item>
      </div>
      <!-- 项目类型：项目 Or 站场 (编辑时不可修改) -->
      <div class="form-group col-sm-12">
        <el-form-item :label="$t('type')">
          <el-input v-model="project_type_dic[fillForm.ProjectType]" :disabled="true"></el-input>
        </el-form-item>
      </div>
      <!-- 所属项目：若父项目ID(ProjectId)存在，则所属项目就是父项目  -->
      <div class="form-group col-sm-12" v-if="fillForm.ProjectId">
        <el-form-item :label="$t('parentProject')">
          <el-input v-model="parentProject.namePath" :disabled="true"></el-input>
        </el-form-item>
      </div>
      <!-- 所属项目：若父项目不存在，且新增的是站场(fillForm.ProjectType === project_type_station)，则需用户手动选择项目 -->
      <div class="form-group col-sm-12" v-else-if="String(fillForm.ProjectType) === String(project_type_station)">
        <el-form-item :label="$t('parentProject')" prop="ParentId">
          <project-type-cascader v-model="fillForm.ParentId" :name="$t('parentProject')" :type="project_type_project"></project-type-cascader>
        </el-form-item>
      </div>
      <!-- 所属项目：若父项目不存在，且新增的是项目，则说明新增的是顶级项目，顶级项目没有所属项目，且只有管理员有添加顶级项目的权限 -->
      <div v-else class="form-group col-sm-12">
        <el-form-item :label="$t('parentProject')">
          <el-input :placeholder="`顶级项目无${$t('parentProject')}`" :disabled="true"></el-input>
        </el-form-item>
      </div>
      <!-- 所属区域：若父项目ID(ProjectId)存在，且新增的是站场，则站场所属区域就是所属项目绑定的区域 -->
      <div class="form-group col-sm-12" v-if="fillForm.ProjectId && String(fillForm.ProjectType) === String(project_type_station)">
        <el-form-item :label="$t('projectRegion')">
          <el-input v-model="parentProject.RegionPath" :disabled="true"></el-input>
        </el-form-item>
      </div>
      <!-- 所属区域：必須所属项目不为空才显示所属区域,或新增的顶级项目(fillForm.ProjectId为空，fillForm.ProjectType === project_type_project) -->
      <div class="form-group col-sm-12" v-else-if="(fillForm.ParentId && fillForm.ParentId.id) || String(fillForm.ProjectType) === String(project_type_project)">
        <el-form-item :label="$t('projectRegion')" prop="Regions">
          <el-cascader
            v-model="fillForm.Regions"
            :placeholder="$t('pleaseSelect') + $t('area')"
            change-on-select
            filterable
            :show-all-levels="false"
            :options="regionsOptions"
            :props="regionsProps"
            @change="regionsChange"
          ></el-cascader>
        </el-form-item>
      </div>
      <!-- 所属地域：
        1、只有场站(fillForm.ProjectType === project_type_station)需绑定地域；
        2、只有选中了区域才会加载地域
      -->
      <div class="form-group col-sm-12" v-if="String(fillForm.ProjectType) === String(project_type_station) && fillForm.Regions.length > 0">
        <el-form-item :label="$t('projectArea')" prop="Area">
          <el-cascader
            v-model="fillForm.Area"
            :placeholder="$t('pleaseSelect') + $t('region')"
            change-on-select
            filterable
            :show-all-levels="false"
            :options="areaOptions"
            :props="areaProps"
            @change="areaChange"
          ></el-cascader>
        </el-form-item>
      </div>
      <!-- <div class="form-group col-sm-12" v-if="String(fillForm.ProjectType) === project_type_station && fillForm.Area.length > 0">
        <el-form-item label="站场地址" prop="Address">
          <el-input v-model="fillForm.Address"></el-input>
        </el-form-item>
      </div>-->
      <div class="form-group col-sm-12">
        <el-form-item :label="$t('projectClient')" prop="ClientId">
          <el-select v-model="fillForm.ClientId" :placeholder="$t('pleaseSelect') + $t('client')" filterable clearable>
            <el-option v-for="(value, key) in clientList" :key="key" :label="value.ClientName" :value="value.Id"></el-option>
          </el-select>
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
import { PROJECT_TYPE_STATION, PROJECT_TYPE_PROJECT, PROJECT_TYPE_DIC, REGION_TOP_CODE } from '@constants/dictionaries'
import projectTypeCascader from '@views/project/projectTypeCascader'

let _this

export default {
  name: 'project-add-dialog',

  props: {
    value: {
      type: Boolean,
      required: true
    },
    pdata: {
      type: Object,
      default() {
        return {
          ProjectName: '',
          ProjectType: '',
          ClientId: ''
        }
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
      initRegionCode: REGION_TOP_CODE,
      project_type_dic: PROJECT_TYPE_DIC,
      project_type_project: PROJECT_TYPE_PROJECT,
      project_type_station: PROJECT_TYPE_STATION,
      isVisible: false,
      clientList: [],
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
      parentNodeflag: { 0: true }, // 保存状态为 indeterminate 的节点的 code
      parentProject: {
        namePath: ''
      }, // 所属项目对象
      fillForm: {
        ProjectName: '', // 项目名称
        ParentId: { id: '' },
        ClientId: '', // 客户信息ID
        FullName: '', // 完整路径名称
        FullId: '', // 完整路径标示
        Regions: [], // 所属区域
        Area: [] // 所属地域
      },
      rules: {
        ProjectName: [
          {
            required: true,
            message: '请输入名称',
            trigger: 'blur'
          },
          {
            min: 1,
            max: 25,
            message: '长度在 1 到 25 个字符',
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
        ParentId: [
          {
            required: true,
            type: 'object',
            message: '请选择所属项目',
            trigger: 'blur',
            validator(rule, value, callback) {
              if (!value.id) {
                callback(new Error('请选择所属项目'))
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
    this.$apis.client
      .getAll()
      .then(client => {
        this.clientList = client.list
      })
      .catch(errMsg => {
        this.$message.error(errMsg)
      })
    // 若存在父项目，则获取父项目的信息当作所属项目
    if (this.pdata.ProjectId) {
      let parentProject = await this.$apis.project.findProject(this.pdata.ProjectId)
      parentProject = parentProject.Data
      const { FullName, ProjectName, RegionId } = parentProject
      parentProject.namePath = FullName ? `${FullName}/${ProjectName}` : ProjectName
      this.parentProject = parentProject
      // 加载当前项目绑定的区域下的区域
      this.loadRegions(RegionId, RegionId.substring(0, RegionId.length - 3))
    } else {
      // 加载所有的区域
      this.loadRegions(this.initRegionCode, this.initRegionCode)
    }
  },

  watch: {
    async value(newVal) {
      _this = this // 重新对 _this 赋值，因为该弹窗组件被编辑、新增共用
      if (newVal) {
        // 站场下面不能新建项目
        if (String(this.parentProject.ProjectType) === String(PROJECT_TYPE_STATION) && String(this.pdata.ProjectType) === String(PROJECT_TYPE_PROJECT)) {
          this.$message.warning(`${this.$t('sites')}下不能新建${this.$t('project')}`)
          return false
        }
        // 站场下面不能新建站场
        if (String(this.parentProject.ProjectType) === String(PROJECT_TYPE_STATION) && String(this.pdata.ProjectType) === String(PROJECT_TYPE_STATION)) {
          this.$message.warning(`${this.$t('sites')}下不能新建${this.$t('sites')}`)
          return false
        }
        this.isVisible = newVal
        const fillForm = JSON.parse(JSON.stringify(this.pdata)) // 使用两次JSON对数据进行深拷贝
        // 以父项目的区域ID从区域列表中遍历出所有的区域路径，作为当前项目的区域Id
        fillForm.Regions = $utils.selectDataFromTree({
          data: this.regionsList,
          parentKey: 'ParentId',
          parentNoddeflag: null,
          serachKey: 'Id',
          serachData: this.parentProject.RegionId
        })
        // 加载对应的地域列表
        this.regionsChange(fillForm.Regions)
        this.fillForm = fillForm
      }
    },
    // 通过选择的项目不同，加载不同的区域列表
    async 'fillForm.ParentId'(newVal) {
      const id = newVal.id
      if (id) {
        // 根据所选的项目的ID获取所属项目的信息
        const projectObj = await this.$apis.project.findProject(id)
        // 获取所属项目的区域ID( RegionId )
        const { RegionId } = projectObj.Data
        // 根据所属项目绑定的区域获取并加载区域列表
        this.loadRegions(RegionId, RegionId.substring(0, RegionId.length - 3))
      }
    }
  },

  methods: {
    /**
     * 根据区域编码异步获取区域信息，并格式化
     * @param {String} regionCode       区域编码
     * @param {String} parentNodeflag   父级区域编码
     */
    async loadRegions(regionCode, parentNodeflag = null) {
      // 区域
      const regionsList = await this.$apis.areaRegion.findListRegion(regionCode)
      // 保存区域列表
      this.regionsList = regionsList.Data
      // 级联结构的区域
      this.regionsOptions = $utils.treeDataFormat({
        data: this.regionsList,
        idName: 'Id',
        parentIdName: 'ParentId',
        parentNodeflag: parentNodeflag
      })
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
    /**
     * 地域 change 事件
     * 1、获取子地域列表，并添加到父地域的 children 属性下
     * 2、绑定地址
     * 3、绑定地理坐标
     */
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
      // 重新设置 areaOptions,相当于强制使 el-cascader 更新
      this.$set(this.areaOptions, 0, this.areaOptions[0])
      // 根据选中的地域ID,从地域列表( areaOptions )中筛选出该地域域
      const valueArray = $utils.getCascaderObj(val, this.areaOptions, this.areaProps)
      // 修改地址( Address )
      this.fillForm.Address = valueArray
        .map(item => {
          return item.Name
        })
        .join('')
      // 绑定地理坐标
      const { Longitude, Latitude } = valueArray[valueArray.length - 1]
      this.fillForm.Position = `${Longitude},${Latitude}`
    },
    onClose() {
      this.$emit('input', this.isVisible)
      this.$refs.fillForm.resetFields()
    },

    onSureClick() {
      this.$refs.fillForm.validate(async valid => {
        if (!valid) return
        const { id, pid, pName } = this.fillForm.ParentId // 获取选中项目级联框对象
        const data = { ...this.fillForm, ParentId: id || undefined } // 格式化 ParentId
        data.RegionId = data.Regions[data.Regions.length - 1] // 格式化区域编码
        data.AreaId = data.Area[data.Area.length - 1] // 格式化区域编码
        // 若 pid 或 pName 不存在，则手动获取父级项目信息
        if (pid === undefined || pName === undefined) {
          // 若父项目ID不存在，则说明新增的是一级项目，一级项目不需要FullName 和 FullId
          const { FullName, FullId, ProjectName, Id } = this.parentProject
          data.FullName = FullName !== null && FullName !== undefined ? `${FullName}/${ProjectName}` : ProjectName
          data.FullId = FullId !== null && FullId !== undefined ? `${FullId}/${Id}` : Id
        } else {
          data.FullName = pName.join('/')
          data.FullId = pid.join('/')
        }
        console.log(data)
        // 新增
        this.$apis.project
          .projectAdd(data)
          .then(result => {
            this.$message.success(result.Message)
            this.isVisible = false
            this.$emit('dispatch-data', data)
          })
          .catch(errMsg => {
            console.error(errMsg)
            this.$message.error(errMsg)
          })
      })
    }
  }
}
</script>

<style type="text/css" lang="scss">
.edit-dialog {
  min-width: 500px;
  .area-set-tree {
    max-height: 200px;
  }
}
</style>
