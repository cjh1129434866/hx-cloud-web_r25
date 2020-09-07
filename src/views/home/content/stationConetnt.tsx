import { Component, Prop, Watch, Emit, Vue } from 'vue-property-decorator'
// import { _PROJECT } from '@constants/projectType'
import ItemDataFormat from '../utils/itemDataFormat'
// import ProjectApi from '@helper/apis/project.js'
// import DeviceApi from '@helper/apis/device.js'
import ContentLayout from './contentLayout.vue'
// import { mapGetters, mapState } from 'vuex'

@Component({ components: { ContentLayout } })
export default class StationContent extends Vue {
  @Prop({
    default() {
      return []
    }
  })
  pageData: Array<ProjectVO>
  @Prop({
    default() {
      return {}
    }
  })
  itemData: ProjectVO
  @Prop({ default: '' })
  hoverItemId: string
  @Prop()
  activeDevice: DeviceVO
  projectData = []
  projectDataType: HomeListType
  isDevice = false

  @Watch('itemData.Id')
  onItemDataIdChange(val: number) {
    this.getData(val)
  }

  @Watch('activeDevice')
  onActiveDeviceChange(val: DeviceVO) {
    this.isDevice = !!val
    this.$store.dispatch('devicePanel/getPanel', val.DeviceSn)
  }

  created() {
    const id = this.itemData ? this.itemData.Id : 0
    this.getData(id)
  }

  async getData(id = 0) {
    if (id) {
      // let projectData: AllDataListVO<DeviceVO> = await DeviceApi.getAllDevice(id)
      // this.projectData = projectData.list
      this.projectDataType = 'device'
      if (this.itemData._activeDeviceData) {
        // this.deviceInfo = this.itemData._activeDeviceData
        this.isDevice = true
      }
    } else {
      // let projectData: AllDataListVO<ProjectVO> = await ProjectApi.myAllSites()
      // this.projectData = projectData.list
      this.projectDataType = 'project'
    }
  }

  @Emit('markClick')
  onMarkClick(item: ProjectVO | DeviceVO): HomeListItemDataBO<ProjectVO> {
    let markData: HomeListItemDataBO<ProjectVO>
    if (item && (item as DeviceVO).DeviceSn) {
      const deviceItem = ItemDataFormat.DeviceItemDataFormat(item as DeviceVO)
      markData = ItemDataFormat.StationDeviceItemDataFormat(this.itemData, deviceItem)
    } else {
      markData = ItemDataFormat.StationItemDataFormat(item as ProjectVO)
    }
    console.log('station markClick', this.itemData, item, markData)
    return markData
  }

  @Emit('markHover')
  onMarkHover(id: number) {
    return id
  }

  @Emit('controlFormatListChange')
  onControlFormatListChange(data: Array<DeviceControlBO>) {
    return data
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  render(h) {
    return (
      <content-layout
        hoverItemId={this.hoverItemId}
        mapData={this.pageData}
        mapDataType={this.projectDataType}
        isDevice={this.isDevice}
        deviceInfo={this.activeDevice}
        itemData={this.itemData}
        on-markClick={this.onMarkClick}
        on-markHover={this.onMarkHover}
        on-controlFormatListChange={this.onControlFormatListChange}
      />
    )
  }
}
