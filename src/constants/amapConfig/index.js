import { $utils } from '@helper'

// 覆盖物属性
export const OVERLAYS_OPTION = {
  fillColor: '#20a0ff',
  strokeColor: '#80d8ff',
  fillOpacity: 0.4,
  cursor: 'pointer'
}
// 覆盖物hover属性
export const OVERLAYS_HOVER_OPTION = {
  ...OVERLAYS_OPTION,
  fillOpacity: 0.8
}
// 覆盖物方法
export const OVERLAYS_FUNCTION = {
  /**
   * 根据区域的 Radius 计算中心点坐标
   * @param {string} jsonStr AreaRegionVO.Radius
   */
  calcCenterPosition(jsonStr) {
    let position = [0, 0]
    if ($utils.isJsonString(jsonStr)) {
      const jsonObj = JSON.parse(jsonStr)
      if (jsonObj.path !== undefined) {
        jsonObj.path.forEach(i => {
          position[0] += i.lng
          position[1] += i.lat
        })
        position[0] = position[0] / jsonObj.path.length
        position[1] = position[1] / jsonObj.path.length
      } else {
        position = [jsonObj.center.lng, jsonObj.center.lat]
      }
    } else {
      console.error(`${jsonStr} is not a JSON String`)
    }
    return position
  }
}
// 限制区域的属性
export const BOUNDS_AREA_OPTION = { fillOpacity: 0, strokeColor: '#ff4949', strokeStyle: 'dashed', zIndex: 0 }
// 消息类型配置
export const OVERLAYS_TYPE_CONFIG = {
  circle: {
    mouseToolType: 'circle',
    editPlugin: 'CircleEditor',
    init: (data, isBoundsArea) => {
      const { radius, center } = data
      return new AMap.Circle({
        radius,
        center: [center.lng, center.lat],
        ...(isBoundsArea ? BOUNDS_AREA_OPTION : OVERLAYS_OPTION)
      })
    },
    ringArea: ({ radius }) => {
      return Math.PI * radius * radius
    }
  },
  rectangle: {
    mouseToolType: 'rectangle',
    editPlugin: 'RectangleEditor',
    init: (data, isBoundsArea) => {
      const { northeast, southwest } = data.bounds
      const bounds = new AMap.Bounds(new AMap.LngLat(southwest.lng, southwest.lat), new AMap.LngLat(northeast.lng, northeast.lat))
      return new AMap.Rectangle({
        bounds,
        ...(isBoundsArea ? BOUNDS_AREA_OPTION : OVERLAYS_OPTION)
      })
    },
    ringArea: ({ path }) => {
      return AMap.GeometryUtil.ringArea(path)
    }
  },
  polygon: {
    mouseToolType: 'polygon',
    editPlugin: 'PolyEditor',
    init: (data, isBoundsArea) => {
      let { path } = data
      path = path.map(p => {
        const { lat, lng } = p
        return new AMap.LngLat(lng, lat)
      })
      return new AMap.Polygon({
        path,
        ...(isBoundsArea ? BOUNDS_AREA_OPTION : OVERLAYS_OPTION)
      })
    },
    ringArea: ({ path }) => {
      return AMap.GeometryUtil.ringArea(path)
    }
  }
}
