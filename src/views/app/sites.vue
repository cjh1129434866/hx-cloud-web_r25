<!--
 * @Author: jiapeng.Zheng
 * @Date: 2018-12-18 17:42:41
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-31 16:52:12
 * @Description: 站场列表/报表
 -->
<template>
  <project-view v-if="isChangeToProject"></project-view>
  <div class="module-content" style="height:100%" v-else>
    <!-- 临时添加的关闭按钮 -->
    <i class="el-icon-close module-content-close" :title="$t('close')" @click="$vueRouterGenerator.goBackByHistoryPath($route.fullPath)"></i>
    <div class="panel panel-block" style="height:100%">
      <div class="panel-body" style="height:100%">
        <div class="app-project data-list-wrap" style="height:100%">
          <el-row class="data-report-list" style="text-align:center"
            >{{ $activeMenu.title[$currentLang] }}
            <template v-if="$route.query.projectId"> (<span class="click-btn active">站场</span>/<span class="click-btn" @click="isChangeToProject = true">项目</span>) </template>
          </el-row>
          <!-- 列表/报表 切换按钮 -->
          <el-row class="data-report-list">
            <el-col :xs="24" :sm="24" :md="6" :lg="6">
              <el-radio-group v-model="listOrReports">
                <el-radio-button label="report">报表</el-radio-button>
                <el-radio-button label="list">列表</el-radio-button>
              </el-radio-group>
            </el-col>
            <el-col :xs="24" :sm="24" :md="18" :lg="18" style="padding-right:40px">
              <el-form :inline="true" class="data-list-search" @submit.native.prevent>
                <el-form-item v-show="listOrReports === 'list'">
                  <el-input
                    class="search-input"
                    v-model="sitesParam.projectName"
                    :placeholder="$t('pleaseEnter') + $t('name')"
                    @keyup.enter.native="searchData(sitesParam)"
                  ></el-input>
                </el-form-item>
                <el-form-item>
                  <el-button v-show="listOrReports === 'list'" class="plain-button" :plain="true" type="info" @click="searchData(sitesParam)">{{ $t('search') }}</el-button>
                  <el-button v-show="listOrReports === 'list'" class="plain-button" :plain="true" type="success" @click="onAddClick">{{ $t('add') }}</el-button>
                </el-form-item>
              </el-form>
            </el-col>
          </el-row>
          <EasyScrollbar class="content-scrollbar">
            <!-- 站场列表 -->
            <div v-show="listOrReports === 'list'" class="data-list" ref="dataList" v-loading.fullscreen.lock="loading">
              <!-- 所有的站场 -->
              <template v-for="(item, index) in sitesData">
                <div
                  ref="dataItem"
                  class="data-item-wrap item-hover-animate"
                  :key="item.Id"
                  @contextmenu.prevent="
                    event => {
                      showContextmenu(event, item, index)
                    }
                  "
                  @click="
                    $vueRouterGenerator.goToPage(`${homeStationPath}/${item.Id}`, item.ProjectName, {
                      fullPath: `${homeProjectPath}/`,
                      fullPathName: item.FullName,
                      fullPathID: item.FullId
                    })
                  "
                >
                  <!-- @click="$vueRouterGenerator.goToPage(`${deviceListPath}?sitesId=${item.Id}`, item.ProjectName, $route.fullPath)" -->
                  <div class="data-item" :class="$utils.dayConvert(item.StartTime) === $utils.dayConvert(Date.now()) ? 'now' : ''">
                    <img v-if="item.ProjectImageData.length > 0" :src="imgUrlPrefix + item.ProjectImageData[item.ProjectImageData.length - 1].url" class="item-img" />
                    <no-img v-else class="item-img"></no-img>
                    <div class="item-content">
                      <span :title="item.ProjectName" class="content-title"> {{ item.ProjectName }}</span>
                      <div class="content-body">
                        <!-- 前后添加的两个空的 span 是为了使中间的 span 能在 justify-content: space-between; 对齐方式下居中显示-->
                        <span></span>
                        <span>
                          <icon class="icons" name="menu/device"></icon>
                          <span class="num">{{ item.DeviceNum }}</span>
                          <span>个{{ $t('device') }}</span>
                        </span>
                        <span></span>
                      </div>
                      <!-- <span class="content-body" v-if="sitesDeviceTypeStat[item.Id]">
                        <template v-for="(value, key) in sitesDeviceTypeStat[item.Id]">
                          {{ value }}台{{ $commonParam.deviceTypeNameDict[key] }}
                        </template>
                      </span>
                      <span class="item-content no-data" v-else>{{ $t('nodata') }}</span> -->
                    </div>
                  </div>
                </div>
              </template>
              <!-- 为了使 data-list 的最后一行的 data-item-wrap 对齐而添加的额外元素 -->
              <div class="data-item-wrap miss-item" v-for="i in flexItemMissCols" :key="i"></div>
              <!-- 加载更多 -->
              <div class="data-item-wrap more" v-if="sitesDataCount > sitesData.length && sitesData.length > 0">
                <span v-if="!isLoadMoreLoading" @click="getMore">{{ $t('more') }}</span>
                <span v-else>
                  <i class="el-icon-loading"></i>
                </span>
              </div>
              <!-- 暂无数据 -->
              <div class="device-noData" v-if="sitesData.length === 0">{{ $t('nodata') }}</div>
            </div>
            <!-- 站场报表 -->
            <div class="data-report" v-show="listOrReports === 'report'">
              <statistics-view :staType="['typeData']" :params="staParams"></statistics-view>
            </div>
          </EasyScrollbar>
        </div>
        <!-- 新增站场 -->
        <project-add-dialog :option="{ title: '新增' }" :pdata="currentRowData" v-model="isAddDialogVisible" @dispatch-data="onInsertRowData"></project-add-dialog>
        <!-- 编辑站场 -->
        <project-edit-dialog :option="{ title: '编辑' }" :pdata="currentEditData" v-model="isEditDialogVisible" @dispatch-data="onUpdateRowData"></project-edit-dialog>
        <!-- 修改图片 -->
        <img-cropper-dialog
          v-model="isChangeImgVisible"
          :option="{ title: $t('upload') + $t('image') }"
          :form-data="editImgData"
          :img-list="editImgList"
          image-category="project"
          @upload-success="uploadImgSuccess"
          @img-change="onImgChange"
          @img-del="onImgDel"
        ></img-cropper-dialog>
        <!-- 修改地址 -->
        <map-edit-dialog v-model="isMapEditVisible" :option="{ title: $t('edits') + $t('address') }" :mapInfo="currentEditData" @dispatch-data="onEditPosition"></map-edit-dialog>
        <!-- 右键菜单 -->
        <context-menu :contextMenuConfig="contextMenuConfig" :contextMenuData="contextMenuData" @item-click="onContextMenuClick" ref="contextMenu"></context-menu>
      </div>
    </div>
  </div>
