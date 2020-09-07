import { Component, Prop, Vue, Watch, Emit } from 'vue-property-decorator'

import { _DEVICE } from '@constants/projectType'
import { DECIVE_ONLINE_TIME } from '@constants/index'
import $_ from '@helper/lodash.js'
import $utils from '@helper/utils.js'
import DeviceApi from '@helper/apis/device.js'
import ItemDataFormat from '../utils/itemDataFormat'
@Component
export default class DeviceItem extends Vue implements IHomeItemComponent<DeviceVO, DevicePageDTO, DeviceVO> {
  @Prop()
  listStyle: object
  @Prop()
  pageSize: number
  @Prop()
  pageNo: number
  @Prop()
  activeItemData: HomeListItemDataBO<DeviceVO>
  @Prop({ default: '' })
  parentId: string
  @Prop({ default: false })
  isScroll: boolean
  @Prop({ default: '' })
  hoverItemId: string

  isCreated = true
  isLoading = false
  dataList: Array<DeviceVO> = []
  dataCount = 0
  searchForm: DevicePageDTO = {
    projectId: this.parentId,
    DeviceName: '',
    pageNo: 0,
    pageSize: 0,
    sortData: 'Online',
    sortType: 'desc'
  }
  /**
   * 获取设备数据时的时间
   */
  dataResponseTime: Date = new Date()

  @Watch('dataList')
  @Emit('onDataListChange')
  onDataListChange() {
    return this.dataList
  }

  // @Watch('parentId')
  // async onParentIdChange(val: string) {
  //   console.log('device parentId loadPageData')
  //   this.searchForm.projectId = val
  //   await this.searchData({ name: '' })
  // }

  @Emit('onItemClick')
  onItemClick(itemData: DeviceVO) {
    return ItemDataFormat.DeviceItemDataFormat(itemData)
  }

  @Emit('onItemHover')
  onItemHover(itemData: DeviceVO) {
    return itemData ? itemData.DeviceSn : ''
  }

  async created() {
    // 获取数据
    await this.searchData({ name: '' })
    this.isCreated = false
  }

  async activated() {
    this.searchForm.projectId = this.parentId
    this.dataList = await this.getData()
  }

  async getData() {
    this.isLoading = true
    let pageDataList: DevicePageDataListVO<DeviceVO> = { DataCount: 0, PageCount: 0, PageNo: 0, PageSize: 0, Data: [] }

    try {
      this.dataResponseTime = new Date()
      pageDataList = await DeviceApi.getPageDeviceDataInfo(this.searchForm)
    } catch (e) {
      this.$message.error(`获取设备列表失败：${String(e)}`)
    }

    this.isLoading = false
    this.dataCount = pageDataList.DataCount
    const pageParam: PageVO = {
      DataCount: pageDataList.DataCount,
      PageCount: pageDataList.PageCount,
      PageNo: pageDataList.PageNo,
      PageSize: pageDataList.PageSize
    }
    const subCompAttrKeyObj: SubCompAttrKeyObjBO = {
      activeTitle: 'device',
      activeItemId: this.parentId,
      _activeDevice: ''
    }
    this.$emit('onPageParamChange', subCompAttrKeyObj, pageParam)
    this.$emit('onPageDataChange', subCompAttrKeyObj, pageDataList.Data)

    // 额外添加当前选中的设备（即把选中的设备置顶）
    if (this.activeItemData.id && pageDataList.Data.findIndex(ele => ele.DeviceSn === this.activeItemData.data.DeviceSn) <= -1) {
      pageDataList.Data.unshift(this.activeItemData.data)
    }

    return pageDataList.Data
  }

  async searchData(searchForm: HomeListSearchBO) {
    this.searchForm.pageNo = this.pageNo
    this.searchForm.pageSize = this.pageSize
    this.searchForm.DeviceName = searchForm.name
    this.dataList = await this.getData()
  }

  async loadMoreData() {
    if (this.dataList.length < this.dataCount) {
      const pageNo = this.searchForm.pageNo
      this.$set(this.searchForm, 'pageNo', pageNo + 1)
      this.dataList.push(...(await this.getData()))
    }
  }

  async loadPageData(pageNo: number, pageSize: number) {
    this.$set(this.searchForm, 'pageNo', pageNo)
    this.$set(this.searchForm, 'pageSize', pageSize)
    this.dataList = await this.getData()
  }

  async getItemDataInfo(id: string) {
    console.log('deviceItem getItemDataInfo', this.activeItemData.dataType, id)
    if (this.activeItemData.dataType === _DEVICE.key) {
      let dataInfo: DeviceVO = {
        DeviceName: '',
        DeviceSn: '',
        DeviceNo: '',
        FullId: '',
        FullName: '',
        Position: '',
        Address: '',
        AreaId: '',
        RegionId: '',
        Online: '',
        _isOnline: false,
        _isWarn: false,
        TypeId: 0,
        ConfigData: [],
        lnglatXY: []
      }
      if (id) {
        try {
          dataInfo = await DeviceApi.getDeviceInfo(id)
        } catch (errMsg) {
          this.$message.error(`获取设备[${id}]信息失败：${String(errMsg)}`)
        }
      }
      return ItemDataFormat.DeviceItemDataFormat(dataInfo)
    } else {
      return null
    }
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  render(h) {
    return (
      <skeleton-item isCreated={this.isCreated} itemClass={this.listStyle['body-item']}>
        {this.dataList.map((item, index) => {
          // =============================== 根据当前时间判断设备是否在线 ===============================
          let isOnline = false // 是否在线
          if (!$_.isNil(item.Online)) {
            const dateDiff = $utils.dateCompare(this.dataResponseTime, new Date(item.Online), 'ms')
            isOnline = dateDiff < DECIVE_ONLINE_TIME
          }
          const isWarn = !!(this.$mqtt_error_data[item.DeviceNo] && this.$mqtt_error_data[item.DeviceNo].error)
          this.$set(item, '_isOnline', isOnline)
          this.$set(item, '_isWarn', isWarn)
          return (
            <div
              class={[
                this.listStyle['body-item'],
                'body-item',
                { isOnline: isOnline },
                { isWarn: isWarn },
                { active: this.activeItemData.id === item.DeviceSn },
                { hover: this.hoverItemId === item.DeviceSn }
              ]}
              onMouseover={this.onItemHover.bind(this, item)}
              onMouseout={this.onItemHover.bind(this, null)}
              onClick={this.onItemClick.bind(this, item)}
            >
              <span class={['map-mark-icon', this.listStyle['map-mark-icon']]}>
                <span>{index + 1}</span>
              </span>
              {isOnline ? (
                <el-tag effect="plain" size="small" class={this.listStyle['tag']}>
                  {this.$t('onLine')}
                </el-tag>
              ) : (
                <el-tag effect="plain" size="small" class={this.listStyle['tag']}>
                  {this.$t('offLine')}
                </el-tag>
              )}
              <span class={[this.listStyle['body-item-name'], 'body-item-name']} title={item.DeviceName}>
                {item.DeviceName}
              </span>
            </div>
          )
        })}
        <div v-show={this.dataList.length === 0} class={[this.listStyle['body-nodata-text']]}>
          {this.$t('nodata')}
        </div>
        <dot-load-more
          isLoading={this.isLoading}
          v-show={this.dataList.length < this.dataCount && this.isScroll}
          class={[this.listStyle['body-more-btn'], 'text-link']}
          onClick={this.loadMoreData}
        />
      </skeleton-item>
    )
  }
}
