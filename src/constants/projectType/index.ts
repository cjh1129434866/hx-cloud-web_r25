/*
 * @Author: jiapeng.Zheng
 * @Date: 2019-06-26 14:29:25
 * @LastEditors: jiapeng.Zheng
 * @LastEditTime: 2019-07-23 14:16:57
 * @Description: 首页-左侧列表分类
 */
// I 代表 _PROJECT 在 _PROJECT 、 _STATION 、_DEVICE 构成的数组中的索引
// ID 代表项目的类型ID（ _DEVICE除外 ）
export const _CLIENT: CategoryBO = { I: -1, ID: 0, key: 'client', icon: 'menu/project', NAME: '客户' }
export const _PROJECT: CategoryBO = { I: 0, ID: 1, key: 'project', icon: 'menu/allproject', NAME: '项目' }
export const _STATION: CategoryBO = { I: 1, ID: 2, key: 'station', icon: 'menu/sites', NAME: '站场' }
export const _DEVICE: CategoryBO = { I: 2, ID: 3, key: 'device', icon: 'menu/device', NAME: '设备' }
export const DATA_CATEGORY: DataCategoryBO = { project: _PROJECT, station: _STATION, device: _DEVICE }
