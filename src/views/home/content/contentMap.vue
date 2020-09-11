<!--
 * @Author: jiapeng.Zheng
 * @Date: 2019-08-12 08:49:40
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-31 16:47:04
 * @Description: 首页-首页中部内容(地图模块)
 -->
<template>
  <div class="device-map" ref="iDeviceMap" :class="mapDataType"></div>
</template>
<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator'
import ContentMedia from './contentMedia.vue'
// import { _PROJECT } from '@constants/projectType'
import { DEFAULT_POSITION } from '@constants/index'
import ThemeColor from '@constants/theme/color'
import { REGION_TOP_CODE } from '@constants/dictionaries'
import { OVERLAYS_FUNCTION } from '@constants/amapConfig'
import AreaRegionApi from '@helper/apis/areaRegion.js'

let __THIS

@Component({ components: { ContentMedia } })
export default class ContentMap extends Vue {
  @Prop({
    default() {
      return []
    }
  })
  mapData: Array<HomeListTypeBO>
  @Prop()
  mapDataType: HomeListType
  @Prop({
    default() {
      return {}
    }
  })
  deviceInfo: DeviceVO
  @Prop({ default: false })
  isDevice: boolean
  @Prop({ default: '' })
  hoverItemId: string
  /**
   * 激活的项目/站场
   */
  @Prop({
    default() {
      return {}
    }
  })
  itemData: HomeListTypeBO

  MapObj = null // 高德地图对象
  initMapZoom = 5 // 初始区域的层级
  defaultZoom = 10 // 默认层级
  amapMarkerzIndex = 100 // 地图覆盖物层级
  regionsDict: { [propName: string]: AreaRegionVO } = {} // 区域字典

  @Watch('hoverItemId')
  onHoverItemIdChange(val: string) {
    __THIS.markHoveredMethod(val)
  }

  @Watch('mapData')
  onMapDataChange(val: Array<HomeListTypeBO>) {
    const markers = []
    if (__THIS.MapObj && !__THIS.isDevice) {
      __THIS.MapObj.clearMap() // 清除所有的点标识
      Promise.all(
        val.map(async ele => {
          ele.lnglatXY = await this.getPosition(ele)
        })
      ).then(() => {
        val.forEach((ele, index) => {
          markers.push(__THIS.genMark(ele, index))
        })
        __THIS.MapObj.add(markers)
        __THIS.MapObj.setFitView() // 自动适配到合适视野范围; 无参数，默认包括所有覆盖物的情况
        // 当地图上的标志小于两个时，重新设备缩放层级
        if (val.length <= 1) {
          __THIS.MapObj.setZoom(this.defaultZoom)
        }
      })
    }
  }

  @Watch('deviceInfo')
  async onDeviceInfoChange(val: DeviceVO) {
    if (val && val.DeviceSn && __THIS.isDevice) {
      __THIS.MapObj.clearMap() // 清除所有的点标识
      __THIS.deviceInfo.lnglatXY = await this.getPosition(__THIS.deviceInfo)
      const mark = __THIS.genDeviceMark(__THIS.deviceInfo, 0)
      __THIS.MapObj.add(mark)
      __THIS.MapObj.setZoomAndCenter(this.defaultZoom, __THIS.deviceInfo.lnglatXY)
    } else {
      __THIS.onMapDataChange(__THIS.mapData)
    }
  }

  @Watch('itemData')
  async onItemDataChange(val: HomeListTypeBO) {
    // 当前项目下的项目/当前站场下的设备为空时，以当前项目为地图的定位中心
    if (this.mapData.length <= 0) {
      const centerPos = await this.getPosition(val)
      // __THIS.MapObj.setCenter(centerPos)
      // console.log(val, centerPos, this.mapData)
      __THIS.MapObj.setZoomAndCenter(this.defaultZoom, centerPos)
    }
  }

  @Watch('$theme')
  onThemeChange(val: string) {
    const styleName = 'amap://styles/' + ThemeColor[val].amap
    __THIS.MapObj.setMapStyle(styleName)
  }

  // ---------------------------------- 生命周期 ------------------------------------
  async created() {
    try {
      // 区域
      const regionsList: AllDataListVO2<AreaRegionVO> = await AreaRegionApi.findListRegion(REGION_TOP_CODE, this.$store.state.userInfo.groupId)
      // 区域字典
      for (const i of regionsList.Data) {
        this.regionsDict[i.Id] = i
      }
    } catch (errMsg) {
      this.$message.error(String(errMsg))
    }
  }

  activated() {
    __THIS = this
    if (!__THIS.MapObj) {
      __THIS.MapObj = new AMap.Map(__THIS.$refs.iDeviceMap, {
        resizeEnable: true,
        zoom: __THIS.initMapZoom,
        center: DEFAULT_POSITION.split(',')
      })
      __THIS.MapObj.setMapStyle(`amap://styles/${ThemeColor[this.$theme].amap}`)
      AMap.plugin(['AMap.Scale'], () => {
        __THIS.MapObj.addControl(new AMap.Scale())
      })
      if (__THIS.deviceInfo && __THIS.deviceInfo.DeviceSn) {
        __THIS.onDeviceInfoChange(__THIS.deviceInfo)
      }
    }
  }

