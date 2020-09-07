import { Component, Prop, Vue, Watch, Emit } from 'vue-property-decorator'
import { DATA_CATEGORY } from '@constants/projectType'
import ClientApi from '@helper/apis/client.js'

import ItemDataFormat from '../utils/itemDataFormat'
import ProjectItem from './projectItem'

@Component({ components: { ProjectItem } })
export default class ClientItem extends Vue implements IHomeItemComponent<ClientVO, ClientDTO, ProjectVO> {
  @Prop()
  listStyle: object
  @Prop()
  activeItemData: HomeListItemDataBO<ClientVO>
  @Prop()
  pageSize: number
  @Prop()
  pageNo: number
  @Prop({ default: false })
  isScroll: boolean
  @Prop({ default: 0 })
  hoverItemId: number

  isCreated = true
  isLoading = false
  dataList: Array<ClientVO> = []
  showDataList: Array<ClientVO> = []
  dataCount = 0
  searchForm: ClientDTO = { ClientName: '' }

  @Watch('showDataList')
  @Emit('onDataListChange')
  onDataListChange() {
    return this.showDataList
  }

  @Emit('onItemClick')
  onItemClick(itemData: ClientVO) {
    return ItemDataFormat.ClientItemDataFormat(itemData)
  }
  @Emit('onItemHover')
  onItemHover(itemData: ClientVO) {
    return itemData ? itemData.Id : 0
  }
  async created() {
    // if (this.activeItemData.id) {
    //   // 初始化时根据客户ID获取客户信息
    //   let activeItem = await this.getItemDataInfo(this.activeItemData.id)
    //   // 把“客户信息”传递给父组件
    //   this.onItemClick(activeItem)
    // }
    this.showDataList = await this.getData()
    // this.searchData({ name: '' })
    this.isCreated = false
  }

  async getData() {
    this.isLoading = true
    let allDataList: AllDataListVO<ClientVO> = { list: [] }
    try {
      allDataList = await ClientApi.getAll()
    } catch (e) {
      this.$message.error(`获取客户列表失败：${String(e)}`)
    }

    this.isLoading = false
    this.dataList = allDataList.list
    this.dataCount = allDataList.list.length
    const pageParam: PageVO = {
      DataCount: this.dataCount,
      PageCount: Number(!!this.dataCount),
      PageNo: this.dataCount,
      PageSize: Number(!!this.dataCount)
    }
    const subCompAttrKeyObj: SubCompAttrKeyObjBO = {
      activeTitle: 'client',
      activeItemId: this.activeItemData.id,
      _activeDevice: ''
    }
    this.$emit('onPageParamChange', subCompAttrKeyObj, pageParam)
    this.$emit('onPageDataChange', subCompAttrKeyObj, this.dataList)
    return this.dataList
  }

  async searchData(searchForm: HomeListSearchBO) {
    const $projectItem = this.$refs.projectItem as ProjectItem
    if ($projectItem) {
      $projectItem.searchData(searchForm)
    } else {
      this.searchForm.ClientName = searchForm.name
      this.showDataList = this.dataList.filter(item => item.ClientName.indexOf(this.searchForm.ClientName) > -1)
    }
  }

  async loadMoreData() {
    // TO-DO
    const $projectItem = this.$refs.projectItem as ProjectItem
    if ($projectItem) {
      $projectItem.loadMoreData()
    }
  }

  async loadPageData(pageNo: number, pageSize: number) {
    const $projectItem = this.$refs.projectItem as ProjectItem
    if ($projectItem) {
      $projectItem.loadPageData(pageNo, pageSize)
    }
  }

  async getItemDataInfo(id: string) {
    console.log('clientItem getItemDataInfo', id)
    let dataInfo: ClientVO = {
      ClientName: '',
      Id: 0,
      projectNum: 0,
      FullId: undefined,
      FullName: undefined,
      Address: '',
      Position: '',
      lnglatXY: [],
      AreaId: '',
      RegionId: ''
    }
    if (id) {
      try {
        dataInfo = await ClientApi.get(id)
      } catch (e) {
        this.$message.error(`获取客户[${id}]信息失败：${String(e)}`)
      }
    }
    return ItemDataFormat.ClientItemDataFormat(dataInfo)
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  render(h) {
    const projectItemDataListChange = () => {
      // TO-DO
    }
    const projectItemClick = (item: HomeListItemDataBO<ProjectVO>) => {
      this.$emit('onItemClick', item)
    }
    const projectItemHover = (id: string) => {
      this.$emit('onItemHover', id)
    }
    const pageParamChange = (key: SubCompAttrKeyObjBO, pageParam: PageVO) => {
      const subCompAttrKeyObj: SubCompAttrKeyObjBO = {
        activeTitle: 'project',
        activeItemId: key.activeItemId,
        _activeDevice: ''
      }
      this.$emit('onPageParamChange', subCompAttrKeyObj, pageParam)
    }
    const pageDataChange = (key: SubCompAttrKeyObjBO, pageData: HomeListDataBO) => {
      const subCompAttrKeyObj: SubCompAttrKeyObjBO = {
        activeTitle: 'project',
        activeItemId: key.activeItemId,
        _activeDevice: ''
      }
      this.$emit('onPageDataChange', subCompAttrKeyObj, pageData)
    }
    const activeItemData: HomeListItemDataBO<ProjectVO> = {
      id: '',
      name: '',
      urlParam: '',
      moreLink: '',
      fromPath: {
        fullPath: [],
        fullPathName: '',
        fullPathID: ''
      },
      dataType: DATA_CATEGORY.project.key,
      data: null
    }
    return !this.activeItemData.id ? (
      <skeleton-item isCreated={this.isCreated} itemClass={this.listStyle['body-item']}>
        {this.showDataList.map((item, index) => (
          <div
            class={[this.listStyle['body-item'], 'body-item', { hover: this.hoverItemId === item.Id }]}
            onMouseover={this.onItemHover.bind(this, item)}
            onMouseout={this.onItemHover.bind(this, null)}
            onClick={this.onItemClick.bind(this, item)}
          >
            <span class={['map-mark-icon', this.listStyle['map-mark-icon']]}>
              <span>{index + 1}</span>
            </span>
            <span class={[this.listStyle['body-item-name'], 'body-item-name']} title={item.ClientName}>
              {item.ClientName}
            </span>
          </div>
        ))}
        <div v-show={this.showDataList.length === 0} class={[this.listStyle['body-nodata-text']]}>
          {this.$t('nodata')}
        </div>
      </skeleton-item>
    ) : (
      <project-item
        clientId={this.activeItemData.id}
        pageSize={this.pageSize}
        pageNo={this.pageNo}
        activeItemData={activeItemData}
        hoverItemId={this.hoverItemId}
        listStyle={this.listStyle}
        isScroll={this.isScroll}
        on-onDataListChange={projectItemDataListChange}
        on-onItemClick={projectItemClick}
        on-onItemHover={projectItemHover}
        on-onPageParamChange={pageParamChange}
        on-onPageDataChange={pageDataChange}
        ref="projectItem"
      />
    )
  }
}
