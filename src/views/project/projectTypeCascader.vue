<!--
 * @Author: jiapeng.Zheng
 * @Date: 2018-12-17 17:08:51
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-31 16:33:43
 * @Description:
 -->
<template>
  <el-cascader
    :placeholder="`请选择${name}`"
    v-model="projectId"
    :show-all-levels="false"
    :options="projectList"
    :props="cascaderProps"
    :disabled="disabled"
    :change-on-select="type === project_type_project"
    @change="onChange"
    @active-item-change="onCascaderItemChange"
    ref="elCascader"
  ></el-cascader>
</template>
<script>
import { $utils } from '@helper'
import { PROJECT_TYPE_DIC, PROJECT_TYPE_STATION, PROJECT_TYPE_PROJECT } from '@constants/dictionaries'
let self

export default {
  name: 'project-type-cascader',
  props: {
    value: {
      type: Object,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    // 下拉类型：区分是项目还是站场
    type: {
      type: Number, // String | Number,
      default: PROJECT_TYPE_STATION
    },
    // 所属项目/站场，为了筛选出某个项目下的所属项目
    nowProject: {
      type: Object,
      default() {
        return {}
      }
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      projectId: [],
      projectList: [],
      project_type_project: PROJECT_TYPE_PROJECT,
      project_type_station: PROJECT_TYPE_STATION,
      cascaderProps: {
        children: 'children',
        label: 'ProjectName',
        value: 'Id'
      }
    }
  },
  watch: {
    value(newVal) {
      // 清空选中的值
      if (!newVal.id) {
        this.projectId = []
      }
      // this.projectId = [newVal.id] // 编辑时选中第一级项目
      // let { id } = newVal
      // this.projectId = [id] // 编辑时清空“所属项目”，不允许修改
    }
  },
  components: {},
  async created() {
    self = this
    // this.projectId = [this.value.id] // 初始化时选中第一级项目
    try {
      if (this.nowProject && this.nowProject.Id) {
        this.projectList = [this.nowProject]
      } else {
        const project = await this.$apis.project.myProjects()
        this.projectList = project.list
      }
      this.projectList.forEach((item, index) => {
        this.$set(this.projectList[index], this.cascaderProps.children, [
          {
            [this.cascaderProps.value]: this.$t('loading'),
            [this.cascaderProps.label]: this.$t('loading'),
            disabled: true
          }
        ])
        this.projectList[index].ProjectName = `【${PROJECT_TYPE_DIC[String(this.projectList[index].ProjectType)]}】${this.projectList[index].ProjectName}`
      })
    } catch (errMsg) {
      console.error(errMsg)
      // this.$message.error(errMsg)
    }
  },

  methods: {
    onChange(val) {
      const projectId = val[val.length - 1]
      this.$nextTick(function() {
        const currentLabels = this.$refs.elCascader.currentLabels
        this.$emit('input', {
          pid: val,
          id: val[val.length - 1],
          name: currentLabels[currentLabels.length - 1],
          pName: currentLabels.map(item => {
            return item.replace(`【${PROJECT_TYPE_DIC[PROJECT_TYPE_STATION]}】`, '').replace(`【${PROJECT_TYPE_DIC[PROJECT_TYPE_PROJECT]}】`, '')
          })
        })
      })
      // 获取子项目
      this.getSubProject(val, projectId)
    },
    // 当 el-cascader 父级选项变化时触发的事件，仅在 change-on-select 为 false 时（即 type !== project_type_project ）可用
    onCascaderItemChange(val) {
      const projectId = val[val.length - 1]
      // 当组件的 type = PROJECT_TYPE_PROJECT 时，要求可以选择“父项目”
      if (self.type === PROJECT_TYPE_PROJECT) {
        // this.projectId = val
        this.$nextTick(function() {
          const currentLabels = this.$refs.elCascader.currentLabels
          this.$emit('input', {
            pid: val,
            id: val[val.length - 1],
            name: currentLabels[currentLabels.length - 1],
            pName: currentLabels.map(item => {
              return item.replace(`【${PROJECT_TYPE_DIC[PROJECT_TYPE_STATION]}】`, '').replace(`【${PROJECT_TYPE_DIC[PROJECT_TYPE_PROJECT]}】`, '')
            })
          })
        })
      }
      // 获取子项目
      this.getSubProject(val, projectId)
    },
    /**
     * 动态添获取子项目
     * @param {Array} val   子项目的所有父级的id组成数组
     * @param {Array} val   父项目Id
     */
    getSubProject(val, projectId) {
      const activedProject = $utils.getCascaderObj(val, this.projectList, this.cascaderProps)
      // 只有项目（ ProjectType === PROJECT_TYPE_PROJECT ）才有子项目
      if (activedProject[activedProject.length - 1].ProjectType === PROJECT_TYPE_PROJECT) {
        // val 是数组，此处是引用传递，重新复制一份 val, 防止 getSubProject 多次调用时，异步请求 findUserSubProject 中 val 的值被该变
        val = JSON.parse(JSON.stringify(val)) //
        // 请求子项目
        this.$apis.project
          .findUserSubProject(projectId, { couldCancelRepeatRequest: true })
          .then(subProject => {
            const subProjectList = subProject.list
            subProjectList.forEach((item, index) => {
              const projectType = subProjectList[index].ProjectType // String()
              subProjectList[index].ProjectName = `【${PROJECT_TYPE_DIC[projectType]}】${subProjectList[index].ProjectName}`
              // 过滤掉站场
              if (projectType !== PROJECT_TYPE_STATION) {
                subProjectList[index].children = []
              }
            })
            this.addSubProject(val, subProjectList)
          })
          .catch(err => {
            this.$message.error(String(err))
          })
      }
    },
    /**
     * 动态添加子项目
     * @param {Array} valList         子项目的所有父级的id数组
     * @param {Array} subProjectList  子项目
     */
    addSubProject(valList, subProjectList) {
      let thisProjectList = this.projectList
      let opt = this.projectList
      // 筛选出父项目
      valList.map(function(value) {
        for (const itm of opt) {
          if (itm[self.cascaderProps.value] === value) {
            opt = itm[self.cascaderProps.children]
            thisProjectList = itm
            return itm
          }
        }
        return null
      })
      // 当组件的 type = PROJECT_TYPE_PROJECT 时，过滤掉“站场”
      subProjectList = subProjectList.filter(function(elem) {
        if (self.type === PROJECT_TYPE_PROJECT) {
          if (String(elem.ProjectType) === PROJECT_TYPE_PROJECT) {
            return elem
          }
        } else {
          return elem
        }
      })
      // 把子项目添加到父项目的 children 属性下
      thisProjectList[self.cascaderProps.children] = subProjectList.length
        ? subProjectList
        : [
            {
              [self.cascaderProps.value]: this.$t('nodata'),
              [self.cascaderProps.label]: this.$t('nodata'),
              disabled: true
            }
          ]
      // cascaderObj[cascaderObj.length - 1].children = subProjectList
      // this.$set(cascaderObj, cascaderObj.length - 1, cascaderObj[cascaderObj.length - 1])
    }
  }
}
</script>
<style lang="scss"></style>
