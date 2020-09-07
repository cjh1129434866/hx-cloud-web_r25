<template>
  <el-tree
    :data="projectList"
    empty-text="暂无子项目"
    highlight-current
    node-key="Id"
    lazy
    :load="loadNode"
    @current-change="currentChange"
    :expand-on-click-node="false"
    :props="treeProps"
  ></el-tree>
</template>
<script>
// import { $utils } from '@helper'
import { PROJECT_TYPE_DIC, PROJECT_TYPE_STATION } from '@constants/dictionaries'

export default {
  name: 'project-tree',
  props: {
    value: {
      type: Object,
      required: true
    },
    type: {
      type: String,
      default: PROJECT_TYPE_STATION
    }
  },
  data() {
    return {
      projectId: [],
      projectList: [{ Name: '项目', Id: 'myProject' }],
      treeProps: {
        children: 'children',
        label: 'Name',
        value: 'Id'
      }
    }
  },
  watch: {},

  components: {},
  async created() {
    // this.projectList = await this.loadSubProject(this.value)
  },

  methods: {
    currentChange(data, node) {
      const { Id, Name, ProjectType } = data
      // let parentNode = node.parent
      // 防止重复点击同一节点
      if (this.value !== String(Id) && node.level !== 0) {
        this.$emit('treeClick', Id, Name, String(ProjectType))
      }
    },
    async loadNode(node, resolve) {
      if (node.level === 0) {
        resolve([{ Name: '项目', Id: this.value }])
      } else {
        const projectId = node.data.Id || this.value
        try {
          // 请求子项目
          const subProjectList = await this.loadSubProject(projectId)
          resolve(subProjectList)
        } catch (errMsg) {
          resolve([])
          console.error(errMsg)
          this.$message.error(String(errMsg))
        }
      }
    },

    async loadSubProject(parentId) {
      try {
        // 请求子项目
        const subProject = await this.$apis.project.findUserSubProject(parentId)
        const subProjectList = subProject.list
        subProjectList.forEach((item, index) => {
          const projectType = String(subProjectList[index].ProjectType)
          subProjectList[index].ShowName = `【${PROJECT_TYPE_DIC[projectType]}】${subProjectList[index].Name}`
          // subProjectList[index].Name = `【${PROJECT_TYPE_DIC[projectType]}】${subProjectList[index].Name}`
        })
        return subProjectList
      } catch (errMsg) {
        console.error(errMsg)
        this.$message.error(String(errMsg))
      }
    }
  }
}
</script>
<style lang="scss"></style>
