import { Component, Prop, Vue, Emit } from 'vue-property-decorator'
import { _PROJECT } from '@constants/projectType'
import ItemDataFormat from '../utils/itemDataFormat'
// import ProjectApi from '@helper/apis/project.js'
import ContentLayout from './contentLayout.vue'

@Component({ components: { ContentLayout } })
export default class ProjectContent extends Vue {
  @Prop({
    default() {
      return []
    }
  })
  pageData: Array<ProjectVO>
  @Prop()
  itemData: ProjectVO
  @Prop({ default: '' })
  hoverItemId: string
  @Prop()
  activeDevice: DeviceVO

  projectData = []

  // @Watch('itemData.Id')
  // onItemDataIdChange(val: number) {
  //   this.getData(val)
  // }
  // async getData(id: number = 0) {
  //   if (id) {
  //     let projectData: AllDataListVO<ProjectVO> = await ProjectApi.findUserSubProject(id)
  //     this.projectData = projectData.list
  //   } else {
  //     let projectData: AllDataListVO<ProjectVO> = await ProjectApi.myProjects()
  //     this.projectData = projectData.list
  //   }
  // }

  @Emit('markClick')
  onMarkClick(item: ProjectVO): HomeListItemDataBO<ProjectVO> {
    console.log('project markClick', item)
    return ItemDataFormat.ProjectItemDataFormat(item) // item
  }

  @Emit('markHover')
  onMarkHover(id: number) {
    return id
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  render(h) {
    return (
      <content-layout
        hoverItemId={this.hoverItemId}
        mapData={this.pageData}
        mapDataType={_PROJECT.key}
        isDevice={false}
        deviceInfo={this.activeDevice}
        itemData={this.itemData}
        on-markClick={this.onMarkClick}
        on-markHover={this.onMarkHover}
      />
    )
  }
}