  // ---------------------------------- 组件的方法 ------------------------------------
  /**
   * 生成点标识
   * @param { HomeListTypeBO } item
   * @param { number } index
   */
  genMark(item: HomeListTypeBO, index: number) {
    let marker
    switch (__THIS.mapDataType) {
      case 'project':
        marker = __THIS.genProjectMark(item, index)
        break
      case 'station':
        marker = __THIS.genProjectMark(item, index)
        break
      case 'device':
        marker = __THIS.genDeviceMark(item, index)
        break
      default:
        __THIS.$message.error('地图加载数据出错')
        break
    }
    return marker
  }

  /**
   * 生成项目点标识
   */
  genProjectMark(item: ProjectVO, index: number) {
    // let address = item.Address || '该设备暂未设置地址'
    // let myPosition = item.Position || DEFAULT_POSITION
    // let lnglatXY = myPosition.split(',')
    const lnglatXY = item.lnglatXY
    // 生成“点标注”
    const marker = new AMap.Marker({
      position: lnglatXY,
      title: item.ProjectName,
      content: `<div class="map-mark-icon" data-id="${item.Id}"><span class="map-mark-content" data-index="${index}">${index + 1}</span></div>`
    })
    // 绑定事件
    marker.on('click', function() {
      __THIS.$emit('onMarkClick', item)
    })
    marker.on('mouseover', function() {
      __THIS.$emit('onMarkHover', item.Id)
    })
    marker.on('mouseout', function() {
      __THIS.$emit('onMarkHover', '')
    })
    return marker
  }

  /**
   * 生成设备点标识
   */
  genDeviceMark(item: DeviceVO, index: number) {
    // let address = item.Address || '该设备暂未设置地址'
    // let myPosition = item.Position || DEFAULT_POSITION
    // let lnglatXY = myPosition.split(',')
    const lnglatXY = item.lnglatXY // item.Position // await this.getPosition(item)
    // 生成“点标注”
    const marker = new AMap.Marker({
      position: lnglatXY,
      title: item.DeviceName,
      content: `<div class="map-mark-icon" data-isWarn="${item._isWarn}" data-isOnline="${item._isOnline}" data-active="${__THIS.isDevice}" data-id="${
        item.DeviceSn
      }"><span class="map-mark-content" data-index="${index}">${index + 1}</span></div>`
    })
    // 绑定事件
    marker.on('click', function() {
      if (__THIS.isDevice) {
        // console.log('isDevice click', __THIS)
      } else {
        __THIS.$emit('onMarkClick', item)
      }
    })
    marker.on('mouseover', function() {
      __THIS.$emit('onMarkHover', item.DeviceSn)
    })
    marker.on('mouseout', function() {
      __THIS.$emit('onMarkHover', '')
    })
    return marker
  }

  /**
   *
   * 根据设备\站场\项目信息获取地理坐标：
   *
   * 1、若地理位置(Position)存在，则直接使用该坐标;
   *
   * 2、若地理位置不存在，但地域(AreaId)存在，则根据AreaId获取地域坐标;
   *
   * 3、若地域不存在，但区域(RegionId)存在，则根据区域的信息计算坐标;
   *
   * 4、若Position、AreaId、RegionId都为空，则使用默认的坐标 DEFAULT_POSITION;
   *
   * @param { HomeListTypeBO } item 设备\站场\项目信息
   */
  async getPosition(item: HomeListTypeBO) {
    let pos: Array<string | number>
    if (item.Position) {
      // pos = await new Promise(resolve => {
      //   setTimeout(() => {
      //     resolve(item.Position.split(','))
      //   }, 0)
      // })
      pos = item.Position.split(',')
    } else if (item.AreaId) {
      const areaObj = await AreaRegionApi.getArea(item.AreaId)
      const { Latitude, Longitude } = areaObj.Data
      pos = [String(Longitude), String(Latitude)]
    } else if (item.RegionId) {
      const regionId = item.RegionId
      // if (!this.regionsDict[regionId]) {
      //   // 区域
      //   let regionsList: AllDataListVO2<AreaRegionVO> = await AreaRegionApi.findListRegion(REGION_TOP_CODE)
      //   // 区域字典
      //   for (let i of regionsList.Data) {
      //     this.regionsDict[i.Id] = i
      //   }
      // }
      pos = OVERLAYS_FUNCTION.calcCenterPosition(this.regionsDict[regionId].Radius)
    } else {
      // pos = await new Promise(resolve => {
      //   setTimeout(() => {
      //     resolve(DEFAULT_POSITION.split(','))
      //   }, 0)
      // })
      pos = DEFAULT_POSITION.split(',')
    }
    return pos
  }

  /**
   * 外部 item hover时，点标识样式跟着改变
   */
  markHoveredMethod(hoverItemId: string) {
    // 遍历点标识(marker),选中激活的点标识(marker)
    const $beforeHoverMarker = document.querySelectorAll('.amap-marker .amap-marker-content .map-mark-icon[data-hover="true"]')
    const $nowHoverMarker = document.querySelectorAll(`.amap-marker .amap-marker-content .map-mark-icon[data-id="${hoverItemId}"]`)
    Array.prototype.forEach.call($beforeHoverMarker, ele => {
      ele.setAttribute('data-hover', 'false')
      ele.parentNode.parentNode.style.zIndex = __THIS.amapMarkerzIndex
    })
    Array.prototype.forEach.call($nowHoverMarker, ele => {
      ele.setAttribute('data-hover', 'true')
      ele.parentNode.parentNode.style.zIndex = __THIS.amapMarkerzIndex + 1
    })
  }
}
</script>
<style lang="scss" module>
@import '~@assets/scss/variables.scss';
</style>
