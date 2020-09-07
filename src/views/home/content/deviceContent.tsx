import { Component, Prop, Watch, Emit, Vue } from 'vue-property-decorator'
import ContentLayout from './contentLayout.vue'
import { _DEVICE } from '@constants/projectType'
import ItemDataFormat from '../utils/itemDataFormat'

@Component({ components: { ContentLayout } })
export default class DeviceContent extends Vue {
  @Prop({
    default() {
      return []
    }
  })
  pageData: Array<DeviceVO>
  @Prop({
    default() {
      return {}
    }
  })
  itemData: DeviceVO
  @Prop({ default: '' })
  hoverItemId: string

  projectData = []
  isDevice = false
  deviceInfo: DeviceVO = null

  @Watch('itemData.DeviceSn')
  onItemDataIdChange(val: string) {
    this.getData(val)
  }

  created() {
    const id = this.itemData ? this.itemData.DeviceSn : ''
    this.getData(id)
  }

  getData(id = '') {
    if (id) {
      this.deviceInfo = this.itemData
      this.isDevice = true
      this.$store.dispatch('devicePanel/getPanel', id)
    } else {
      // if (this.projectData.length === 0) {
      //   let projectData: AllDataListVO<DeviceVO> = await DeviceApi.myDevice()
      //   this.projectData = projectData.list
      // }
      // this.projectData = this.pageData
      this.deviceInfo = null
      this.isDevice = false
    }
  }

  @Emit('markClick')
  onMarkClick(item: DeviceVO): HomeListItemDataBO<DeviceVO> {
    console.log('device markClick', item)
    return ItemDataFormat.DeviceItemDataFormat(item)
  }

  @Emit('markHover')
  onMarkHover(id: string) {
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
        mapDataType={_DEVICE.key}
        isDevice={this.isDevice}
        itemData={this.itemData}
        deviceInfo={this.deviceInfo}
        on-markClick={this.onMarkClick}
        on-markHover={this.onMarkHover}
        on-controlFormatListChange={this.onControlFormatListChange}
      />
    )
  }
}
