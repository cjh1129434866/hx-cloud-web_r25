import { Component, Prop, Watch, Emit, Vue } from 'vue-property-decorator'
import ProjectApi from '@helper/apis/project.js'
import DeviceApi from '@helper/apis/device.js'
import ItemDataFormat from '../utils/itemDataFormat'
import { _STATION, _DEVICE } from '@constants/projectType'
import DeviceItem from './deviceItem'
@Component({ components: { DeviceItem } })
export default class StationItem extends Vue implements IHomeItemComponent<ProjectVO, ProjectPageDTO, DeviceVO> {
  @Prop()
  listStyle: object
  @Prop()
  pageSize: number
  @Prop()
  pageNo: number
  @Prop()
  activeItemData: HomeListItemDataBO<ProjectVO>
  @Prop()
  activeDevice: HomePageRouteQuery
  @Prop({ default: false })
  isScroll: boolean
  @Prop({ default: 0 })
  hoverItemId: number

  isCreated = true
  isLoading = false
  dataList: Array<ProjectVO> = []
  dataCount = 0
  /**
   * 被激活的设备
   */
  activeDeviceItem: HomeListItemDataBO<DeviceVO> = {
    name: '',
    id: '',
    dataType: _DEVICE.key,
    urlParam: '',
    moreLink: '',
    fromPath: {
      fullPath: [],
      fullPathName: '',
      fullPathID: ''
    },
    data: {
      DeviceName: '',
      DeviceSn: '',
      DeviceNo: '',
      TypeId: 0,
      FullId: '',
      FullName: '',
      Position: '',
      Online: '',
      _isOnline: false,
      _isWarn: false,
      lnglatXY: [],
      ConfigData: [],
      Address: '',
      AreaId: '',
      RegionId: ''
    }
  }

  searchForm: ProjectPageDTO = {
    clientId: 0,
    projectId: this.activeItemData.id,
    ProjectType: 0,
    projectName: '',
    pageNo: this.pageNo,
    pageSize: this.pageSize,
    sortData: 'StartTime',
    sortType: 'desc'
  }
  pageParam: PageVO = { DataCount: 0, PageCount: 0, PageNo: 0, PageSize: 0 }

  @Watch('dataList')
  @Emit('onDataListChange')
  onDataListChange() {
    return this.dataList
  }

  @Emit('onItemClick')
  onItemClick(itemData: ProjectVO) {
    return ItemDataFormat.StationItemDataFormat(itemData)
  }
  @Emit('onItemHover')
  onItemHover(itemData: ProjectVO) {
    return itemData ? itemData.Id : 0
  }

  @Watch('activeDevice._activeDevice')
  onActiveDeviceChange(val) {
    if (!val) {
      this.activeDeviceItem = {
        name: '',
        id: '',
        dataType: _DEVICE.key,
        urlParam: '',
        moreLink: '',
        fromPath: {
          fullPath: [],
          fullPathName: '',
          fullPathID: ''
        },
        data: {
          DeviceName: '',
          DeviceSn: '',
          DeviceNo: '',
          TypeId: 0,
          Online: '',
          _isOnline: false,
          _isWarn: false,
          FullId: '',
          FullName: '',
          Position: '',
          Address: '',
          AreaId: '',
          RegionId: '',
          lnglatXY: [],
          ConfigData: []
        }
      }
    }
  }

  async created() {
    // this.searchForm.projectId = this.activeItemData.id
    await this.searchData({ name: '' })
    this.isCreated = false
  }

  /* ************************************ 数据加载 ************************************ */
  async getData() {
    this.isLoading = true
    let pageDataList: ProjectPageDataListVO<ProjectVO> = {
      DataCount: 0,
      PageCount: 0,
      PageNo: 0,
      PageSize: 0,
      Projects: []
    }
    try {
      pageDataList = await ProjectApi.mySites(this.searchForm)
    } catch (e) {
      this.$message.error(`获取站场列表失败：${String(e)}`)
    }

    this.isLoading = false
    this.dataCount = pageDataList.DataCount
    this.pageParam = {
      DataCount: pageDataList.DataCount,
      PageCount: pageDataList.PageCount,
      PageNo: pageDataList.PageNo,
      PageSize: pageDataList.PageSize
    }
    const subCompAttrKeyObj: SubCompAttrKeyObjBO = {
      activeTitle: 'station',
      activeItemId: this.activeItemData.id,
      _activeDevice: ''
    }
    this.$emit('onPageParamChange', subCompAttrKeyObj, this.pageParam)
    this.$emit('onPageDataChange', subCompAttrKeyObj, pageDataList.Projects)
    return pageDataList.Projects
  }

  async searchData(searchForm: HomeListSearchBO) {
    const $deviceItem = this.$refs.deviceItem as DeviceItem
    if ($deviceItem) {
      // 调用子组件的搜索方法
      $deviceItem.searchData(searchForm)
    } else {
      // 本身组件的搜索方法
      this.searchForm.pageNo = this.pageNo
      this.searchForm.pageSize = this.pageSize
      this.searchForm.projectName = searchForm.name
      this.dataList = await this.getData()
    }
  }

  async loadMoreData() {
    const $deviceItem = this.$refs.deviceItem as DeviceItem
    if ($deviceItem) {
      // 调用子组件的加载更多方法
      $deviceItem.loadMoreData()
    } else {
      // 本身组件的加载更多方法
      if (this.dataList.length < this.dataCount) {
        const pageNo = this.searchForm.pageNo
        this.$set(this.searchForm, 'pageNo', pageNo + 1)
        this.dataList.push(...(await this.getData()))
      }
    }
  }

