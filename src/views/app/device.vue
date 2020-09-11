<!--
 * @Author: jiapeng.Zheng
 * @Date: 2018-12-29 14:05:04
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-04-02 13:45:58
 * @Description: 设备列表
 -->
<template>
  <div class="module-content" style="height:100%">
    <!-- 临时添加的关闭按钮 -->
    <i class="el-icon-close module-content-close" :title="$t('close')" @click="$vueRouterGenerator.goBackByHistoryPath($route.fullPath)"></i>
    <div class="panel panel-block" style="height:100%">
      <div class="panel-body" style="height:100%">
        <!-- 设备 -->
        <div class="app-device data-list-wrap" style="height:100%">
          <el-row class="data-list-title">
            <!-- 列表/报表 切换按钮 -->
            <el-col :xs="24" :sm="24" :md="6" :lg="6">
              <el-radio-group v-model="listOrReports">
                <el-radio-button label="report">报表</el-radio-button>
                <el-radio-button label="list">列表</el-radio-button>
              </el-radio-group>
            </el-col>
            <!-- search START -->
            <el-col :xs="24" :sm="24" :md="18" :lg="18" style="padding-right:40px">
              <div class="data-list-search">
                <!-- 设备类型筛选 -->
                <el-select v-show="listOrReports === 'list'" class="search-select" :placeholder="$t('pleaseSelect') + $t('deviceType')" clearable v-model="activeCategoryId">
                  <el-option v-for="(item, index) in $commonParam.deviceTypeFormat" :label="item.DeviceTypeName" :key="index" :value="item.Id"></el-option>
                </el-select>
                <!-- 设备名称筛选 -->
                <el-input
                  v-show="listOrReports === 'list'"
                  class="search-input"
                  v-model="deviceTypeSearch.DeviceName"
                  :placeholder="$t('pleaseEnter') + $t('name')"
                  @keyup.enter.native="searchData(deviceTypeSearch)"
                ></el-input>
                <el-button v-show="listOrReports === 'list'" class="plain-button" :plain="true" type="info" @click="searchData(deviceTypeSearch)">{{ $t('search') }}</el-button>
                <!-- <i class="el-icon-add" style="color:white" @click="addAll">批量新增</i> -->
                <!-- <i style="margin-right: 0.5em;" @click="getAllData"><icon name="sync"></icon></i> -->
                <el-button v-show="listOrReports === 'list'" class="plain-button" :plain="true" type="success" @click="onAddClick">{{ $t('add') }}</el-button>
              </div>
            </el-col>
            <!-- search END -->
          </el-row>
          <EasyScrollbar class="content-scrollbar">
            <!-- 设备列表 -->
            <div v-show="listOrReports === 'list'" class="data-list" ref="dataList" v-loading.fullscreen.lock="loading">
              <template v-for="(typeValue, typeIndex) in deviceTypeData">
                <template v-if="!activeCategoryId || String(activeCategoryId) === String(typeValue.key)">
                  <!-- 类型名称 -->
                  <div :class="`data-type app-device-type-${typeValue.key}`" :key="typeIndex">
                    <icon :name="$commonParam.deviceTypeDict[typeValue.key].ICON"></icon>
                    <span>{{ $commonParam.deviceTypeDict[typeValue.key].DeviceTypeName }} ({{ typeValue.data.length }}台)</span>
                  </div>
                  <!-- 暂无数据 -->
                  <div class="device-noData" :key="`${typeValue.key}_d`" v-if="typeValue.data.length <= 0">
                    <span>{{ $t('nodata') }}</span>
                  </div>
                  <!-- 该类型下的设备 -->
                  <template v-for="item in typeValue.data">
                    <div :ref="`dataItem-${typeValue.key}`" class="data-item-wrap item-hover-animate" :key="item.DeviceNo">
                      <div
                        class="data-item flex-item flex-row"
                        :class="
                          `${item.isOnline ? 'onLine' : 'offLine'}
                    ${$mqtt_error_data[item.DeviceNo] && $mqtt_error_data[item.DeviceNo].error ? 'device-warn' : ''}
                    ${$utils.dayConvert(item.UseTime) === $utils.dayConvert(Date.now()) ? 'now' : ''}`
                        "
                        @contextmenu.prevent="
                          event => {
                            showContextmenu(event, item, item.DeviceSn)
                          }
                        "
                        @click="goToHomeDevicePage(item)"
                      >
                        <!-- item title -->
                        <div class="flex-item flex-col">
                          <img v-if="item.ImageData && item.ImageData.length > 0" :src="imgUrlPrefix + item.ImageData[item.ImageData.length - 1].url" class="item-img" />
                          <no-img v-else class="item-img"></no-img>
                        </div>
                        <!-- item body -->
                        <div class="flex-item flex-col flex-item-body item-content">
                          <!-- 设备名称 -->
                          <div class="flex-item flex-row data-item-title">
                            <span class="item-category flex-item" :title="item.Category">
                              <span><icon :name="item.ICON"></icon></span>
                              <!-- <span>{{ item.Category }}</span> -->
                            </span>
                            <span class="item-name" :title="item.DeviceName">{{ item.DeviceName }}</span>
                          </div>
                          <!-- 设备地址 -->
                          <div class="data-item-adr flex-item flex-row">
                            <span class="adr-name" :title="item.Address">{{ item.Address }}</span>
                            <span class="adr-distance" :title="item.DistanceStr">
                              <icon class="title-map" name="panel/map"></icon>
                              <span>{{ item.DistanceStr }}</span>
                            </span>
                          </div>
                          <!-- 设备控制项 -->
                          <div class="data-item-ctrl flex-item flex-row">
                            <template v-if="item.DisplayData && item.DisplayData.length">
                              <span
                                :class="` flex-item control-name ${value.mqttData === $t('deviceOff') ? 'control-off' : 'control-on'}`"
                                :title="value.Name"
                                v-for="(value, index) in item.DisplayData"
                                :key="index"
                              >
                                <icon :name="value.ICON || default_acc_icon"></icon>
                                <span class="control-name-value">{{ value.Name }}</span>
                                <!-- <div
                            :class="`control-value ${value.mqttData === $t('deviceOff')?'control-off':'control-on'}`"
                          >{{value.mqttData}}</div>-->
                              </span>
                            </template>
                            <span v-else>{{ $t('NotCrlConf') }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </template>
                  <!-- 为了使 data-list 的最后一行的 data-item-wrap 对齐而添加的额外元素 -->
                  <div class="data-item-wrap miss-item" v-for="i in flexItemMissCols[typeValue.key]" :key="`miss-item-${typeIndex}-${i}`"></div>
                </template>
              </template>
            </div>
            <!-- 设备报表 -->
            <div class="data-report" v-show="listOrReports === 'report'">
              <statistics-view :staType="['typeData']" :params="staParams"></statistics-view>
            </div>
          </EasyScrollbar>
        </div>
        <!-- 弹窗 START -->
        <!-- 新增设备窗口 -->
        <edit-dialog
          :option="{ title: '新增', opt: 'add' }"
          :pdata="currentRowData"
          :nowProject="nowProject"
          :selectType="$commonParam.deviceType"
          :cascaderType="deviceTypeDictFormatFilter"
          :isMyDevice="!deviceTypeSearch.sitesId"
          v-model="isAddDialogVisible"
          @dispatch-data="onInsertRowData"
        ></edit-dialog>
        <!-- 编辑设备窗口 -->
        <edit-dialog
          :option="{ title: '编辑', opt: 'edit' }"
          :pdata="currentEditData"
          :nowProject="nowProject"
          :selectType="$commonParam.deviceType"
          :cascaderType="deviceTypeDictFormatFilter"
          :isMyDevice="!deviceTypeSearch.sitesId"
          v-model="isEditDialogVisible"
          @dispatch-data="onUpdateRowData"
        ></edit-dialog>
        <!-- 右键菜单 -->
        <context-menu :contextMenuConfig="contextMenuConfig" :contextMenuData="contextMenuData" @item-click="onContextMenuClick" ref="contextMenu"></context-menu>
        <!-- 弹窗 END -->
      </div>
    </div>
  </div>
</template>
<script>
// import { $vueRouterGenerator, $document } from '@helper'
import Moment from 'moment'
import { IMAGE_URL } from '@constants'
import { DEFAULT_POSITION, DECIVE_ONLINE_TIME } from '@constants/index'
import { REGION_TOP_CODE, DEVICE_STATE_DIC } from '@constants/dictionaries'
import { DEFAULT_ACC_ICON } from '@constants/deviceConfig'
import { _STATION } from '@constants/projectType'
import $_ from '@helper/lodash'
import statisticsView from '@views/common/modules/statisticsView.vue'

export default {
  name: 'app-device',
  props: {},
  data() {
    return {
      flexItemMissCols: {},
      listOrReports: 'list',
      loading: false,
      isAddDialogVisible: false,
      isEditDialogVisible: false,
      device_state_dic: DEVICE_STATE_DIC, // 设备状态字典
      default_acc_icon: DEFAULT_ACC_ICON,
      staData: {}, // 电量、水量统计数据
      // 统计数据的时间范围
      statisticTime: this.$utils.getDateRange({ rangeNumber: 100, rangeUnit: 'years' }),
      // 右键菜单
      contextMenuData: [
        { itemName: this.$t('edit'), command: 'onDeviceEditClick', icon: 'panel/dataDefine' },
        { itemName: this.$t('delete'), command: 'onDeviceDeleteClick', icon: 'menu/trash' }
      ],
      contextMenuConfig: { top: '0px', left: '0px' },
      currentRowData: {
        ProjectId: '', // 设备所属站场的ID
        TypeId: '', // 类型ID
        TempId: '' // 模板ID
      },
      currentEditData: {},
      currentEditIndex: -1, // 被编辑数据在原始数据(mapDataOrig)中的索引
      initRegionCode: REGION_TOP_CODE, // 顶级的区域ID
      sortWay: 'desc',
      // 设备搜索参数
      deviceTypeSearch: {
        sortOrder: 'category',
        deviceTypeId: '', // 设备类型ID
        regionId: REGION_TOP_CODE, // 区域类型ID
        state: '0', // 状态
        DeviceName: '' // 站场名称
      },
      deviceTypeProps: {
        // “设备类型”级联框props
        children: 'children',
        label: 'DeviceTypeName',
        value: 'Id'
      },
      imgUrlPrefix: IMAGE_URL,
      homePath: '/common/home',
      sitesListPath: '/common/app/station',
      devicePath: '/common/app/device/',
      deviceListPath: '/common/app/device',
      activeCategoryId: null,
      nowProject: {},
      deviceTypeData: [], // 当前条件下（所属站场sitesId，设备类型deviceTypeId）设备类型统计，
      mapDataOrig: [], // 原始的设备数据
      notData: '',
      displayDataNum: 6, // 每台设备最多只允许展示6个控制项
      staParams: null // 报表的查询条件
    }
  },

  computed: {
    deviceTypeDictFormatFilter() {
      if (this.activeCategoryId) {
        return this.$commonParam.deviceTypeFormat.filter(n => {
          return n.Id === this.activeCategoryId
        })
      } else {
        return this.$commonParam.deviceTypeFormat
      }
    }
  },

  watch: {
    // 'deviceTypeSearch.DeviceName'(v) {
    //   this.searchData(this.deviceTypeSearch)
    // },
    $route() {
      this.getAllData()
    },
    // 当原始数据发送变化时，通过 searchData 方法实时改变 deviceTypeData
    mapDataOrig() {
      this.searchData(this.deviceTypeSearch)
    },
    deviceTypeData() {
      this.setFlexItemMissCols()
    },
    listOrReports(newVal) {
      if (newVal === 'report') {
        this.staParams = { projectId: this.deviceTypeSearch.sitesId, deviceSn: '0' }
      }
    }
  },

  components: {
    statisticsView: statisticsView,
    EditDialog: resolve => require.ensure([], () => resolve(require('@views/device/edit')), 'EditDialog')
  },

  created() {
    this.listOrReports = this.$route.query['showway'] || 'list'
    // 获取当前的项目、站场信息
    if (this.$route.query.sitesId) {
      this.$apis.project
        .findProject(this.$route.query.sitesId)
        .then(res => {
          this.nowProject = res.Data
        })
        .catch(err => {
          this.$message.error(err)
        })
    } else {
      this.nowProject = {}
    }
    // 重新获取数据
    this.getAllData()
  },

  mounted() {
    window.addEventListener('resize', this.windowResizeMethod, false)
  },

  destroyed() {
    window.removeEventListener('resize', this.windowResizeMethod, false)
    this.windowResizeMethod = null
  },

  methods: {
    goToHomeDevicePage(item) {
      const { FullId, FullName, DeviceSn, DeviceName, ProjectId } = item
      const FullPath = this.$vueRouterGenerator.genFullPathByFullId(FullId, FullName, _STATION.key)
      this.$vueRouterGenerator.goToPage(`/common/home/station/${ProjectId}?_activeDevice=${DeviceSn}`, DeviceName, {
        fullPath: FullPath,
        fullPathName: FullName,
        fullPathID: FullId
      })
    },

    async getAllData(param) {
      // 清空旧数据
      this.loading = true
      let mapDataOrig = []
      const deviceTypeSearch = {
        sortOrder: 'category',
        deviceTypeId: '',
        regionId: REGION_TOP_CODE,
        state: '0', // 状态
        DeviceName: '' // 站场名称
      }
      // 获取查询参数
      this.deviceTypeSearch = Object.assign(deviceTypeSearch, param)
      const { query } = this.$route
      this.sortWay = query['sortWay'] || 'desc'
      this.deviceTypeSearch = {
        ...this.deviceTypeSearch,
        ...query
      }
      // 保存设备的场站ID, 用于新增设备
      this.currentRowData.ProjectId = this.deviceTypeSearch.sitesId
      // 加载设备数据
      try {
        let deviceList = { list: [] }
        if (this.currentRowData.ProjectId) {
          deviceList = await this.$apis.device.getAllDevice(this.currentRowData.ProjectId)
        } else {
          deviceList = await this.$apis.device.myDevice()
        }
        // 保存原始数据
        mapDataOrig = deviceList.list
      } catch (errMsg) {
        console.error(errMsg)
        mapDataOrig = []
        this.$message.error(String(errMsg))
        this.loading = false
      }
      // 根据 mapDataOrig 生成符合规定的设备数据 mapData,为每一个设备添加 Address 和 Position 属性等等...
      ;(async () => {
        const mapData = []
        this.deviceTypeData = []
        for (const item of mapDataOrig) {
          const formatItem = await this.deviceDataFormat(item)
          // 保存修饰过的数据
          mapData.push(formatItem)
        }
        this.mapDataOrig = mapData
        this.loading = false
      })()
    },
    async deviceDataFormat(item) {
      // ====================== 获取设备类型ID ======================
      const typeArray = this.$utils.selectDataFromTree({
        data: this.$commonParam.deviceType,
        parentKey: 'ParentId',
        parentNoddeflag: null,
        serachKey: 'Id',
        serachData: parseInt(item.TypeId)
      })
      item.ICON = this.$commonParam.deviceTypeDict[typeArray[0]].ICON
      item.Category = this.$commonParam.deviceTypeNameDict[typeArray[0]]
      item.categoryId = typeArray[0]
      item.Position = item.Position || DEFAULT_POSITION
      item.Address = item.Address || '' // DEFAULT_ADDRESS
      // item.OnlineTime = item.Online ? new Date(item.Online).getTime() : 0
      // ========= 根据设备的经纬度获取设备的地理位置信息 =========
      const distObj = await this.$apis.map.calcAmpDist(item.Position)
      item.Distance = distObj.distance
      item.DistanceStr = distObj.distanceStr
      // =============================== 根据当前时间判断设备是否在线 ===============================
      item.OnlineData = item.OnlineData ? JSON.parse(item.OnlineData).data : {}
      item.isOnline = false
      if (!this.$_.isNil(item.Online)) {
        const dateDiff = this.$utils.dateCompare(Moment(), Moment(item.Online, 'YYYY-MM-DD HH:mm:ss'))
        item.isOnline = dateDiff < DECIVE_ONLINE_TIME
      }
      // ==================================== 过滤掉 DisplayData 中 DataKey 为空的数据 ====================================
      item.DisplayData = item.DisplayData || []
      item.DisplayData = item.DisplayData.filter(ele => {
        if (ele.DataKey) {
          const SequenceOut = this.$utils.isJsonString(ele.SequenceOut) ? JSON.parse(ele.SequenceOut) : { x: 0, y: 0 }
          ele.x = SequenceOut.x
          ele.y = SequenceOut.y
          ele.DisplayKey = ele.DisplayKey || ele.DataKey

          ele.mqttData = this.$mqttData.showFormat(ele, item.OnlineData[ele.DisplayKey])
        }
        return ele.DataKey
      })
      // =========== 通过冒泡排序法重新对配件进行排序 ===========
      this.$utils.bubbleSort(item.DisplayData, (p1, p2) => {
        if (p1.y > p2.y) {
          return true
        } else if (p1.y === p2.y) {
          return p1.x > p2.x
        } else {
          return false
        }
      })
      // 每台设备只显示 displayDataNum 个控制项
      item.DisplayData = item.DisplayData.slice(0, this.displayDataNum)
      return item
    },
    searchData(param) {
      // 根据 deviceTypeSearch 筛选条件从原始数据 this.mapDataOrig 中筛选出符合的设备
      let mapData = this.filterData(this.mapDataOrig, param)
      // 重新排序
      mapData = $_.orderBy(mapData, ['categoryId', 'isOnline', 'Distance', 'UseTime'], ['asc', 'desc', 'asc', 'desc'])
      // 对排序后的数据按设备进行分组，同时统计设备类型
      this.deviceTypeData = this.groupCountStatData(mapData)
    },
    /**
     * 过滤数据
     * @param {Object} deviceDataList   设备
     * @param {Object} param            过滤参数
     */
    filterData(deviceDataList = [], param) {
      let filterDevice = []
      const { sortOrder, deviceTypeId, DeviceName } = param
      filterDevice = deviceDataList
      // 当查询条件sortOrder为time时，过滤掉在线（this.sortWay === 'desc'）或离线（this.sortWay === 'asc'）的数据
      if (sortOrder === 'time') {
        filterDevice = filterDevice.filter(item => {
          return (this.sortWay === 'desc' ? item.isOnline : !item.isOnline) && item.DeviceName.indexOf(DeviceName) > -1
        })
      } else if (deviceTypeId) {
        // 过滤掉其他类型的数据
        filterDevice = filterDevice.filter(item => {
          return String(item.categoryId) === String(deviceTypeId) && item.DeviceName.indexOf(DeviceName) > -1
        })
      } else {
        filterDevice = filterDevice.filter(item => {
          return item.DeviceName.indexOf(DeviceName) > -1
        })
      }

      return filterDevice
    },
    /**
     * 计算设备统计数据
     */
    groupCountStatData(mapData) {
      // 清空统计数据
      const deviceTypeData = {}
      const deviceTypeDataByOrder = []
      this.$commonParam.deviceTypeFormat.forEach(ele => {
        deviceTypeData[ele.Id] = []
      })
      mapData.forEach(item => {
        deviceTypeData[item.categoryId].push(item)
      })
      Object.keys(deviceTypeData)
        .sort((a, b) => {
          return this.$commonParam.deviceTypeDict[a].Order - this.$commonParam.deviceTypeDict[b].Order
        })
        .forEach((key, index) => {
          deviceTypeDataByOrder[index] = { key: key, data: deviceTypeData[key] }
        })
      return deviceTypeDataByOrder
    },
    /**
     * 右键点击事件
     */
    showContextmenu(event, deviceData, DeviceSn) {
      const { x, y } = event
      this.contextMenuConfig.top = `${y}px`
      this.contextMenuConfig.left = `${x}px`
      this.currentEditData = deviceData
      // 由于界面在显示的是过滤后的数据mapData，故只能通过DeviceSn查询出被编辑数据在 mapDataOrig 中的索引
      this.currentEditIndex = this.mapDataOrig.findIndex(ele => ele.DeviceSn === DeviceSn)
      this.$refs.contextMenu.menuShow()
      // this.$refs.contextMenu.menuShow(deviceData)
    },
    /**
     * 右键菜单item点击事件
     */
    onContextMenuClick(item) {
      const { command } = item
      this[command]()
    },
    /**
     * 右键菜单：设备编辑
     */
    onDeviceEditClick() {
      this.isEditDialogVisible = true
    },
    // 编辑确认
    onUpdateRowData(data) {
      // this.currentEditData = data
      this.$apis.device
        .updateDevcie(data)
        .then(result => {
          this.$message.success(result.message)
          this.currentEditData = data
          this.$set(this.mapDataOrig, this.currentEditIndex, data)
        })
        .catch(errMsg => {
          console.error(errMsg)
          this.$message.error(errMsg)
        })
    },
    /**
     * 右键菜单：设备删除
     */
    onDeviceDeleteClick() {
      const { DeviceSn, DeviceName } = this.currentEditData
      this.$confirm(`是否删除【${DeviceName}】设备？`, '提示', {
        cancelButtonClass: 'el-button--cancel',
        closeOnClickModal: false
      })
        .then(() => {
          this.$apis.device
            .removeDeviceProject(DeviceSn)
            .then(result => {
              this.$message.success(result.message)
              this.mapDataOrig.splice(this.currentEditIndex, 1)
            })
            .catch(errMsg => {
              console.error(errMsg)
              this.$message.error(errMsg)
            })
        })
        .catch(() => {
          this.$message.warning(`取消删除【${DeviceName}】设备`)
        })
    },
    /**
     * 新增
     */
    onAddClick(/** categoryId */) {
      // 清空新增面板的数据,不能清空设备所属的场站ID：this.currentRowData.ProjectId
      this.currentRowData.TypeId = this.activeCategoryId // 类型ID
      this.currentRowData.TempId = '' // 模板ID
      this.currentRowData.DeviceNo = '' // 设备编号
      this.currentRowData.DeviceName = '' // 设备名称
      this.currentRowData.DeviceDescription = '' // 设备描述
      this.isAddDialogVisible = true
    },
    // 新增确认
    async onInsertRowData(data) {
      try {
        const result = await this.$apis.device.deviceAdd(data)
        const newestData = await this.$apis.device.getDeviceInfo(result.Id)
        const formatNewestData = await this.deviceDataFormat(newestData)
        this.mapDataOrig.unshift(formatNewestData)
      } catch (errMsg) {
        console.error(errMsg)
        this.currentRowData = data
        this.isAddDialogVisible = true
        this.$message.error(errMsg)
      }
      // this.$apis.device
      //   .deviceAdd(data)
      //   .then(result => {
      //     this.$message.success(result.message)
      //     this.getAllData()
      //   })
      //   .catch(errMsg => {
      //     this.$message.error(errMsg)
      //     console.error(errMsg)
      //   })
    },

    windowResizeMethod: $_.throttle(() => {
      this.setFlexItemMissCols()
    }, 500),
    setFlexItemMissCols() {
      this.$nextTick(() => {
        const $container = this.$refs.dataList
        const flexItemMissCols = {}
        for (const index in this.deviceTypeData) {
          const $items = this.$refs[`dataItem-${this.deviceTypeData[index].key}`]
          flexItemMissCols[this.deviceTypeData[index].key] = this.$document.calcFlexItemLastRowMissColNum($container, $items, 418) // 418 = 158px（$img-size） + 260px（$item-conten-width）
        }
        this.flexItemMissCols = flexItemMissCols
      })
    }

    // addAll() {
    //   // addAll UIC00111852Z0001 ~ UIC00111852Z0034
    //   for (let i = 1; i <= 34; i++) {
    //     let id = String(i)
    //     id = new Array(4 - id.length + 1).join('0') + id
    //     let param = {
    //       account: '15817468540',
    //       token: '9baa3bad40914445b50bb2afb519d133',
    //       DeviceNo: `UIC00111935Z${id}`,
    //       DeviceName: `北排${id}`,
    //       DeviceDescription: `北排超级贝斯${id}`,
    //       TypeId: 73,
    //       TempId: 94,
    //       ProjectId: '515',
    //       FullId: '483/515',
    //       FullName: '北排项目/未分配设备',
    //       RegionId: '101007',
    //       AreaId: '130632100'
    //     }
    //     this.$apis.device
    //       .deviceAdd(param)
    //       .then(result => {
    //         console.log(`success:${id}`)
    //       })
    //       .catch(errMsg => {
    //         // console.error(`error:${id}`)
    //       })
    //   }
    // }
  }
}
</script>
<style type="text/css" lang="scss">
@import '~@assets/scss/variables.scss';
@import '~@assets/scss/mixins.scss';
$img-size: 150px;
$item-width: 447px;
$data-type-height: 50px;

$warn-color: $element-warning-color;

.app-device {
  display: flex;
  flex-direction: column;
  &.data-list-wrap {
    // -- 设备列表标题
    .data-list-title {
      // display: flex;
      // flex-direction: row;
      // align-items: center;
      // justify-content: space-between;
      margin: 5px;
      // ---- 搜索
      .data-list-search {
        text-align: right;
        // margin: 5px;
        .icon,
        .search-select,
        .search-input {
          cursor: pointer;
        }
        .icon {
          margin: 0;
        }
        .search-select {
          width: auto;
        }
        .search-input {
          width: 200px;
          margin-right: $spacing-size;
        }
        .el-icon-picture {
          display: none; // 暂时注释掉新增站场图片的功能
          vertical-align: middle;
        }
      }
    }
    // -- 设备列表
    .data-list {
      width: 100%;
      overflow: hidden;
      display: flex;
      flex-flow: row wrap;
      // height: 100%;
      // overflow-y: auto;
      // ---- 设备类型
      .data-type {
        flex-basis: 100%;
        height: $data-type-height;
        padding: 0 $spacing-medium-size;
        margin: $spacing-small-size * 5 $spacing-small-size $spacing-small-size * 3 $spacing-small-size;
        .icon {
          width: 16px;
          height: 19px;
          margin-right: 5px;
          vertical-align: middle;
        }
        span {
          vertical-align: middle;
        }
        // 不可见的垂直基准线
        &::before {
          content: '';
          display: inline-block;
          height: 100%;
          vertical-align: middle;
        }
      }
      // ---- 设备列表中 item 的 wrap
      .data-item-wrap {
        cursor: pointer;
        flex-grow: 1;
        margin: 5px;
        width: $item-width;
        &:hover {
          border-radius: 0;
        }
        &.miss-item {
          visibility: hidden;
        }
        // ------ 设备列表中的 item
        .data-item {
          // cursor: pointer;
          width: 100%;
          height: 100%;
          min-height: 151px;
          min-width: 340px;
          vertical-align: top;
          .item-img {
            width: $img-size;
            height: $img-size;
          }
          .icon:not(.no-img-icon) {
            margin-right: 0.25rem;
          }
          // 新增的设备
          &.now {
            &::before {
              content: '\65B0';
              position: absolute;
              background-color: $element-danger-color;
              color: $white;
              // font-size: $font-small;
              font-weight: bold;
              display: inline-block;
              padding: 5px;
              margin: 5px;
            }
          }
          // 设备报警
          &.device-warn {
            .item-category,
            .item-name {
              color: $warn-color;
            }
          }
          // item 右侧内容
          .item-content {
            padding: $spacing-medium-size $spacing-size;
            // 设备名称
            .data-item-title {
              margin-bottom: $spacing-medium-size;
              justify-content: space-between;
              justify-content: flex-start;
              .item-category {
                // font-weight: 700;
                // width: 33.33%;
                // padding-right: 1rem;
                @include text-overflow;
              }
              .item-name {
                @include text-overflow;
                // margin-left: 1rem;
              }
            }
            // 设备地址
            .data-item-adr {
              margin-bottom: $spacing-medium-size * 2;
              .adr-name {
                // width: 75%;
                @include text-overflow;
              }
              .adr-distance {
                // width: 25%;
                flex-grow: 1;
                text-align: right;
                @include text-overflow;
              }
              .icon {
                // font-size: $font-medium;
                margin-right: 0;
              }
            }
            // 设备控制项目
            .data-item-ctrl {
              height: 100%;
              font-size: $font-small;
              justify-content: flex-start;
              align-content: space-between;
              flex-wrap: wrap;
              .control-name {
                width: 33.33%;
                // padding: 2px;
                .icon {
                  font-size: $font-default;
                }
                .control-name-value {
                  @include text-overflow;
                }
              }
            }
          }
        }
      }
      // ---- 暂无设备数据
      .device-noData {
        justify-content: center;
        font-size: $font-medium;
        overflow: hidden;
        width: 100%;
        text-align: center;
      }
    }
    // -- 设备报表
    .data-report {
      height: 680px;
    }
  }
}
</style>
