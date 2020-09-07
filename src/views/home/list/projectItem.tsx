import { Component, Prop, Vue, Watch, Emit } from 'vue-property-decorator'
import { DATA_CATEGORY, _PROJECT } from '@constants/projectType'
import ItemDataFormat from '../utils/itemDataFormat'
import ProjectApi from '@helper/apis/project.js'

@Component({})
export default class ProjectItem extends Vue implements IHomeItemComponent<ProjectVO, ProjectPageDTO, ProjectVO | DeviceVO> {
  @Prop()
  listStyle: object
  @Prop()
  pageSize: number
  @Prop()
  pageNo: number
  @Prop()
  activeItemData: HomeListItemDataBO<ProjectVO>
  @Prop({ default: 0 })
  clientId: number
  @Prop({ default: '' })
  parentId: string
  @Prop({ default: false })
  isScroll: boolean
  @Prop({ default: 0 })
  hoverItemId: number

  isActivated = true
  isCreated = true
  isLoading = false
  dataList: Array<ProjectVO> = []
  dataCount = 0
  searchForm: ProjectPageDTO = {
    clientId: this.clientId,
    projectId: this.parentId,
    ProjectType: this.parentId ? 0 : _PROJECT.ID,
    projectName: '',
    pageNo: 0,
    pageSize: 0,
    sortData: 'StartTime',
    sortType: 'desc'
  }

  @Watch('dataList')
  @Emit('onDataListChange')
  onDataListChange() {
    return this.dataList
  }

  @Watch('parentId')
  async onParentIdChange(val: string) {
    this.searchForm.projectId = val
    // 根据 projectId 重新获取数据
    await this.searchData({ name: '' })
  }

  @Emit('onItemClick')
  onItemClick(itemData: ProjectVO) {
    return ItemDataFormat.ProjectItemDataFormat(itemData)
  }
  @Emit('onItemHover')
  onItemHover(itemData: ProjectVO) {
    return itemData ? itemData.Id : 0
  }

  beforeCreate() {
    this.$options.components.subProjectItem = require('./projectItem').default
  }

  async created() {
    this.searchForm.projectId = this.parentId
    // 初始加载数据
    await this.searchData({ name: '' })
    this.isCreated = false
  }

  activated() {
    this.isActivated = true
  }
  deactivated() {
    this.isActivated = false
  }

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
      pageDataList = await ProjectApi.getPageProject(this.searchForm)
    } catch (e) {
      this.$message.error(`获取项目列表失败：${String(e)}`)
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
      activeTitle: 'project',
      activeItemId: this.parentId,
      _activeDevice: ''
    }
    this.$emit('onPageParamChange', subCompAttrKeyObj, pageParam)
    this.$emit('onPageDataChange', subCompAttrKeyObj, pageDataList.Projects)
    return pageDataList.Projects
  }

  async searchData(searchForm: HomeListSearchBO) {
    const $subProjectItem = this.$refs.subProjectItem as ProjectItem
    if ($subProjectItem) {
      // 调用子组件的搜索方法
      $subProjectItem.searchData(searchForm)
    } else {
      // 本身组件的搜索方法
      this.searchForm.pageNo = this.pageNo
      this.searchForm.pageSize = this.pageSize
      this.searchForm.projectName = searchForm.name
      this.dataList = await this.getData()
    }
  }

  async loadMoreData() {
    const $subProjectItem = this.$refs.subProjectItem as ProjectItem
    if ($subProjectItem) {
      // 调用子组件的加载更多方法
      $subProjectItem.loadMoreData()
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
    const $subProjectItem = this.$refs.subProjectItem as ProjectItem
    if ($subProjectItem) {
      // 调用子组件的加载更多方法
      $subProjectItem.loadPageData(pageNo, pageSize)
    } else {
      this.$set(this.searchForm, 'pageNo', pageNo)
      this.$set(this.searchForm, 'pageSize', pageSize)
      this.dataList = await this.getData()
    }
  }

  async getItemDataInfo(id: string) {
    // console.log('project getItemDataInfo', this.activeItemData.dataType)
    if (this.activeItemData.dataType === _PROJECT.key) {
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
          RegionId: '',
          AreaId: '',
          Address: '',
          Position: '',
          lnglatXY: [],
          ProjectType: _PROJECT.ID,
          SitesNum: 0
        }
      }
      if (id) {
        try {
          dataInfo = await ProjectApi.findProject(id)
        } catch (e) {
          this.$message.error(`获取项目[${id}]失败：${String(e)}`)
        }
      }

      return ItemDataFormat.ProjectItemDataFormat(dataInfo.Data)
    } else {
      return null
    }
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
      this.$emit('onPageParamChange', key, pageParam)
    }
    const pageDataChange = (key: SubCompAttrKeyObjBO, pageData: HomeListDataBO) => {
      this.$emit('onPageDataChange', key, pageData)
    }
    // let parentId = this.activeItemData.id

    const renderProjectItem = () => (
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
    )
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
    const renderSubProjectItem = () => (
      <sub-project-item
        parentId={this.activeItemData.id}
        clientId={this.clientId}
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
        ref="subProjectItem"
      />
    )

    return !this.activeItemData.id ? renderProjectItem() : renderSubProjectItem()
  }
}