  async loadPageData(pageNo: number, pageSize: number) {
    const $deviceItem = this.$refs.deviceItem as DeviceItem
    if ($deviceItem) {
      // 调用子组件的分页加载方法
      $deviceItem.loadPageData(pageNo, pageSize)
    } else {
      this.$set(this.searchForm, 'pageNo', pageNo)
      this.$set(this.searchForm, 'pageSize', pageSize)
      this.dataList = await this.getData()
    }
  }

  async getItemDataInfo(id: string, subId: string) {
    console.log('station getItemDataInfo', this.activeItemData.dataType)
    if (this.activeItemData.dataType === _STATION.key) {
      let dataInfo: DataInfo<ProjectVO> = {
        Data: {
          ClientId: 0,
          DeviceNum: 0,
          _activeDeviceData: null,
          Id: 0,
          FullId: '',
          FullName: '',
          ProjectName: '',
          ProjectNum: 0,
          Address: '',
          Position: '',
          lnglatXY: [],
          RegionId: '',
          AreaId: '',
          ProjectType: _STATION.ID,
          SitesNum: 0
        }
      }
      if (id) {
        try {
          dataInfo = await ProjectApi.findProject(id)
          if (subId) {
            try {
              dataInfo.Data._activeDeviceData = await DeviceApi.getDeviceInfo(subId)
              // let $deviceItem = this.$refs.deviceItem as DeviceItem
              // this.activeDeviceItem = $deviceItem.itemDataFormat(dataInfo.Data._activeDeviceData)
              this.activeDeviceItem = ItemDataFormat.DeviceItemDataFormat(dataInfo.Data._activeDeviceData)
            } catch (e) {
              this.$message.error(`获取${dataInfo.Data.ProjectName}下的[${subId}]设备失败：${String(e)}`)
            }
          }
        } catch (e) {
          this.$message.error(`获取站场[${id}]信息失败：${String(e)}`)
        }
      }
      return ItemDataFormat.StationItemDataFormat(dataInfo.Data)
    } else {
      return null
    }
  }

  /* ************************************ 组件渲染 ************************************ */
  /* eslint-disable @typescript-eslint/no-unused-vars */
  render(h) {
    const deviceItemDataListChange = () => {
      // TO-DO
    }
    // let deviceItemFormat = (deviceItem: HomeListItemDataBO<DeviceVO>) => {
    //   // 当前站场
    //   let itemData = this.activeItemData.data

    //   return ItemDataFormat.StationDeviceItemDataFormat(itemData, deviceItem)
    // }
    const deviceItemClick = (deviceItem: HomeListItemDataBO<DeviceVO>) => {
      // 当前站场下激活的设备
      this.activeDeviceItem = deviceItem
      // 保存激活的设备
      // this.activeItemData.data._activeDeviceData = deviceItem.data

      const homeListItemData = ItemDataFormat.StationDeviceItemDataFormat(this.activeItemData.data, deviceItem) // deviceItemFormat(deviceItem)

      // 向父组件传递激活的 item
      this.$emit('onItemClick', homeListItemData)
    }
    const deviceItemHover = (id: string) => {
      this.$emit('onItemHover', id)
    }
    const pageParamChange = (key: SubCompAttrKeyObjBO, pageParam: PageVO) => {
      const _key = {
        activeTitle: 'station',
        activeItemId: key.activeItemId,
        _activeDevice: ''
      }
      this.$emit('onPageParamChange', _key, pageParam)
    }
    const pageDataChange = (key: SubCompAttrKeyObjBO, pageData: HomeListDataBO) => {
      const _key = {
        activeTitle: 'station',
        activeItemId: key.activeItemId,
        _activeDevice: ''
      }
      this.$emit('onPageDataChange', _key, pageData)
    }
    return !this.activeItemData.id ? (
      <skeleton-item isCreated={this.isCreated} itemClass={this.listStyle['body-item']}>
        {this.dataList.map((item, index) => (
          <div
            class={[this.listStyle['body-item'], 'body-item', { hover: this.hoverItemId === item.Id }]}
            onMouseover={this.onItemHover.bind(this, item)}
            onMouseout={this.onItemHover.bind(this, null)}
            onClick={this.onItemClick.bind(this, item)}
          >
            <span class={['map-mark-icon', this.listStyle['map-mark-icon']]}>
              <span>{index + 1}</span>
            </span>
            <span class={[this.listStyle['body-item-name'], 'body-item-name']} title={item.ProjectName}>
              {item.ProjectName}
            </span>
          </div>
        ))}
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
    ) : (
      <device-item
        parentId={this.activeItemData.id}
        pageSize={this.pageSize}
        pageNo={this.pageNo}
        activeItemData={this.activeDeviceItem}
        hoverItemId={this.hoverItemId}
        listStyle={this.listStyle}
        isScroll={this.isScroll}
        on-onDataListChange={deviceItemDataListChange}
        on-onItemClick={deviceItemClick}
        on-onItemHover={deviceItemHover}
        on-onPageParamChange={pageParamChange}
        on-onPageDataChange={pageDataChange}
        ref="deviceItem"
      />
    )
  }
}
