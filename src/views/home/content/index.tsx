import { Component, Vue, Prop, Watch, Emit } from 'vue-property-decorator'
import ProjectContent from './projectConetnt'
import StationContent from './stationConetnt'
import DeviceContent from './deviceContent'
@Component({ components: { ProjectContent, StationContent, DeviceContent } })
export default class ActiveItemContent extends Vue {
  /**
   * 当前子组件的类型，根据 activeTitle 切换不同的子组件
   */
  @Prop() activeTitle: HomeListType
  @Prop({
    default() {
      return {
        id: '',
        name: '',
        urlParam: '',
        fromPath: {
          fullPath: [],
          fullPathName: '',
          fullPathID: ''
        },
        dataType: null,
        data: {}
      }
    }
  })
  /**
   * 首页激活的列表（项目、站场、设备）
   */
  activeItemData: HomeListItemDataBO<any>
  @Prop({
    default() {
      return []
    }
  })
  pageData: HomeListDataBO
  @Prop({ default: '' })
  hoverItemId: string

  /**
   * 激活的列表（项目、站场、设备）中激活的数据
   */
  activeData: HomeListTypeBO = null
  /**
   * 当首页激活的列表为站场时，且其中激活了某一站场，同时点击了该站场中的某一设备
   */
  activeDevice: DeviceVO = null

  @Watch('activeItemData')
  onDataChange(val: HomeListItemDataBO<any>) {
    this.activeData = val.data
    if (val.dataType === 'station') {
      this.activeDevice = (val.data as ProjectVO)._activeDeviceData
    }
  }

  @Emit('onMarkClick')
  onMarkClick(item: HomeListItemDataBO<any>) {
    return item
  }

  @Emit('onMarkHover')
  onMarkHover(id: string | number) {
    return id
  }

  @Emit('onControlFormatListChange')
  onControlFormatListChange(data: Array<DeviceControlBO>) {
    return data
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  render(h) {
    const getContent = () => {
      switch (this.activeTitle) {
        case 'client':
          return (
            <project-content
              itemData={this.activeData}
              activeDevice={this.activeDevice}
              pageData={this.pageData}
              hoverItemId={this.hoverItemId}
              on-markClick={this.onMarkClick}
              on-markHover={this.onMarkHover}
            />
          )
        case 'project':
          return (
            <project-content
              itemData={this.activeData}
              activeDevice={this.activeDevice}
              pageData={this.pageData}
              hoverItemId={this.hoverItemId}
              on-markClick={this.onMarkClick}
              on-markHover={this.onMarkHover}
            />
          )
        case 'station':
          return (
            <station-content
              itemData={this.activeData}
              activeDevice={this.activeDevice}
              pageData={this.pageData}
              hoverItemId={this.hoverItemId}
              on-markClick={this.onMarkClick}
              on-markHover={this.onMarkHover}
              on-controlFormatListChange={this.onControlFormatListChange}
            />
          )
        case 'device':
          return (
            <device-content
              itemData={this.activeData}
              pageData={this.pageData}
              hoverItemId={this.hoverItemId}
              on-markClick={this.onMarkClick}
              on-markHover={this.onMarkHover}
              on-controlFormatListChange={this.onControlFormatListChange}
            />
          )
        default:
          break
      }
    }
    return <keep-alive>{getContent()}</keep-alive>
  }
  /* ************************************ 组件本身的事件 ************************************ */
  /* ************************************ 组件本身的事件（会调用子组件 projectTypeComponent 的方法） ************************************ */
  /* ************************************* 子组件与当前组件通信的事件 ************************************* */
  /* ************************************* 当前组件与父组件通信的事件 ************************************* */
}
