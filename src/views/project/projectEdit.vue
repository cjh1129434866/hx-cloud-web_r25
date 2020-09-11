<!--
 * @Author: jiapeng.Zheng
 * @Date: 2019-04-23 10:41:02
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-31 16:35:41
 * @Description: 新增项目
 -->
<template>
  <el-dialog :visible="isVisible" width="30%" @close="onClose" class="edit-dialog" :close-on-click-modal="false" :show-close="false">
    <span slot="title" class="el-dialog__title">{{ option.title }}</span>
    <el-form :model="fillForm" :rules="rules" ref="fillForm" onsubmit="return false;">
      <!-- 项目名称 -->
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
      <!-- 所属项目：顶级项目无所属项目 (编辑时不可修改) -->
      <div class="form-group col-sm-12">
        <el-form-item :label="$t('parentProject')">
          <el-input v-if="fillForm.FullName" v-model="fillForm.FullName" :disabled="true"></el-input>
          <el-input v-else :placeholder="`顶级项目无${$t('parentProject')}`" :disabled="true"></el-input>
        </el-form-item>
      </div>
      <!-- 所属区域：即区域路径 (编辑时不可修改)-->
      <div class="form-group col-sm-12">
        <el-form-item :label="$t('projectRegion')">
          <el-input v-model="fillForm.RegionPath" :disabled="true"></el-input>
        </el-form-item>
      </div>
      <!-- 站场地址：只有站场才会绑定地址(编辑时不可修改，会根据所属地域的选择而改变，同时地理坐标 Position 也会发生变化) -->
      <div class="form-group col-sm-12" v-if="String(fillForm.ProjectType) === project_type_station">
        <el-form-item :label="$t('sites') + $t('address')" prop="Address">
          <el-input v-model="fillForm.Address" :disabled="true"></el-input>
        </el-form-item>
      </div>
      <!-- 所属地域：只有站场才会绑定地域 (编辑时不可修改) -->
      <div class="form-group col-sm-12" v-if="String(fillForm.ProjectType) === project_type_station">
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
import { PROJECT_TYPE_STATION, PROJECT_TYPE_DIC } from '@constants/dictionaries'

let _this

export default {
  name: 'project-edit-dialog',

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
      project_type_station: PROJECT_TYPE_STATION,
      project_type_dic: PROJECT_TYPE_DIC,
      isVisible: false,
      clientList: [],
      areaOptions: [], // 格式化后符合级联框(el-cascader)组件的数据格式
      areaProps: {
        // "地域"级联框(el-cascader)的 props 属性
        children: 'children',
        label: 'Name',
        value: 'Code'
      },
      fillForm: {
        ProjectName: '', // 项目名称
        ClientId: '', // 客户信息ID
        FullName: '', // 完整路径名称
        FullId: '', // 完整路径标示
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
        Area: [
          {
            required: true,
            type: 'array',
            message: this.$t('pleaseSelect') + this.$t('region'),
            trigger: 'blur'
          }
        ]
      }
    }
  },

  computed: {},
  components: {},
  async created() {
    _this = this
    // 客户列表
    this.$apis.client
      .getAll()
      .then(client => {
        this.clientList = client.list
      })
      .catch(errMsg => {
        this.$message.error(errMsg)
      })
  },

  watch: {
    async value(newVal) {
      _this = this // 重新对 _this 赋值，因为该弹窗组件被编辑、新增共用
      if (newVal) {
        this.isVisible = newVal
        const fillForm = JSON.parse(JSON.stringify(this.pdata)) // 使用两次JSON对数据进行深拷贝
        fillForm.Area = await this.getArea(fillForm) // [fillForm.AreaId] // 地域
        this.fillForm = fillForm
      }
    }
  },

  methods: {
    async getArea(projData) {
      const areaIDArray = []
      // 只有站场有绑定地域
      if (String(projData.ProjectType) === PROJECT_TYPE_STATION) {
        let regionObj = await this.$apis.areaRegion.findRegion(projData.RegionId) // 获取区域信息（该场站所属项目绑定的区域），包含该区域绑定的地域
        regionObj = regionObj.Data
        // 以当前区域绑定的地域为最顶级的地域
        this.areaOptions = regionObj.Area.map(item => {
          item.children = []
          return item
        })
        let areaPath = await this.$apis.areaRegion.getParentArea(projData.AreaId) // 地域路径
        areaPath = areaPath.Data.reverse() // 对路径进行倒叙修正
        // 截取从该场站所属项目绑定的区域绑定的地域到当前地域的路径
        areaPath.splice(
          0,
          areaPath.findIndex(ele => {
            return regionObj.AreaCode.split(',').indexOf(ele.Code) > -1
          })
        )
        // 由于地域下拉的下级数据是手动点击加载的，故模拟手动一级一级选中对应的地域
        for (const areaObj of areaPath) {
          areaIDArray.push(areaObj.Code)
          await this.areaChange(areaIDArray)
        }
      }
      return areaIDArray
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
      const valueArray = this.$utils.getCascaderObj(val, this.areaOptions, this.areaProps)
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
        const data = { ...this.fillForm }
        data.AreaId = data.Area[data.Area.length - 1] // 格式化地域编码
        // 修改
        this.$apis.project
          .updateProject(data)
          .then(result => {
            this.$message.success(result.message)
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
