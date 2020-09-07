import { _DEVICE, _CLIENT, _PROJECT, _STATION, DATA_CATEGORY } from '@constants/projectType'
import { $vueRouterGenerator } from '@helper'
export default {
  /**
   * 设备数据格式化
   * @param {DeviceVO} itemData 设备数据
   */
  DeviceItemDataFormat(itemData: DeviceVO) {
    const homeListItemData: HomeListItemDataBO<DeviceVO> = {
      id: itemData.DeviceSn,
      name: itemData.DeviceName,
      dataType: _DEVICE.key,
      urlParam: '',
      moreLink: '/common/app/device',
      fromPath: {
        fullPath: $vueRouterGenerator.genFullPathByFullId(itemData.FullId, itemData.FullName, _DEVICE.key),
        fullPathName: itemData.FullName,
        fullPathID: itemData.FullId
      },
      data: itemData
    }
    return homeListItemData
  },
  /**
   * 站场下设备数据格式化
   * @param {ProjectVO} itemData 当前站场
   * @param {DeviceVO} deviceItem 设备数据
   */
  StationDeviceItemDataFormat(itemData: ProjectVO, deviceItem: HomeListItemDataBO<DeviceVO>) {
    // 当前站场
    // let itemData = this.activeItemData.data
    itemData._activeDeviceData = deviceItem.data
    const homeListItemData: HomeListItemDataBO<ProjectVO> = {
      id: String(itemData.Id),
      name: itemData.ProjectName,
      dataType: _STATION.key,
      urlParam: `?_activeDevice=${deviceItem.id}`,
      moreLink: `/common/app/device?sitesId=${itemData.Id}`,
      fromPath: {
        fullPath: $vueRouterGenerator.genFullPathByFullId(itemData.FullId, itemData.FullName, _STATION.key),
        fullPathName: itemData.FullName,
        fullPathID: itemData.FullId
      },
      data: itemData
    }
    return homeListItemData
  },
  /**
   * 客户数据式化
   * @param {ClientVO} itemData 客户数据
   */
  ClientItemDataFormat(itemData: ClientVO) {
    const homeListItemData: HomeListItemDataBO<ClientVO> = {
      id: String(itemData.Id || ''),
      name: itemData.ClientName,
      dataType: _CLIENT.key,
      urlParam: '',
      moreLink: '',
      fromPath: {
        fullPath: $vueRouterGenerator.genFullPathByFullId(itemData.FullId, itemData.FullName, _CLIENT.key),
        fullPathName: itemData.FullName,
        fullPathID: itemData.FullId
      },
      data: itemData
    }
    return homeListItemData
  },
  /**
   * 项目数据式化
   * @param {ProjectVO} itemData 项目数据
   */
  ProjectItemDataFormat(itemData: ProjectVO) {
    const dataType = (Object.keys(DATA_CATEGORY) as HomeListType[]).find(i => {
      return DATA_CATEGORY[i].ID === itemData.ProjectType
    })

    const moreLink = itemData.Id ? `/common/app/station?projectId=${itemData.Id}` : '/common/app/project'

    const homeListItemData: HomeListItemDataBO<ProjectVO> = {
      id: String(itemData.Id || ''),
      name: itemData.ProjectName,
      dataType: dataType,
      urlParam: '',
      moreLink: moreLink,
      fromPath: {
        fullPath: $vueRouterGenerator.genFullPathByFullId(itemData.FullId, itemData.FullName, _PROJECT.key),
        fullPathName: itemData.FullName,
        fullPathID: itemData.FullId
      },
      data: itemData
    }
    return homeListItemData
  },
  /**
   * 站场数据式化
   * @param {ProjectVO} itemData 站场数据
   */
  StationItemDataFormat(itemData: ProjectVO) {
    const moreLink = itemData.Id ? `/common/app/device?sitesId=${itemData.Id}` : '/common/app/station'

    const homeListItemData: HomeListItemDataBO<ProjectVO> = {
      id: String(itemData.Id || ''),
      name: itemData.ProjectName,
      dataType: _STATION.key,
      urlParam: itemData._activeDeviceData ? `?_activeDevice=${itemData._activeDeviceData.DeviceSn}` : '',
      moreLink: moreLink,
      fromPath: {
        fullPath: $vueRouterGenerator.genFullPathByFullId(itemData.FullId, itemData.FullName, _STATION.key),
        fullPathName: itemData.FullName,
        fullPathID: itemData.FullId
      },
      data: itemData
    }
    return homeListItemData
  }
}
