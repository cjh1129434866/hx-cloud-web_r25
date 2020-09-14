/*
 * @Author: jiapeng.Zheng
 * @Date: 2018-04-24 14:02:22
 * @Last Modified by: jiapeng.Zheng
 * @Last Modified time: 2019-06-14 14:58:16
 * @description: 项目api
 */
import $ajax from '@helper/ajax'
import $utils from '@helper/utils'
// import store from '@store'

const serverUrl = $utils.serverUrl

// let testDeviceSn = '20180318010001'

export default {
  /* ----------------------------- project ------------------------------- */
  /**
   * 获取所有项目，只有管理员有权限
   */
  getAllProject() {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token }
    return $ajax.get(serverUrl('Project/GetAllProject'), data)
  },
  /**
   * 获取单个项目信息
   * @param {String} projectId   项目标示
   */
  findProject(projectId) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, projectId }
    return $ajax.get(serverUrl('Project/FindProject'), data)
  },
  /**
   * 获取主项目
   */
  findUserProject() {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token }
    return $ajax.get(serverUrl('Project/FindUserProject'), data)
  },

  /**
   * 获取子项目，可能包含站场和项目
   * @param {number} projectId 项目/站场id
   * @param {{ enableCache: false , couldCancelRepeatRequest: false}} op   预留的配置，目前支持是否开启接口缓存功能(enableCache)，能否取消重复请求(couldCancelRepeatRequest)
   */
  findUserSubProject(projectId, op = { couldCancelRepeatRequest: false }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, projectId }
    return $ajax.get(serverUrl('Project/FindUserSubProject'), data, op)
  },

  /**
   * 获取项目或者站场的分页数据，只能获取projectId下的一级项目
   * @param { ProjectPageDTO } searchForm
   * @description pageNo      页码
   * @description pageSize    页大小
   * @description projectId   父项目编号，如果一级项目则为空
   * @description sortData    排序的字段
   * @description sortType    排序类型(asc或者desc)
   * @description projectName 查询字段：项目名称
   * @description projectName 查询字段：项目类型
   * @description projectName 查询字段：项目类型
   * @returns { ProjectPageDataListVO<ProjectVO> }
   */
  getPageProject(groupId) {
    return $ajax.get(serverUrl(`${groupId}/project`), data)
  },
  /**
   * 获取我的项目，只包含有权限的最顶层的项目（分页）
   * @param { ProjectPageDTO } searchForm
   * @description pageNo      页码
   * @description pageSize    页大小
   * @description sortData    排序的字段
   * @description sortType    排序类型(asc或者desc)
   * @description projectName 查询字段：项目名称
   * @returns { ProjectPageDataListVO<ProjectVO> }
   */
  myProject({ pageNo, pageSize, sortData, sortType, Search }, groupId) {
    const data = { PageNo: pageNo, PageSize: pageSize, OrderBy: sortData, OrderType: sortType, Search: Search ? Search : ''  }
    return $ajax.get(serverUrl(`${groupId}/project/myProject`), data)
  },
  /**
   * 获取我的项目，只包含有权限的最顶层的项目（不分页）
   * @param {String} projectName 查询字段：项目名称
   */
  myProjects({ projectName = '' } = {}) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, projectName }
    return $ajax.get(serverUrl('Project/MyProjects'), data)
  },

  /**
   * 获取我的站场（分页）
   * @param { ProjectPageDTO } searchForm
   * @description pageNo      页码
   * @description pageSize    页大小
   * @description sortData    排序的字段
   * @description sortType    排序类型(asc或者desc)
   * @description projectName 查询字段：项目名称
   * @returns { ProjectPageDataListVO<ProjectVO> }
   */
  mySites({ pageNo, pageSize, sortData, sortType, Search}, groupId) {
    const data = { PageNo: pageNo, PageSize: pageSize, OrderBy: sortData, OrderType: sortType, Search: Search ? Search : '' }
    return $ajax.get(serverUrl(`${groupId}/project/mySite`), data)
  },
  /**
   * 获取用户所有的站场
   */
  myAllSites() {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token }
    return $ajax.get(serverUrl('Project/MyAllSites'), data)
  },
  /**
   * 获取项目的附属信息
   * @param {number} projectId 项目id
   */
  getProjectAffilate(projectId) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, projectId }
    return $ajax.get(serverUrl('ProjectAffiliate/GetProjectAffilate'), data)
  },

  /**
   * 新增项目
   * @param {String} ProjectName  项目/站场名称
   * @param {number} ProjectType  项目/站场类型，1代表项目，2代表站场
   * @param {number} ParentId     父项目标识
   * @param {number} FullId       完整路径标示，各个路径之间用/分割，一级项目不用填写，自动生成为当前项目的Id
   * @param {number} FullName     完整路径名称，各个路径名称之间用/分割，一级项目不用填写
   * @param {String} RegionId     区域标示
   * @param {String} AreaId       地域标识
   * @param {String} Address      地址
   * @param {String} Position     地址坐标
   */
  projectAdd({ ProjectName, ProjectType, ParentId, FullId, FullName, RegionId, AreaId, Address, Position }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    // let projectType = PROJECT_TYPE_PROJECT
    const data = {
      account,
      token,
      projectName: ProjectName,
      ProjectType,
      ParentId,
      FullId,
      FullName,
      RegionId,
      AreaId,
      Address,
      Position
    }
    return $ajax.post(serverUrl('Project/ProjectAdd'), data)
  },

  /**
   * 新增子项目,可能包含项目或站场
   * @param {string} Name 项目/站场名称
   * @param {number} projectType 项目/站场类型，1代表项目，2代表站场
   * @param {number} parentId    父标识
   */
  subProjectAdd({ ProjectName, ProjectType, ParentId }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, projectName: ProjectName, ProjectType, ParentId }
    return $ajax.post(serverUrl('Project/ProjectAdd'), data)
  },

  /**
   * 修改项目信息（项目和站场不能互相转换）
   * @param {String} Name         项目名称
   * @param {String} Id           项目标示
   * @param {String} ClientId     客户标示
   * @param {String} ParentId     父项目标示
   * @param {String} RegionId     区域标示
   * @param {String} AreaId       地域标识
   * @param {String} Address      地址
   * @param {String} Position     地址坐标
   */
  updateProject({ ProjectName, Id, ClientId, ParentId, RegionId, AreaId, Address, Position }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, ProjectName, Id, ClientId, ParentId, RegionId, AreaId, Address, Position }
    return $ajax.put(serverUrl('Project/UpdateProject'), data)
  },

  /**
   * 删除项目（只能删除没有子节点的项目）
   * @param {number} projectId      项目标示
   */
  deleteProject(id) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, id }
    return $ajax.post(serverUrl('Project/DeleteProject'), data)
  },

  /* ----------------------------- project affilate ------------------------------- */
  /**
   * 添加项目附属信息
   * @param {string} AffiliateName  附属名
   * @param {string} AffiliateValue 附属值
   * @param {number} projectId      项目id
   */
  projectAffilateAdd({ AffiliateName, AffiliateValue, projectId }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, AffiliateName, AffiliateValue, projectId }
    return $ajax.post(serverUrl('ProjectAffiliate/ProjectAffilateAdd'), data)
  },

  /**
   * 更新项目附属属性
   * @param {string} id             项目附属属性ID
   * @param {string} AffiliateName  附属名
   * @param {string} AffiliateValue 附属值
   * @param {number} projectId      项目id
   */
  projectAffiliateEdit({ Id, AffiliateName, AffiliateValue, ProjectId }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, Id, AffiliateName, AffiliateValue, ProjectId }
    return $ajax.put(serverUrl('ProjectAffiliate/ProjectAffiliateEdit'), data)
  },

  /**
   * 删除项目附属属性
   * @param {string} id             项目附属属性ID
   * @param {number} projectId      项目id
   */
  projectAffiliateRemove({ Id, ProjectId }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, Id, ProjectId }
    return $ajax.post(serverUrl('ProjectAffiliate/ProjectAffiliateRemove'), data)
  },
  /**
   * 删除项目图片
   * @param {string} id             项目附属属性ID
   * @param {number} projectId      项目id
   */
  projectImageRemove({ Id, ProjectId }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, Id, ProjectId }
    return $ajax.post(serverUrl('ProjectImage/ProjectImageRemove'), data)
  }
}