</template>
<script>
import { IMAGE_URL } from '@constants'
import { DEVICE_STATE_DIC, PROJECT_TYPE_STATION } from '@constants/dictionaries'
import statisticsView from '@views/common/modules/statisticsView.vue'

import $_ from '@helper/lodash'

export default {
  name: 'app-sites',
  props: {},
  data() {
    return {
      flexItemMissCols: 0, // 为了使flex布局最后一行左对齐所需添加的空项目的数量
      listOrReports: 'list',
      loading: false,
      isChangeToProject: false, // 是否切换到项目
      isLoadMoreLoading: false, // 是否加载更多
      isAddDialogVisible: false,
      isEditDialogVisible: false,
      isChangeImgVisible: false,
      isMapEditVisible: false,
      contextMenuConfig: { top: '0px', left: '0px' },
      homeStationPath: '/common/home/station',
      homeProjectPath: '/common/home/project',
      currentRowData: {
        ProjectName: '', //  名称
        ProjectId: this.$route.query.projectId, // 站场所属项目的ID
        ParentId: { id: this.$route.query.projectId || '' }, // 父项目Id,用于选中级联的“所属项目”
        ProjectType: PROJECT_TYPE_STATION,
        ClientId: '',
        Regions: [], // 所属区域
        Area: [] // 所属地域
      },
      currentEditData: {},
      currentEditIndex: -1,
      // 设备搜索参数
      sitesParam: {},
      device_state_dic: DEVICE_STATE_DIC,
      sitesDataCount: 0, // 站场总数
      sitesData: [], // 站场数据
      sitesDeviceTypeStat: {}, // 站场中设备的统计
      imgUrlPrefix: IMAGE_URL,
      editImgData: { Picture: '', PictureName: '', sn: 0, imageName: '', projectId: '' },
      editImgList: [],
      staParams: null // 报表的查询条件
    }
  },

  computed: {
    // 右键菜单
    contextMenuData() {
      return [
        { itemName: this.$t('edit'), command: 'onSitesEditClick', icon: 'panel/dataDefine' },
        { itemName: this.$t('delete'), command: 'onSitesDeleteClick', icon: 'menu/trash' },
        { itemName: this.$t('edits') + this.$t('image'), command: 'onEditImgClick', icon: 'panel/image' },
        { itemName: this.$t('edits') + this.$t('address'), command: 'onEditPositionClick', icon: 'panel/map' }
      ]
    }
  },

  components: {
    statisticsView: statisticsView,
    // 组件之间的循环引用
    // https://cn.vuejs.org/v2/guide/components-edge-cases.html#%E7%BB%84%E4%BB%B6%E4%B9%8B%E9%97%B4%E7%9A%84%E5%BE%AA%E7%8E%AF%E5%BC%95%E7%94%A8
    projectView: resolve => require.ensure([], () => resolve(require('@views/app/project.vue')), 'projectView'), // () => import('@views/app/project.vue'),
    projectAddDialog: resolve => require.ensure([], () => resolve(require('@views/project/projectAdd')), 'projectAddDialog'),
    projectEditDialog: resolve => require.ensure([], () => resolve(require('@views/project/projectEdit')), 'projectEditDialog'),
    mapEditDialog: resolve => require.ensure([], () => resolve(require('@views/common/modules/mapEditDialog')), 'mapEditDialog')
  },

  created() {
    this.listOrReports = this.$route.query['showway'] || 'list'
    this.searchData()
  },

  mounted() {
    window.addEventListener('resize', this.windowResizeMethod, false)
  },

  destroyed() {
    window.removeEventListener('resize', this.windowResizeMethod, false)
    this.windowResizeMethod = null
  },

  watch: {
    $route() {
      this.searchData()
    },
    sitesData() {
      // 重置flex布局中项目的
      this.setFlexItemMissCols()
    },
    listOrReports(newVal) {
      if (newVal === 'report') {
        this.staParams = { projectId: this.sitesParam.projectId, deviceSn: '0' }
      }
    }
  },

  methods: {
    // 刷新页面
    async getData(pageNo, pageSize) {
      // 清空旧数据
      this.loading = !this.isLoadMoreLoading
      this.sitesParam.pageNo = pageNo || 1 // 页码
      // 获取url上的查询参数
      const { query } = this.$route
      this.sitesParam.projectId = query.projectId
      let sitesData = []
      const param = this.$_.merge({}, this.sitesParam, { pageNo, pageSize })
      try {
        let result = {}
        if (this.sitesParam.projectId !== undefined && this.sitesParam.projectId !== 'undefined') {
          // 某个项目下的站场
          param.ProjectType = PROJECT_TYPE_STATION
          result = await this.$apis.project.getPageProject(param)
        } else {
          // 所有站场
          result = await this.$apis.project.mySites(param, this.$store.state.userInfo.groupId)
        }
        this.sitesDataCount = result.DataCount
        sitesData = result.Projects
      } catch (errMsg) {
        console.error(errMsg)
        this.$message.error(String(errMsg))
      } finally {
        this.loading = false
      }
      for (const item of sitesData) {
        // 查找场站下的所有设备
        this.$apis.device
          .getDeviceDataInfo({ projectId: item.Id })
          .then(result => {
            const topDeviceType = {}
            // 遍历设备
            result.Data.forEach(deviceItem => {
              // 查找出该设备所属的顶级类型
              const typeArray = this.$utils.selectDataFromTree({
                data: this.$commonParam.deviceType,
                parentKey: 'ParentId',
                parentNoddeflag: null,
                serachKey: 'Id',
                serachData: parseInt(deviceItem.TypeId)
              })
              topDeviceType[typeArray[0]] = topDeviceType[typeArray[0]] ? topDeviceType[typeArray[0]] + 1 : 1
            })
            this.$set(this.sitesDeviceTypeStat, item.Id, result.Data.length ? topDeviceType : null)
          })
          .catch(err => {
            this.$message.error(err.message)
          })
      }
      this.loading = false
      this.isLoadMoreLoading = false
      return sitesData
    },
    /**
     * 搜索数据
     * @param {Object} 查询参数，为空用默认的参数搜索，即重置列表
     */
    async searchData(param) {
      const sitesParam = {
        pageNo: 1, // 页码
        pageSize: 20, // 每页的数量
        sortData: 'StartTime', // 排序字段
        sortType: 'desc', // 排序方式
        state: '0', // 状态
        projectName: '' // 站场名称
      }
      this.sitesParam = Object.assign({}, sitesParam, param)
      this.isLoadMoreLoading = false
      this.sitesData = await this.getData()
    },
    /**
     * 刷新被更改Or删除的元素所在页的数据
     * @param {Number} index    被更改Or删除的元素的索引
     * @param {Number} delLen   delLen 代表被删除元素的个数（若删除多个则必须是index代表的元素开始的连续delLen个元素）
     */
    async refreshPage(index = 0, delLen = 0) {
      const _length = this.sitesParam.pageSize
      const _pageNo = Math.ceil((index + 1) / _length) // 数组索引是从0开始的
      const _startIndex = (_pageNo - 1) * _length
      const sitesData = await this.getData(_pageNo)
      this.sitesData.splice(_startIndex, _length + delLen, ...sitesData)
    },
    getMore() {
      this.isLoadMoreLoading = true
      this.refreshPage(this.sitesData.length) // 加载下页数据
    },
    /**
     * 右键点击事件
     */
    showContextmenu(event, sitesData, index) {
      const { x, y } = event
      this.contextMenuConfig.top = `${y}px`
      this.contextMenuConfig.left = `${x}px`
      this.currentEditData = sitesData
      this.currentEditIndex = index
      this.$refs.contextMenu.menuShow()
      // this.$refs.contextMenu.menuShow(sitesData)
    },
    /**
     * 右键菜单item点击事件
     */
    onContextMenuClick(item) {
      const { command } = item
      this[command]()
    },
    /**
     * 站场编辑
     */
    onSitesEditClick() {
      this.isEditDialogVisible = true
    },
    // 编辑确认
    onUpdateRowData(data) {
      this.currentEditData = data
      this.$set(this.sitesData, this.currentEditIndex, data)
    },
    /**
     * 项目图片修改
     */
    onEditImgClick() {
      const data = this.currentEditData
      // 初始化上传图片所需的参数
      this.editImgData = { Picture: '', PictureName: '', sn: 0, projectId: data.Id }
      this.editImgList = []
      // 若图片存在，则保存上传图片所需的参数
      if (data.ProjectImageData.length > 0) {
        for (const image of data.ProjectImageData) {
          this.editImgList.push({
            url: `${IMAGE_URL}${image.url}`,
            Id: image.Id, // img-cropper-dialog 组件需要的参数
            Picture: `${IMAGE_URL}${image.url}`, // img-cropper-dialog 组件需要的参数
            PictureName: image.ImageName, // img-cropper-dialog 组件需要的参数
            imageName: image.ImageName, // 新增图片所需的参数
            sn: image.Sn, // 新增图片所需的参数
            projectId: data.Id // 新增图片所需的参数
          })
        }
        this.editImgData = this.editImgList[data.ProjectImageData.length - 1]
      }
      this.isChangeImgVisible = true
    },
    /**
     * 图片 change 事件
     * @param {Object} fileData 改变后的图片参数
     */
    onImgChange(fileData) {
      const editImgData = Object.assign({}, this.editImgData, fileData)
      // 覆盖图片名称
      editImgData.imageName = fileData.PictureName // 上传图片所需的参数，根据 img-cropper-dialog 组件返回的参数图片参数覆盖原图片的参数
      this.editImgData = editImgData
    },
    /**
     * 图片删除事件
     * @param {Number} fileId 文件ID
     */
    onImgDel(fileId) {
      this.$apis.project
        .projectImageRemove({ Id: fileId, ProjectId: this.editImgData.projectId })
        .then(result => {
          this.$message.success(result.message)
          this.refreshPage(this.currentEditIndex)
          // 删除文件列表中被删除的图片
          this.editImgList = this.$_.remove(this.editImgList, n => {
            return n.Id !== fileId
          })
          if (this.editImgList.length > 0) {
            this.editImgData = this.editImgList[this.editImgList.length - 1]
          } else {
            this.editImgData = { Picture: '', PictureName: '', sn: 0, projectId: this.currentEditData.Id }
          }
        })
        .catch(errMsg => {
          console.error(errMsg)
          this.$message.error(errMsg)
        })
    },
    // 图片修改成功回调
    uploadImgSuccess() {
      this.refreshPage(this.currentEditIndex)
    },
    /**
     * 站场删除
     */
    onSitesDeleteClick() {
      const { Id, ProjectName } = this.currentEditData
      this.$confirm(`是否删除【${ProjectName}】站场？`, '提示', {
        cancelButtonClass: 'el-button--cancel',
        closeOnClickModal: false
      })
        .then(() => {
          this.$apis.project
            .deleteProject(Id)
            .then(result => {
              this.$message.success(result.message)
              this.refreshPage(this.currentEditIndex, 1)
            })
            .catch(errMsg => {
              console.error(errMsg)
              this.$message.error(errMsg)
            })
        })
        .catch(() => {
          this.$message.warning(`取消删除【${ProjectName}】站场`)
        })
    },
    /**
     * 新增
     */
    onAddClick() {
      this.currentRowData.ProjectId = this.sitesParam.projectId // 父项目Id
      this.currentRowData.ParentId = { id: this.sitesParam.projectId || '' } // 父项目Id,用于选中级联的“所属项目”
      this.currentRowData.ProjectName = ''
      this.currentRowData.ClientId = '' // 客户ID
      this.currentRowData.Regions = [] // 所属区域
      this.currentRowData.Area = [] // 所属地域
      this.isAddDialogVisible = true
    },
    // 新增确认
    async onInsertRowData(data) {
      this.currentRowData = data
      const newestData = await this.getData(1, 1) // 获取新增后的第一个数据
      if (newestData && newestData.length === 1) {
        this.sitesData.unshift(newestData[0])
      } else {
        console.error('newestData is null or its length !== 1', newestData)
      }
    },
    // 修改站场地址
    onEditPositionClick() {
      this.isMapEditVisible = true
    },
    // 修改站场地址确认
    onEditPosition(data) {
      const { Position, PositionName } = data
      this.currentEditData.Position = Position // 同时 sitesData 中对应项目的 Position 也会更改
      this.currentEditData.Address = PositionName // 同时 sitesData 中对应项目的 Address 也会更改
      // 更新站场
      this.$apis.project
        .updateProject(this.currentEditData)
        .then(result => {
          this.$message.success(result.message)
          this.isMapEditVisible = false
        })
        .catch(errMsg => {
          console.error(errMsg)
          this.$message.error(errMsg)
        })
    },
    windowResizeMethod: $_.throttle(() => {
      this.setFlexItemMissCols()
    }, 500),
    setFlexItemMissCols() {
      this.$nextTick(() => {
        const $container = this.$refs.dataList
        const $items = this.$refs.dataItem
        this.flexItemMissCols = this.$document.calcFlexItemLastRowMissColNum($container, $items)
      })
    }
  }
}
</script>
<style type="text/css" lang="scss">
@import '~@assets/scss/projectItem.scss';
</style>
