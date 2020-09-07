/*
 * @Author: jiapeng.Zheng
 * @Date: 2019-06-26 14:29:25
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-31 11:28:52
 * @Description:
 */
import $store from '@store'
import $utils from '@helper/utils.js'
import $apis from '@helper/apis'
import $_ from '@helper/lodash'
import routerInstance from '@router'
import RouterConfig from '@router/routes'
import CommonRouterConfig from '@router/routes/common'
import MenuConfig from '@constants/menuConfig'
import CommonMenuConfig from '@constants/menuConfig/m001_common'
import { SESSIONSTORAGE_USERMENU_KEY, SESSIONSTORAGE_ISFIRST_KEY } from '@constants/index'
import { locales } from '@/locales'

const NotFound = {
  path: '*',
  meta: {
    title: $utils.titleLang('页面未找到', 'Page Not Found'),
    ignoreAuth: true
  },
  component: resolve => require.ensure([], () => resolve(require('@views/exception/NotFound')), 'notFound')
  // component: resolve => require(['@views/exception/NotFound'], resolve)
}

// 在固有的路由中添加 404 路由
const InherentMenu = CommonRouterConfig.concat([NotFound])

/**
 * 格式化菜单数据，同时为导航菜单（item.MenuType === 0）添加 loading 标识
 * @param {Array} menu  菜单列表数据
 */
const menuDataFormat = menu => {
  const topMenu = []
  menu.forEach(item => {
    const itemMenu = {
      id: item.Id,
      icon: item.Icon,
      path: item.Url ? item.Url.replace(/\s+/g, '') : '',
      title: $utils.titleLang(item.Name, item.Name), // 菜单的标题，侧边导航栏菜单显示的名称
      ...item
    }
    // 只有导航菜单才有可能有子菜单（非管理员）
    if (item.MenuType === 0) {
      // 由于子菜单是 addSubMenu 异步动态添加的，所以默认为loading（非管理员）
      topMenu.push({
        id: `${item.Id}-loading`,
        ParentId: item.Id,
        icon: 'loading',
        path: '',
        title: $utils.titleLang('子菜单加载中...', 'loaing subMenu...')
      })
    }
    topMenu.push(itemMenu)
  })
  return topMenu
}

/**
 * 菜单初始化
 * @param {Array}   menu      菜单列表
 * @param {Boolean} IsAdmin   是否管理员
 */
const menuInit = (menu, IsAdmin) => {
  let sideNav = []
  let topMenu = []
  // 只有非管理员才需要根据 menu 生成菜单
  if (IsAdmin === false) {
    // 判断是否首次加载数据
    if ($utils.getSessionStorage(SESSIONSTORAGE_ISFIRST_KEY) === true) {
      // 格式化菜单数据并添加 loading
      topMenu = menuDataFormat(menu)
      // 添加固有菜单（即首页）
      topMenu = sideNav.concat(CommonMenuConfig, topMenu)
      // 缓存格式化后的菜单
      $utils.setSessionStorage(SESSIONSTORAGE_USERMENU_KEY, topMenu)
    } else {
      topMenu = $utils.getSessionStorage(SESSIONSTORAGE_USERMENU_KEY)
    }
    // json格式转化为树形格式
    sideNav = $utils.treeDataFormat({ data: topMenu, idName: 'id', parentIdName: 'ParentId', parentNodeflag: null })
  } else if (IsAdmin === true) {
    // 管理员默认拥有所有的菜单 MenuConfig
    sideNav = sideNav.concat(MenuConfig) // MenuConfig
  }
  return { sideNav, topMenu }
}

/**
 * 路由格式化：根据 "菜单数组" 格式化成 vue-router 的 router.addRoutes(routes: Array<RouteConfig>) 方法所需的 routes 参数
 * 注：只有非管理员才需要根据菜单生成路由，管理员默认已经添加所有的路由
 * @param {Array} menu 菜单列表
 */
const routerInit = menu => {
  const data = []
  menu.forEach(item => {
    // 只有链接菜单才有路由
    if (item.MenuType === 1) {
      const router = JSON.parse(item.Router) // item.Url ? item.Url.replace(/\s+/g, '') : ''
      data.push({
        path: '/',
        component: resolve => require.ensure([], () => resolve(require('@views/Frame')), 'frame'),
        // component: resolve => require(['@views/Frame'], resolve),
        children: [
          {
            path: router.path.replace(/\s+/g, ''),
            meta: {
              // 路由的标题，vue-router的导航守卫（beforeEach）beforeEachHooks.js 的 setTitle 用其来设置 document.title
              title: $utils.titleLang(item.Name, item.Name),
              ignoreAuth: false
            },
            /**
             * webpack 编译es6 动态引入 import() 时不能传入变量，例如 import(componentUrl) ,
             * 而要传入字符串 import('@views/demo/myClock')，这是因为 webpack 的现在的实现方式不能实现完全动态。
             * 但一定要用变量的时候，可以通过字符串模板来提供 ""部分信息"" 给webpack；例如 import(`@views/${componentUrl}`),
             * 这样编译时会编译所有 @views/ 下的模块，但运行时确定 componentUrl 的值才会加载，从而实现懒加载。
             */
            component: resolve => require([`@views/${router.componentUrl}`], resolve)
            // ...$utils.titleLang(item.Name, item.Name)
          }
        ]
      })
      // console.log(`Dynamic AddRoutes @views/${router.componentUrl} ${router.path}`, item)
    }
  })
  return data
}

