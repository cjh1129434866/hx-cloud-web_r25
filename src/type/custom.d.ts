/**
 * 滚动条组件向父组件提供的方法
 */
interface IEasyScrollbar extends Element {
  /**
   * 滚动条组件的刷新方法
   */
  update(): void
  moveY: number
}
/**
 * home/:activeTitle?/:activeItemId? 路由下的 this.$route.query
 */
type HomePageRouteQuery = {
  _activeDevice?: string
}
/**
 * home/:activeTitle?/:activeItemId? 路由下的 this.$route.params
 */
type HomePageRouteParam = {
  activeTitle?: HomeListType
  activeItemId?: string
}

type SubCompAttrKeyObjBO = HomePageRouteQuery & HomePageRouteParam
/**
 * 统计数据分类deviceType(设备类型统计)、warnType(报警类型统计)、 deviceControl(设备控制统计)
 */
type StatType = 'deviceType' | 'warnType' | 'deviceControl'
/**
 * 列表的展示方式（图表report、列表list）
 */
type ListShowWay = 'report' | 'list'
/**
 * homeList下的各种组件的类型（客户、项目、站场、设备）
 */
type HomeListType = 'client' | 'project' | 'station' | 'device'
type HomeListTypeBO = ClientVO | ProjectVO | DeviceVO
type HomeListDataBO = Array<HomeListTypeBO>
type HomeDataBO = { [propName: string]: HomeListDataBO }
/**
 * homeList下的各种子组件传递过来的被选中的数据
 */
type HomeListItemDataBO<T> = {
  /**
   * item 对应首页路由 path: 'home/:activeTitle?/:activeItemId?' 中的 activeItemId
   */
  id: string
  /**
   * 用 name 覆盖首页路由的名称
   */
  name: string
  /**
   * item 对应首页路由 path: 'home/:activeTitle?/:activeItemId?' 中的 activeTitle
   */
  dataType: HomeListType
  /**
   * 首页路由跳转时携带的额外参数
   */
  urlParam: string
  /**
   * 查看更多链接
   */
  moreLink: string
  /**
   * $vueRouterGenerator.goToPage(toPath, toTitleKey, fromPath = null) 的第三个参数，
   * 用于重设路由记录 $historyPath
   */
  fromPath: {
    /**
     * 根据 fullPathName 和 fullPathID，通过  $vueRouterGenerator.genFullPathByFullId(fullId , fullName , type) 生成的链接
     */
    fullPath: Array<string>
    fullPathName: string
    fullPathID: string
  }
  data: T
}
/**
 * 首页列表搜索参数对象
 */
type HomeListSearchBO = {
  /**
   * 名称
   */
  name: string
}

/**
 * 继承 IHomeItemComponent 接口的组件向父组件提供的方法
 */
type HomeItem<T> = {
  /**
   * 根据查询参数 searchForm 调用api接口异步获取指定的数据
   * @param searchForm
   */
  searchData(searchForm: HomeListSearchBO): Promise<void>
  /**
   * 调用api接口异步加载更多的数据
   */
  loadMoreData(): Promise<void>
  /**
   * 调用api接口异步加载对应页码的数据（分页加载）
   * @param pageNo 页码
   */
  loadPageData(pageNo: number, pageSize: number): Promise<void>
  /**
   * 根据 ID 获取选中的 item 的信息
   */
  getItemDataInfo(id: string, subId?: string): Promise<HomeListItemDataBO<T>>
}
type HomeItemRefs = Element | Element[] | HomeItem<HomeListTypeBO>
/**
 * 首页 HomeList 组件下的各个 item 的基础接口
 * VO: 用于展示的 item 的数据结构
 * DTO: 调用 api 异步获取 item 时传递的参数
 * CO: 选中的 item 的子级数据
 */
interface IHomeItemComponent<VO, DTO, CO> extends HomeItem<VO> {
  /**
   * 父组件开启css module 后传递过来的样式对象
   */
  readonly listStyle?: object
  /**
   * （父组传递过来的）页码
   */
  readonly pageNo?: number
  /**
   * （父组传递过来的）每页长度
   */
  readonly pageSize?: number
  /**
   * （父组传递过来的）被激活的 Item
   */
  readonly activeItemData: HomeListItemDataBO<VO>
  /**
   * （父组传递过来的）某站场（activeItemData）下被激活的设备
   */
  readonly activeDevice?: HomePageRouteQuery
  /**
   * （父组传递过来的）item 数据所属的父级ID，为空则获取所有数据，不为空则获取该ID下的数据
   */
  readonly parentId?: string
  /**
   * 是否滚动加载更多数据
   */
  readonly isScroll: boolean
  /**
   * 数据列表
   */
  dataList: Array<VO>
  /**
   * 数据总数
   */
  dataCount: number
  /**
   * 查询参数
   */
  searchForm: DTO
  /**
   * 是否加载中
   */
  isLoading: boolean
  /**
   * 是否初始化,默认为 true, created 阶段加载数据成功后必须手动置为 false
   */
  isCreated: boolean
  /**
   * 生命周期 create 阶段，必须调用 searchData 方法获取数据
   * searchData 成功后必须手动把 isCreated 置为 false
   */
  created(): Promise<void>

  /**
   * 调用api接口异步获取组件数据;
   * 注：要调用 this.$emit('onPageParamChange', pageParam) 把分页参数传递给父组件
   */
  getData(): Promise<VO[]>

  /**
   * 根据 ID 获取选中的 item 的信息，必须调用 ItemDataFormat（@view/home/utils/ItemDataFormat） 中的方法格式化数据
   */
  getItemDataInfo(id: string, subId?: string): Promise<HomeListItemDataBO<VO>>

  /**
   * 数据改变事件: 必须加上@Emit('onDataListChange'),把 DataList 传递给父组件
   */
  onDataListChange(): Array<VO>
  /**
   * 单个数据点击事件: 必须加上@Emit('onItemClick'),把 ItemData 传递给父组件
   */
  onItemClick(itemData: VO): HomeListItemDataBO<VO>

  /**
   * 单个数据点击事件: 必须加上@Emit('onItemHover'),把 ItemId 传递给父组件
   */
  onItemHover(itemData: VO): string | number
}

type CategoryBO = {
  I: number
  ID: number
  key: HomeListType
  icon: string
  NAME: string
}
/**
 * 首页数据类型
 */
type DataCategoryBO = {
  // /**
  //  * 客户
  //  */
  // client: CategoryBO
  /**
   * 项目
   */
  project: CategoryBO
  /**
   * 站场
   */
  station: CategoryBO
  /**
   * 设备
   */
  device: CategoryBO
}
/**
 * 统计信息数据
 */
type HomeStatData = {}
/**
 * 统计信息详情
 */
type HomeStatDet = {
  projectId: string
  viewStaData: HomeStatData
}

type DeviceStateBO = 'onLine' | 'offLine' | 'unknown'