/**
 * 动态路由生成器，根据菜单列表生成路由
 * @param {Array}    menu     菜单列表
 * @param {Boolean}  isAdmin  是否管理员
 */
const generator = (menu, isAdmin) => {
  // 管理员默认拥有所有的路由权限 RouterConfig
  const routerArray = isAdmin ? RouterConfig.concat([NotFound]) : InherentMenu.concat(routerInit(menu))
  routerInstance.addRoutes(routerArray)
}

/**
 * 异步动态添加子菜单（非管理员）
 * @param {String}  parentId  父菜单节点ID
 * @param {Array}   topMenu   父菜单数组
 * @param {Array}   sideNavs   父菜单数组（已经格式化的）
 */
const addSubMenu = async (parentId, topMenus, sideNavs) => {
  let isNeedRendered = false // 是否需要重新渲染菜单
  let sideNav = sideNavs
  const topMenu = topMenus

  let deleteIndex = null
  topMenus.forEach((item, topMenuIndex) => {
    // 查找要添加的子菜单所属的父节点下有无loading标识
    if (item.id === `${parentId}-loading`) {
      deleteIndex = topMenuIndex
    }
  })
  // 若父节点下有loading标识，则说明还未加载过该子菜单，需异步获取数据
  if (deleteIndex !== null) {
    // 请求子菜单数据
    const result = await $apis.sysMenu.getSub(parentId)
    // 删除要添加菜单的父节点下的loading标识
    topMenus.splice(deleteIndex, 1)
    if (result.list.length <= 0) {
      // 若子菜单为空，则添加 noData 标识
      topMenus.push({
        id: `${parentId}-noData`,
        ParentId: parentId,
        icon: '',
        path: '',
        title: $utils.titleLang('暂无子菜单', 'no subMenu')
      })
    } else {
      // 添加格式化后的子菜单数据
      topMenus.push(...menuDataFormat(result.list))
      // 动态生成路由
      generator(result.list, false)
      // 缓存新增的子菜单
      $utils.setSessionStorage(SESSIONSTORAGE_USERMENU_KEY, topMenus)
    }
    // 把新增的子菜单由json格式转化为树形格式
    sideNav = $utils.treeDataFormat({ data: topMenus, idName: 'id', parentIdName: 'ParentId', parentNodeflag: null })
    // 由于添加了子菜单，所以需要重新渲染菜单
    isNeedRendered = true
  }
  return { isNeedRendered, sideNav, topMenu }
}

const VUE_ROUTER_GENERATOR = {
  generator,
  menuInit,
  addSubMenu,
  /**
   * 根据 vuex 中存储的 $historyPath 进行路径的回退
   * @param {string} nowPath 当前路径
   */
  goBackByHistoryPath(nowPath) {
    // let toPath = '/common/home'
    // 在历史路由中查找当前路由的全链路
    const historyPathList = $utils.getDataFromJson({
      data: $store.state.$historyPath,
      parentKey: 'parentPath',
      parentNoddeflag: undefined,
      serachKey: 'path',
      serachData: nowPath
    })
    // 只有链路长度大于2(通过goToPage跳转，且fromPath不为null)才能正确回到上一级，否则返回首页
    if (historyPathList.length >= 2) {
      const { path } = historyPathList[historyPathList.length - 2]
      // toPath = path
      routerInstance.push(path)
    } else {
      routerInstance.go(-1)
    }

    // routerInstance.push(toPath)
    // // 保存跳转的路由
    // $store.commit('$vuexSetActiveMenu', { path: toPath, title: toTitle })
    // // 保存激活的路由
    // $store.commit('$vuexAddHistoryPath', { parentPath: parentPath, path: toPath, title: toTitle })
    // console.log(historyPathList)
  },
  /**
   * 页面跳转
   * @param {string} toPath     要跳往页面的链接
   * @param {string} toTitleKey 要跳往页面的名称
   * @param {string | object} fromPath   从哪个页面跳转的链接，
   * 为 空 时， 会清空 head 中 path-breadcrumb 组件的 breadcrumbData 数据
   * 为 string 时，会在 HistoryPath 新增一条路径
   * 为 object 时，会根据 fromPath({fullPath:String | Array, fullPathName:String, fullPathID:String})重置保存于 vuex 中的历史路径 HistoryPath
   * @param { boolean } isReplace   判断是否覆盖当前路由
   * @description
   *  当 fromPath 为 string 时，即该变量为上一级路径；
   *  当 fromPath 为 object 时，该变量包含了当上一级路径到最顶级路径（必须都是同一路径只是携带参数不同），会重设整个 path-breadcrumb 组件的 breadcrumbData 数据
   */
  goToPage(toPath, toTitleKey, fromPath = null, isReplace = false) {
    // let parentPath = $store.state.$activeMenu.path // 当前激活的路由
    let parentPath = fromPath
    // 重设链接的全路径
    if ($_.isObject(fromPath)) {
      const { fullPath, fullPathName, fullPathID } = fromPath
      parentPath = VUE_ROUTER_GENERATOR.resetHistoryPath(fullPath, fullPathName, fullPathID)
    }

    isReplace ? routerInstance.replace(toPath) : routerInstance.push(toPath)

    let toTitle = {}
    if (toTitleKey) {
      for (const i in locales) {
        toTitle[i] = locales[i][toTitleKey] || toTitleKey
      }
      // 使用用户自 goToPage 定义的名称，覆盖路由默认名称
      $store.commit('$vuexSetActiveMenu', { path: toPath, title: toTitle })
    } else {
      toTitle = $store.state.$activeMenu.title
    }
    // 保存激活的路由
    $store.commit('$vuexAddHistoryPath', { parentPath: parentPath, path: toPath, title: toTitle })
  },
  /**
   * 重置历史路由记录
   * @param {String | Array} fullPath       路径，// 必须带参数key 如 '&id='、或 '?id='
   * @param {String} fullPathName   以 / 分割的路径名称
   * @param {String} fullPathID     以 / 分割的路径ID
   * @description  使用设备、站场、项目的 fullPath 来重置页面的路由
   */
  resetHistoryPath(fullPath, fullPathName = '', fullPathID = '') {
    const fullPathNames = typeof fullPathName === 'string' ? fullPathName.split('/') : []
    const fullPathIDs = typeof fullPathID === 'string' ? fullPathID.split('/') : []
    const firstPath = '/common/home'
    let lastPath = null
    if (fullPath && fullPathNames.length && fullPathNames.length === fullPathIDs.length && fullPathNames[0] && fullPathIDs[0]) {
      $store.commit('$vuexAddHistoryPath', {
        parentPath: null,
        path: firstPath,
        title: $utils.titleLang('首页', 'Home')
      }) // 最顶级的路径默认为首页
      fullPath = $_.isArray(fullPath) && fullPath.length === fullPathIDs.length ? fullPath : Array(fullPathIDs.length).fill(fullPath)
      fullPathIDs.forEach((_pathId, _index) => {
        const parentPath = _index ? `${fullPath[_index - 1]}${fullPathIDs[_index - 1]}` : firstPath
        const path = `${fullPath[_index]}${_pathId}`
        const title = $utils.titleLang(fullPathNames[_index])
        $store.commit('$vuexAddHistoryPath', { parentPath, path, title })
      })
      lastPath = `${fullPath[fullPathIDs.length - 1]}${fullPathIDs[fullPathIDs.length - 1]}`
    }
    return lastPath
  },
  /**
   * 根据某一数据（ProjectVO、DeviceVO）下的 FullId、FullName 生成 fullPath
   * @param {string} fullId       该数据所属项目、站场的ID构成的路径，例子：项目ID/子项目ID/..../站场ID，不包含
   * @param {string} fullName     该数据所属项目、站场的名称构成的路径，例子：项目名称/子项目名称/..../站场名称
   * @param {HomeListType} type   该数据的类型：项目(_PROJECT.key)、站场(_STATION.key)、设备(_DEVICE.key)；（数据来源：src\constants\projectType\index.ts）
   * @return {Array<string>}      fullPath
   */
  genFullPathByFullId(fullId = '', fullName = '', type) {
    const _routerCategory = {
      client: ['/common/home/client'],
      project: ['/common/home/project/'],
      station: ['/common/home/project/'],
      device: ['/common/home/project/', '/common/home/station/']
    }
    const _firstPath = '/common/home'
    const fullPathName = typeof fullName === 'string' ? fullName.split('/') : []
    const fullPathID = typeof fullId === 'string' ? fullId.split('/') : []
    const fullPath = []
    if (fullPathName.length && fullPathName.length === fullPathID.length && fullPathName[0] && fullPathID[0]) {
      const router = _routerCategory[type] || [_firstPath]
      fullPathID.reverse().forEach((_id, index) => {
        let routerIndex = router.length - index - 1
        routerIndex = routerIndex >= 0 ? routerIndex : 0
        fullPath.unshift(`${router[routerIndex]}`)
      })
    }
    return fullPath
  }
}

export default VUE_ROUTER_GENERATOR
