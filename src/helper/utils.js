/*
 * @Author: jiapeng.Zheng
 * @Date: 2019-06-26 14:29:25
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-05-19 11:37:47
 * @Description:
 */
import Cookies from 'js-cookie'
import Moment from 'moment'
import _ from '@helper/lodash.js'
import Download from '@helper/download.js'
import { SERVER_URL, VIDEO_API_URL, COOKIE_COONFIG } from '@constants/index'
import $mqttData from '@/prototype/mqttData'
import $store from '@store'
import { USERCONFIG_STATS_KEY, STAT_TYPE_CHECK, STAT_SHOW_LEVEL_ALL, STAT_FILTER_MAX_MIN } from '@constants/statisticsConfig/index'

// import TesWorker from '@/webWorkers/tes.worker.js'

if (typeof String.prototype.startsWith !== 'function') {
  Window.String.prototype.startsWith = function(prefix) {
    return this.slice(0, prefix.length) === prefix
  }
}

/**
 * 从 JSONArray 中找出符合 serachData 的节点，并递归出从顶级节点到该节点的所有节点
 * @param {JSONArray} data           要搜索的Array数据
 * @param {string} parentKey         父节点的属性名
 * @param {string} parentNoddeflag   顶级节点的值（递归时用当次节点的值，做为下次的父节点值）
 * @param {string} serachKey         要搜索的属性
 * @param {*} serachData             要搜索的值
 * @param {Array} resultData         递归用的中间变量
 * @return {Array}
 */
const selectDataFromTree = ({ data, parentKey, parentNoddeflag, serachKey, serachData, resultData }) => {
  const result = resultData || []
  for (const item of data) {
    if (item[serachKey] === serachData) {
      result.unshift(serachData)
      if (item[parentKey] !== parentNoddeflag) {
        selectDataFromTree({
          data,
          serachKey,
          parentKey,
          parentNoddeflag,
          serachData: item[parentKey],
          resultData: result
        })
      }
    }
  }
  return result
}

/**
 * 从 json 中找出符合 serachData 的节点，并递归出从顶级节点到该节点的所有节点
 * @param {JSON} data                要搜索的JSON数据
 * @param {string} parentKey         父节点的属性名
 * @param {string} parentNoddeflag   顶级节点的值（递归时用当次节点的值，做为下次的父节点值）
 * @param {string} serachKey         要搜索的属性
 * @param {*} serachData             要搜索的值
 * @param {Array} resultData         递归用的中间变量
 * @return {Array}
 */
const getDataFromJson = ({ data, parentKey, parentNoddeflag, serachKey, serachData, resultData }) => {
  const result = resultData || []
  for (const item in data) {
    if (data[item][serachKey] === serachData) {
      result.unshift(data[item])
      if (data[item][parentKey] !== parentNoddeflag) {
        getDataFromJson({
          data,
          serachKey,
          parentKey,
          parentNoddeflag,
          serachData: data[item][parentKey],
          resultData: result
        })
      }
    }
  }
  return result
}

/**
 * 把 JSONArray 格式化成 element-ui 的 Cascader 组件需要的树形结构数组
 * @param {JSONArray}   data            要格式化的数据
 * @param {Array}       idName          节点的属性名
 * @param {Array}       parentIdName    父节点的属性名
 * @param {Array}       parentNodeflag  顶级节点的值（递归时用当次节点的值，做为下次的父节点值）
 * @param {Array}       formatData      递归调用时的临时变量
 */
const treeDataFormat = ({ data, idName, parentIdName, parentNodeflag, formatData }) => {
  const result = formatData || {}
  const otherData = []
  data = JSON.parse(JSON.stringify(data)) // 拷贝原始数据，防止对原始数据进行修改
  // 遍历数据、提取出父级节点
  data.forEach(item => {
    if (item[parentIdName] === parentNodeflag) {
      result.children = result.children || []
      result.children.push(item)
    } else {
      otherData.push(item)
    }
  })
  if (result.children) {
    // 遍历父节点
    result.children.forEach((item, resultIndex) => {
      // 递归调用，当前循环节点的值 item[idName] 做为递归的父节点值 parentNodeflag
      treeDataFormat({
        data: otherData,
        idName,
        parentIdName,
        parentNodeflag: item[idName],
        formatData: result.children[resultIndex]
      })
    })
  }
  return result.children || []
}

/**
 * 从 data 中截取出 data[i][serachKey] === serachData 的子树
 * @param {TreeArray}   data             树形结构数据
 * @param {string}      childrenKey      子节点的属性名
 * @param {string}      serachKey        要搜索的属性
 * @param {*}           serachData       要搜索的值
 * @param {Array}       resultData       递归用的中间变量
 */
const getChildrenTreeFromTreeData = ({ data, childrenKey, serachKey, serachData, resultData }) => {
  const result = resultData || []
  for (const item of data) {
    if (item[serachKey] === serachData) {
      result.unshift(item)
    } else {
      // 判断是否存在子节点
      if (item[childrenKey] && item[childrenKey].length > 0) {
        getChildrenTreeFromTreeData({
          data: item[childrenKey], // 子节点作为下次循环的父节点
          childrenKey,
          serachKey,
          serachData: serachData,
          resultData: result
        })
      }
    }
  }
  return result
}
/**
 * 递归出从顶级节点到某节点（data[i][serachKey] === resultData）的所有节点
 * @param   {JSONArray}   data              JSON 数组
 * @param   {string}      parentKey         父节点的属性名
 * @param   {string}      parentNoddeflag   顶级节点的值（递归时用当次节点的值，做为下次的父节点值）
 * @param   {string}      serachKey         要搜索的属性
 * @param   {*}           serachData        要搜索的值
 * @param   {Array}       resultData        递归用的中间变量
 * @param   {Function}    callBackFn        回调函数，每次搜索到符合条件的节点就执行一次
 * @return  {Array}
 */
const getParentPathFromTreeData = ({ data, parentKey, parentNoddeflag, serachKey, serachData, resultData }, callBackFn) => {
  const result = resultData || []
  for (const item of data) {
    if (item[serachKey] === serachData) {
      result.unshift(item)
      typeof callBackFn === 'function' ? callBackFn(item) : void 0
      if (item[parentKey] !== parentNoddeflag) {
        getParentPathFromTreeData(
          {
            data,
            serachKey,
            parentKey,
            parentNoddeflag,
            serachData: item[parentKey],
            resultData: result
          },
          callBackFn
        )
      }
    }
  }
  return result
}
const UTILS_MODULE = {
  titleLang(zhStr, enStr) {
    return {
      zh: zhStr,
      en: enStr || zhStr
    }
  },

  serverUrl(apiName) {
    return `${SERVER_URL}/${apiName}`
  },

  videoApiUrl(apiName) {
    return `${VIDEO_API_URL}/${apiName}`
  },

  // 判断字符串是否为json格式的字符串
  isJsonString(str) {
    let isTrue = false
    if (typeof str === 'string') {
      try {
        const obj = JSON.parse(str)
        if (typeof obj === 'object' && obj) {
          isTrue = true
        } else {
          isTrue = false
        }
      } catch (e) {
        isTrue = false
      }
    }
    return isTrue
  },

  /**
   * 文件后缀修正
   * @param {string} fileName  文件名称
   * @param {string} suffix    文件后缀, 不带 .
   */
  updateFileSuffix(fileName = '', suffix = '') {
    let rfile = fileName
    const index = fileName.lastIndexOf('.')
    if (index > -1) {
      const ofileName = fileName.substr(0, index) // 原始的文件名称，不带后缀
      rfile = `${ofileName}.${suffix}`
    } else {
      rfile += `.${suffix}`
    }
    return rfile
  },

  /* ----------------------------- New RandomID ------------------------------------ */

  /**
   * 生成36位的CUID
   */
  new36Guid() {
    let guid = ''
    for (let i = 1; i <= 32; i++) {
      const n = Math.floor(Math.random() * 16.0).toString(16)
      guid += n
      if (i === 8 || i === 12 || i === 16 || i === 20) guid += '-'
    }
    return guid
  },

  /**
   * 生成32位的CUID
   */
  new32Guid() {
    let guid = ''
    for (let i = 1; i <= 32; i++) {
      const n = Math.floor(Math.random() * 16.0).toString(16)
      guid += n
    }
    return guid
  },

  newClientId() {
    let guid = ''
    for (let i = 1; i <= 23; i++) {
      const n = Math.floor(Math.random() * 16.0).toString(16)
      guid += n
    }
    return guid
  },

  /* -----------------------------url query------------------------------------ */

  query(search) {
    const str = search || window.location.search
    const objURL = {}

    str.replace(new RegExp('([^?=&]+)(=([^&]*))?', 'g'), ($0, $1, $2, $3) => {
      objURL[$1] = $3
      // console.log($0, $1, $2, $3)
    })
    return objURL
  },

  queryString(url, query) {
    const str = []
    let isEmpty = true
    for (const key in query) {
      str.push(key + '=' + query[key])
      isEmpty = false
    }
    return isEmpty ? url : url + '?' + str.join('&')
  },

  getUrlQuery(url) {
    let queryObj = {}
    if (url.indexOf('?') !== -1) {
      const search = url.split('?')[1]
      queryObj = UTILS_MODULE.query(search)
    }
    return queryObj
  },

  getQueryByName(url, name) {
    const queryObj = UTILS_MODULE.getUrlQuery(url)
    return queryObj[name]
  },

  /* -----------------------------localStorage------------------------------------ */
  /**
   * get Cookie
   */
  getCookie(key) {
    return Cookies.get(key)
  },
  /**
   * set Cookie
   */
  setCookie(key, content) {
    if (typeof content !== 'string') {
      content = JSON.stringify(content)
    }
    Cookies.set(key, content, COOKIE_COONFIG)
  },
  /**
   * remove Cookie
   */
  removeCookie(key) {
    Cookies.remove(key, { path: '' })
  },

  /* -----------------------------localStorage------------------------------------ */

  /**
   * set localStorage
   * @param {string} name
   * @param {JSON} content 内容目前只支持是json格式，因为 getLocalStorage 会对内容进行JSON.parse
   */
  setLocalStorage(name, content) {
    if (!name) return
    if (typeof content !== 'string') {
      content = JSON.stringify(content)
    }
    window.localStorage.setItem(name, content)
  },

  /**
   * get localStorage
   */
  getLocalStorage(name) {
    if (!name) return
    return JSON.parse(window.localStorage.getItem(name))
  },

  /**
   * delete localStorage
   */
  removeLocalStorage(name) {
    if (!name) return
    window.localStorage.removeItem(name)
  },
  /* -----------------------------sessionStorage------------------------------------ */
  /**
   * set sessionStorage
   * @param {string} name
   * @param {JSON} content 内容目前只支持是json格式，因为 getSessionStorage 会对内容进行JSON.parse
   */
  setSessionStorage(name, content) {
    if (!name) return
    if (typeof content !== 'string') {
      content = JSON.stringify(content)
    }
    window.sessionStorage.setItem(name, content)
  },
  /**
   *
   * @param {*} key
   * @param {*} keykey
   * @param {*} keyKeyValue
   */
  setSessionStorage2(key, keykey, keyKeyValue) {
    if (!key && !keykey) return
    if (typeof keyKeyValue !== 'string') {
      keyKeyValue = JSON.stringify(keyKeyValue)
    }
    let data = window.sessionStorage.getItem(key)
    if (!data) {
      keyKeyValue = JSON.stringify({ [keykey]: keyKeyValue })
    } else {
      data = JSON.parse(data)
      data[keykey] = keyKeyValue
      keyKeyValue = JSON.stringify(data)
    }
    window.sessionStorage.setItem(key, keyKeyValue)
  },

  /**
   * get sessionStorage
   */
  getSessionStorage(name) {
    if (!name) return
    return JSON.parse(window.sessionStorage.getItem(name))
  },

  /**
   * delete sessionStorage
   */
  removeSessionStorage(name) {
    if (!name) return
    window.sessionStorage.removeItem(name)
  },

  tableToExcel($tables, fileName) {
    const strMimeType = 'application/vnd.ms-excel'
    const uri = `data:${strMimeType};base64,`
    let worksheetXml = ''
    for (const _table of $tables) {
      const { $table, worksheetName } = _table
      let rowsXML = ''
      for (let j = 0; j < $table.rows.length; j++) {
        rowsXML += '<Row>'
        for (let k = 0; k < $table.rows[j].cells.length; k++) {
          const dataType = $table.rows[j].cells[k].getAttribute('data-type')
          const dataStyle = $table.rows[j].cells[k].getAttribute('data-style')
          const dataValue = $table.rows[j].cells[k].getAttribute('data-value') || $table.rows[j].cells[k].innerHTML
          const dataFormula = $table.rows[j].cells[k].getAttribute('data-formula') // || appname === 'Calc' && dataType === 'DateTime' ? dataValue : null
          const rowsCtx = {
            attributeStyleID: dataStyle === 'Currency' || dataStyle === 'Date' ? ' ss:StyleID="' + dataStyle + '"' : '',
            nameType: dataType === 'Number' || dataType === 'DateTime' || dataType === 'Boolean' || dataType === 'Error' ? dataType : 'String',
            data: dataFormula ? '' : dataValue,
            attributeFormula: dataFormula ? ' ss:Formula="' + dataFormula + '"' : ''
          }

          rowsXML += `<Cell${rowsCtx.attributeStyleID}${rowsCtx.attributeFormula}><Data ss:Type="${rowsCtx.nameType}">${rowsCtx.data}</Data></Cell>`
        }
        rowsXML += '</Row>'
      }
      worksheetXml += `<Worksheet ss:Name="${worksheetName}"><Table>${rowsXML}</Table></Worksheet>`
    }

    const template = `<?xml version="1.0"?>
    <?mso-application progid="Excel.Sheet"?>
    <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
      <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
        <Author></Author>
        <Created></Created>
      </DocumentProperties>
      <Styles>
        <Style ss:ID="Currency"><NumberFormat ss:Format="Currency"></NumberFormat></Style>
        <Style ss:ID="Date"><NumberFormat ss:Format="Medium Date"></NumberFormat></Style>
      </Styles>
      ${worksheetXml}
    </Workbook>`

    Download.download(uri + template, `${fileName}.xls`, strMimeType)
    // return uri + template // uri + window.btoa(unescape(encodeURIComponent(template)))
  },

  /* -----------------------------data pagination---------------------------------- */

  /**
   * Array数据分页
   * @param {Array} dataList 原始数据
   * @param {Number} pageSize   每页条数
   * @param {Number} pageNumber 页码
   */
  pagination(dataList, pageSize, pageNumber) {
    pageNumber = pageNumber - 1
    const paginationData = []
    if (!_.isArray(dataList)) {
      dataList = Array.prototype.slice.call(dataList)
    }
    const total = dataList.length
    const pageTotal = Math.ceil(total / pageSize)
    for (let i = 0; i < pageTotal; i++) {
      paginationData[i] = dataList.slice(i * pageSize, (i + 1) * pageSize)
    }
    pageNumber = pageNumber > pageTotal ? pageNumber : pageNumber
    return paginationData[pageNumber]
  },

  /* -----------------------------data compare------------------------------------ */

  /**
   * 数据模糊比较
   * @param {string} data 原始数据
   * @param {string} searchData 与之对比的数据
   */
  likeSearch(data, searchData) {
    return !searchData || (!!data && data.indexOf(searchData) > -1)
  },

  /**
   * 数据比较，若searchData为空直接返回true
   * @param {string|number} data 原始数据
   * @param {string|number} searchData 与之对比的数据
   */
  dataEquary(data, searchData) {
    return !searchData || data === searchData
  },

  /* -----------------------------treeData format------------------------------- */
  /**
   * json数组转化为json对象
   * @param {jsonArray} jsonArray
   * @param {String} key 以json数组中的key 作为json对象的属性
   */
  JSONArrayToObject(jsonArray, key) {
    const jsonObj = {}
    jsonArray.forEach(item => {
      jsonObj[item[key]] = item
    })
    return jsonObj
  },
  /**
   * 获取级联选择器选中的对象数据
   * @param {Array}   val
   * @param {Array}   opt
   * @param {Object}  defaultProps
   */
  getCascaderObj(val, opt, defaultProps) {
    return val.map(function(value) {
      for (const itm of opt) {
        if (itm[defaultProps.value] === value) {
          opt = itm[defaultProps.children]
          return itm
        }
      }
      return null
    })
  },
  /**
   * 遍历树形结构数据
   * @param {Object} { node:{...,`${childrenKey}`:[]}, childrenKey:"子节点的标识" }
   * @param {Function} callBackFn 回调函数
   */
  traverseTree({ node, childrenKey }, callBackFn) {
    if (!node) return
    const stack = [] // 缓存栈
    let tmpNode // 临时变量
    stack.push(node)
    while (stack.length > 0) {
      tmpNode = stack.pop()
      typeof callBackFn === 'function' ? callBackFn(tmpNode) : void 0
      if (tmpNode[childrenKey] && tmpNode[childrenKey].length > 0) {
        let i = tmpNode[childrenKey].length - 1
        for (i = tmpNode[childrenKey].length - 1; i >= 0; i--) {
          stack.push(tmpNode[childrenKey][i])
        }
      }
    }
  },
  getDataFromJson: getDataFromJson,
  getChildrenTreeFromTreeData: getChildrenTreeFromTreeData,
  getParentPathFromTreeData: getParentPathFromTreeData,
  treeDataFormat: treeDataFormat,
  selectDataFromTree: selectDataFromTree,

  /* ------------------------ float Data format------------------------------- */
  /**
   * 将大于1000的数字转换为 n万、 n千万、 n亿
   * @param {string|number}   num
   * @param {number}          digits    保留几位，默认为2
   * @returns {string}
   */
  bigNumberFormat(num, digits = 2) {
    let _num = Number(num)
    let _unit = ''
    const decimals = [
      { name: '万', value: 10000 },
      { name: '千万', value: 1000 },
      { name: '亿', value: 10 }
    ]
    const len = decimals.length
    let i = 0
    if (isNaN(_num)) {
      return 0
    } else {
      while (i < len && _num >= decimals[i].value) {
        const { name, value } = decimals[i]
        _num = _num / value
        _unit = name
        i++
      }
    }
    return UTILS_MODULE.keepDecimal(_num, digits) + _unit
  },
  /**
   * 保留N位小数
   * @param {string|number}   num       小数
   * @param {number}          digits    保留几位，默认为2
   * @param {boolean}         isRound   是否四舍五入，默认为true
   * @param {string|number}   errorVal  若 num 非数字时返回的值，默认为0
   * @returns {string|number}
   */
  keepDecimal(num = 0, digits = 2, isRound = true, errorVal = 0) {
    let result = parseFloat(num)
    if (isNaN(result)) {
      console.error(`keepDecimal: the "num"(${num}) parameter must be a Number`)
      return errorVal
    }
    const digitsStep = Math.pow(10, digits)
    result = isRound ? Math.round(num * digitsStep) / digitsStep : Math.floor(num * digitsStep) / digitsStep
    result = result.toString()
    let posDecimal = result.indexOf('.')
    if (posDecimal < 0 && digits) {
      posDecimal = result.length
      result += '.'
    }
    while (result.length <= posDecimal + digits) {
      result += '0'
    }
    return result
  },
  /* -----------------------------DateTime------------------------------------ */
  getDateRange({ startDate = Date.now(), rangeNumber = 7, rangeUnit = 'days', format = 'YYYY-MM-DD' } = {}) {
    const end = Moment(startDate)
    const start = Moment(startDate).subtract(rangeNumber, rangeUnit)
    return { Begin: start.format(format), End: end.format(format) }
  },
  /**
   * 判断日期是否为空
   * @param {String|Date} dateTime
   * @returns {boolean}
   */
  dateTimeIsEmpty(dateTime) {
    return _.isDate(dateTime) ? false : _.isEmpty(dateTime)
  },

  /**
   * 判断开始时间是否大于等于结束时间
   * start和end只要有一个为空就返回true
   *
   * @param {String|Date|number} start 开始时间，可为空
   * @param {String|Date|number} end   结束时间，可为空
   * @param {string} [format] http://momentjs.cn/docs/#/displaying/difference/
   * @returns {Number}
   */
  dateCompare(start, end, format) {
    /*
    let isTrue = UTILS_MODULE.dateTimeIsEmpty(start) ||
      UTILS_MODULE.dateTimeIsEmpty(end) ||
      Moment(start).isSame(end) ||
      Moment(start).isBefore(end)
    if (isTrue) {
      Moment(start).diff(Moment(Moment), format)
    } else {
      return 0
    }
    */

    let result = Moment(start).diff(Moment(end), format)
    if (_.isNaN(result)) {
      result = 0
    }
    return result
  },

  dataCostObj(start, end) {
    const startObj = Moment(start).add(1, 'days')
    return {
      years: startObj.diff(Moment(end), 'years', true),
      month: startObj.diff(Moment(end), 'month', true),
      days: startObj.diff(Moment(end), 'days', true),
      hours: startObj.diff(Moment(end), 'hours', true)
    }
  },

  dataCost(start, end) {
    const startObj = Moment(start).add(1, 'days')
    const years = startObj.diff(Moment(end), 'years')
    const month = startObj.diff(Moment(end), 'month')
    const days = startObj.diff(Moment(end), 'days')
    if (years) {
      const _month = month - years * 12
      const _days = days - years * 365
      if (_month && _days) {
        return `${years} 年 ${_month} 月 ${_days} 天`
      } else if (_month) {
        return `${years} 年 ${_month} 月`
      } else if (_days) {
        return `${years} 年 ${_days} 天`
      } else {
        return `${years} 年`
      }
    } else if (month) {
      const _days = days - month * 30
      if (_days) {
        return `${month} 月 ${_days} 天`
      } else {
        return `${month} 月`
      }
    } else if (days) {
      return `${days} 天`
    } else {
      return `1 天`
    }
  },

  dateCostByDay(day) {
    const nowDate = new Date()
    const startTime = UTILS_MODULE.dateSubtract(new Date(), day, 'day')
    return UTILS_MODULE.dataCost(nowDate, startTime)
  },

  mqttSendDateConvert(time, format = 'YYYY-MM-DDTHH:mm:ss') {
    return time && Moment(time).format(format) // 1998-02-23T14:23:05
  },
  mqttReceiveDateConvert(time, format = 'YY/MM/DD,HH:mm:ss+32') {
    return time && Moment(time).format(format) // 18/08/22,11:25:14+32
  },
  mqttReceiveDateFormat(strTime, format = 'YY/MM/DD,HH:mm:ss+32') {
    return Moment(strTime, format).format('YYYY-MM-DD HH:mm:ss')
  },
  dateSubtract(time, value, unit) {
    return Moment(time).subtract(value, unit)._d
  },
  dateConvert(time, format = 'YYYY-MM-DD HH:mm:ss') {
    return time && Moment(time).format(format)
  },
  dayConvert(time, format = 'YYYY-MM-DD') {
    return time && Moment(time).format(format)
  },
  yearConvert(time) {
    return time && Moment(time).format('YYYY')
  },
  monthConvert(time) {
    return time && Moment(time).format('YYYY-MM')
  },
  timeConvert(time, format = 'HH:mm:ss') {
    return time && Moment(time).format(format)
  },
  /* ----------------------------- Sort ------------------------------------ */
  bubbleSort(arry = [], sortRule) {
    if (typeof sortRule !== 'function') {
      console.error('sortRule must be function!')
    } else {
      const len = arry.length
      for (let i = 0; i < len - 1; i++) {
        for (let j = 0; j < len - 1 - i; j++) {
          if (sortRule(arry[j], arry[j + 1])) {
            const tmp = arry[j]
            arry[j] = arry[j + 1]
            arry[j + 1] = tmp
          }
        }
      }
    }
  },
  /* ----------------------------- statistics Data ------------------------------------ */
  /**
   * 统计数据格式化
   * @param {Array} data 原始的统计数据
   */
  statisticsDataFormat(data, { showLevel = STAT_SHOW_LEVEL_ALL, typeStatCof = {} } = { showLevel: STAT_SHOW_LEVEL_ALL, typeStatCof: {} }) {
    // 获取不同类型统计图的个性化配置（目前主要用来判断首页上是否显示对应的统计图）
    const cof = $store.state.$userConfig[USERCONFIG_STATS_KEY] || {}
    // // webWorker
    // var worker = new TesWorker()
    // worker.postMessage({ a: 1 })
    // worker.onmessage = function(event) {
    //   console.log('onmessage', event)
    // }
    // worker.addEventListener('message', function(event) {
    //   console.log('message', event)
    // })
    // 按照时间进行排序
    data = data.sort(function(o1, o2) {
      return new Date(o1.Date) - new Date(o2.Date)
    })
    const rData = {}
    // 遍历 data
    for (const i of data) {
      // 直接通过截取字符串获取年月日(必须确保 i.Date 的格式为 YYYY-MM-DD)，不通过 Moment 库进行格式化获取（数据量过多时很耗时间）
      const _date = i.Date.substr(0, 10) // UTILS_MODULE.dayConvert(i.Date)
      const _year = i.Date.substr(0, 4) // UTILS_MODULE.yearConvert(i.Date)
      const _month = i.Date.substr(0, 7) // UTILS_MODULE.monthConvert(i.Date)
      // 解析 data 数据中的 Data 属性（包含各种类型的统计数据）
      if (UTILS_MODULE.isJsonString(i.Data)) {
        const typeStat = typeStatCof[i.TypeId] || { _StatisticsInfo: {} } // 类型配置
        const statData = JSON.parse(i.Data)
        // 遍历data数据中的Data属性，按统计类型（电量、水量...）划分
        for (const j of statData.Data) {
          // 过滤掉“类型统计配置”中不存在的统计项目（主要是因为旧数据中保留旧配置）
          if (typeStat._StatisticsInfo[j.Key]) {
            const { ShowState, FilterType, Filter } = typeStat._StatisticsInfo[j.Key] // 从类型配置中获取每个数据定义的展示层级(ShowState), 过滤方案(FilterType), 过滤内容(Filter)
            j.ShowState = ShowState
            // 隐藏不在当前层级的数据
            if (j.ShowState >= showLevel) {
              // ======================= 1、划分不同统计类 =======================
              rData[j.Key] = rData[j.Key] || {
                id: j.Key,
                data: {},
                yearData: {},
                monthData: {},
                station: {},
                statName: j.Name,
                _baseUnit: '', // 基本单位
                _isShow: cof[j.Key] === undefined ? true : cof[j.Key],
                displayType: STAT_TYPE_CHECK
              }
              // ======================= 2、以最新的统计数据覆盖旧数据的部分属性 =======================
              rData[j.Key].statName = j.Name // 以最新的名称，重新覆盖统计名称属性
              rData[j.Key]._baseUnit = $mqttData.getBaseUnit(j.SUnit) // 以最新的单位，覆盖基本单位
              rData[j.Key].displayType = j.DisplayType || STAT_TYPE_CHECK // 重新覆盖区分统计类型属性
              // ======================= 2-1、在不同的统计类型划中再根据年月日进行划分 =======================
              // 在不同的统计类中，按每一天划分
              rData[j.Key].data[_date] = rData[j.Key].data[_date] || {
                Date: _date,
                Values: '0.000',
                Standard: '0.000'
              }
              // 在不同的统计类中，按每一个月划分
              rData[j.Key].monthData[_month] = rData[j.Key].monthData[_month] || {
                Date: _month,
                Values: '0.000',
                Standard: '0.000'
              }
              // 在不同的统计类中，按每一年划分
              rData[j.Key].yearData[_year] = rData[j.Key].yearData[_year] || {
                Date: _year,
                Values: '0.000',
                Standard: '0.000'
              }
              // ======================= 2-2、在不同的统计类型划中再根据站场进行划分 =======================
              // 在不同的统计类中，再按不同的站场进行划分
              rData[j.Key].station[i.ProjectId] = rData[j.Key].station[i.ProjectId] || {
                data: {},
                yearData: {},
                monthData: {},
                _deviceObj: {}
              }
              // ======================= 2-2-1、在不同的统计类型的不同站场再根据年月日进行划分 =======================
              // 在不同的统计类的不同站场中，再按每一天进行划分
              rData[j.Key].station[i.ProjectId].data[_date] = rData[j.Key].station[i.ProjectId].data[_date] || {
                Date: _date,
                Device: {},
                Values: '0.000',
                Standard: '0.000'
              }
              // 在不同的统计类的不同站场中，再按每一月进行划分
              rData[j.Key].station[i.ProjectId].monthData[_month] = rData[j.Key].station[i.ProjectId].monthData[_month] || {
                Date: _month,
                Device: {},
                Values: '0.000',
                Standard: '0.000'
              }
              // 在不同的统计类的不同站场中，再按每一年进行划分
              rData[j.Key].station[i.ProjectId].yearData[_year] = rData[j.Key].station[i.ProjectId].yearData[_year] || {
                Date: _year,
                Device: {},
                Values: '0.000',
                Standard: '0.000'
              }
              // ======================= 2-2-1-1、在不同的统计类型的不同站场的年月日中根据设备进行划分 =======================
              rData[j.Key].station[i.ProjectId].data[_date].Device[i.DeviceSn] = rData[j.Key].station[i.ProjectId].data[_date].Device[i.DeviceSn] || {
                ...j,
                Values: '0.000',
                Standard: '0.000'
              }
              rData[j.Key].station[i.ProjectId].monthData[_month].Device[i.DeviceSn] = rData[j.Key].station[i.ProjectId].monthData[_month].Device[i.DeviceSn] || {
                ...j,
                Values: '0.000',
                Standard: '0.000'
              }
              rData[j.Key].station[i.ProjectId].yearData[_year].Device[i.DeviceSn] = rData[j.Key].station[i.ProjectId].yearData[_year].Device[i.DeviceSn] || {
                ...j,
                Values: '0.000',
                Standard: '0.000'
              }

              // ======================= 3、统计数据处理 =======================
              // 最大最小值过滤
              if (FilterType === STAT_FILTER_MAX_MIN) {
                const maxMin = String(Filter).split(',')
                const _min = Number(maxMin[0]) || 0
                const _max = Number(maxMin[1]) || 0
                if (_min > _max) {
                  console.error(`FilterType=${FilterType},Filter=${Filter} had Error`)
                }
                if (j.Values > _max || j.Values < _min) {
                  // console.warn(`过滤[${i.Date}]${i.DeviceName}(${i.DeviceSn}),${j.Name}(${j.Key}),values:${j.Values}, min: ${_min}, max: ${_max} `)
                  j.Values = 0
                }
              }
              // Format 转换：部分设备上传来的数据是经过 Format 转换的（例如：放大了100倍），需要重新转换为正常的数据
              j.Values = $mqttData.outFormat({ Format: j.Format, DataType: 'string' }, j.Values)
              // 实际值单位转换：不同单位的数据进行合计时候，要转换为同一基础单位 （例如：把 m3/H 转换为 m3）
              const unitFormatObj = $mqttData.unitFormat(j.Unit, 'format')
              if (unitFormatObj && unitFormatObj.step) {
                j.Values = j.Values * unitFormatObj.step
              }
              // 标准值单位转换
              const sunitFormatObj = $mqttData.unitFormat(j.SUnit, 'format')
              if (sunitFormatObj && sunitFormatObj.step) {
                j.Standard = j.Standard * sunitFormatObj.step
              }
              // ======================= 4、数据合并 =======================
              // 过滤掉异常的数据（实际值大于标准值(标准值不能为0)100倍说明数据有误）
              if (!(j.Standard * 1) || j.Values * 1 < j.Standard * 100) {
                // console.log(i.Date, i.DeviceName, j.Key, j.Values)
                rData[j.Key].station[i.ProjectId]._deviceObj[i.DeviceSn] = { ...i } // 保存当前站场下的设备统计信息
                // ======================= 4-1、合计同一天不同设备的值 =======================
                // 累计每日实际值
                rData[j.Key].data[_date].Values = UTILS_MODULE.keepDecimal(rData[j.Key].data[_date].Values * 1 + j.Values * 1, 3, true)
                // 累计每日理论值
                rData[j.Key].data[_date].Standard = UTILS_MODULE.keepDecimal(rData[j.Key].data[_date].Standard * 1 + j.Standard * 1, 3, true)
                // 累计各站场中每日实际值
                rData[j.Key].station[i.ProjectId].data[_date].Values = UTILS_MODULE.keepDecimal(rData[j.Key].station[i.ProjectId].data[_date].Values * 1 + j.Values * 1)
                // 累计各站场中每日理论值
                rData[j.Key].station[i.ProjectId].data[_date].Standard = UTILS_MODULE.keepDecimal(rData[j.Key].station[i.ProjectId].data[_date].Standard * 1 + j.Standard * 1)
                // 保存各站场中每日的各个设备
                rData[j.Key].station[i.ProjectId].data[_date].Device[i.DeviceSn].Values = UTILS_MODULE.keepDecimal(
                  rData[j.Key].station[i.ProjectId].data[_date].Device[i.DeviceSn].Values * 1 + j.Values * 1
                )
                // ======================= 4-2、合计同一月不同设备的值 =======================
                // 累计每月实际值
                rData[j.Key].monthData[_month].Values = UTILS_MODULE.keepDecimal(rData[j.Key].monthData[_month].Values * 1 + j.Values * 1, 3, true)
                // 累计每月理论值
                rData[j.Key].monthData[_month].Standard = UTILS_MODULE.keepDecimal(rData[j.Key].monthData[_month].Standard * 1 + j.Standard * 1, 3, true)
                // 累计各站场每月实际值
                rData[j.Key].station[i.ProjectId].monthData[_month].Values = UTILS_MODULE.keepDecimal(rData[j.Key].station[i.ProjectId].monthData[_month].Values * 1 + j.Values * 1)
                // 累计各站场每月理论值
                rData[j.Key].station[i.ProjectId].monthData[_month].Standard = UTILS_MODULE.keepDecimal(
                  rData[j.Key].station[i.ProjectId].monthData[_month].Standard * 1 + j.Standard * 1
                )
                // 保存各站场每月中的各个设备
                rData[j.Key].station[i.ProjectId].monthData[_month].Device[i.DeviceSn].Values = UTILS_MODULE.keepDecimal(
                  rData[j.Key].station[i.ProjectId].monthData[_month].Device[i.DeviceSn].Values * 1 + j.Values * 1
                )
                // ======================= 4-3、合计同一年不同设备的值 =======================
                // 累计每年实际值
                rData[j.Key].yearData[_year].Values = UTILS_MODULE.keepDecimal(rData[j.Key].yearData[_year].Values * 1 + j.Values * 1, 3, true)
                // 累计每年理论值
                rData[j.Key].yearData[_year].Standard = UTILS_MODULE.keepDecimal(rData[j.Key].yearData[_year].Standard * 1 + j.Standard * 1, 3, true)
                // 累计各站场每年实际值
                rData[j.Key].station[i.ProjectId].yearData[_year].Values = UTILS_MODULE.keepDecimal(rData[j.Key].station[i.ProjectId].yearData[_year].Values * 1 + j.Values * 1)
                // 累计各站场每年理论值
                rData[j.Key].station[i.ProjectId].yearData[_year].Standard = UTILS_MODULE.keepDecimal(
                  rData[j.Key].station[i.ProjectId].yearData[_year].Standard * 1 + j.Standard * 1
                )
                // 保存各站场中每年的各个设备
                rData[j.Key].station[i.ProjectId].yearData[_year].Device[i.DeviceSn].Values = UTILS_MODULE.keepDecimal(
                  rData[j.Key].station[i.ProjectId].yearData[_year].Device[i.DeviceSn].Values * 1 + j.Values * 1
                )
                //   {
                //   ...j,
                //   Values: j.Values,
                //   Standard: j.Standard
                // }
                // if (rData[j.Key].data[_date].Values !== undefined) {
                // }
                // else {
                //   rData[j.Key].data[_date] = { Date: _date, DeviceSn: i.DeviceSn, ...j }
                //   rData[j.Key].station[i.ProjectId].data[_date] = { Date: _date, DeviceSn: i.DeviceSn, ...j }
                // }
              }
            }
          }
        }
      }
    }
    return rData
  },
  /**
   * 解析 mqtt 传递过来的数据
   * @param   {MqttDataAck} formatData   mqtt 传递过来的数据
   * @param   {string}      deviceSn     设备序列号
   * @returns {MqttDataAck}
   */
  mqttDeviceDataFormatMethod(formatData, deviceSn) {
    const data = {
      ...formatData,
      data: {
        ...formatData.data
      },
      info: formatData['info'] || {},
      error: formatData['error'] || null,
      action: formatData['action'] || '',
      uuid: formatData['uuid'] || deviceSn,
      ts: formatData['ts'] || UTILS_MODULE.mqttReceiveDateConvert(Date.now())
    }
    return data
  },
  /**
   * 对设备最新的一条数据行统计，用于计算累计值
   * @param {Array} onlieDataArray  getDeviceOnline 接口返回的数据
   * @param {Array} filterKeys      要过滤的数据定义
   */
  countDeviceOnline(onlieDataArray = [], filterKeys = []) {
    const rData = {}
    // 遍历data
    for (const onlieData of onlieDataArray) {
      const { DeviceSn } = onlieData
      // 解析 onlieData 数据中的 Data 属性
      if (UTILS_MODULE.isJsonString(onlieData.Data)) {
        const mqttDataOrg = JSON.parse(onlieData.Data) // 原始的 mqtt 数据
        const filterKeyConfigs = onlieData.List || [] // filterKeys 对应的配置
        const mqttDataFormat = UTILS_MODULE.mqttDeviceDataFormatMethod(mqttDataOrg, DeviceSn) // 格式化后的 mqtt 数据
        Object.keys(mqttDataFormat.data)
          .filter(ele => {
            return filterKeys.indexOf(ele) > -1
          })
          .forEach(key => {
            // 要统计的key的配置
            const _cof = filterKeyConfigs.find(ele => {
              return ele.DataKey === key
            })
            let _val = 0
            let _unit = ''
            if (_cof) {
              // {DataKey,DataName,DataType,DefaultValue,DisplayKey,Format,Id,Unit}
              let { Format, /** DataType, */ Unit, DefaultValue } = _cof
              const unitFormatObj = $mqttData.unitFormat(Unit, 'format')
              // Format 转换：部分设备上传来的数据是经过 Format 转换的（例如：放大了100倍），需要重新转换为正常的数据
              _val = $mqttData.outFormat({ Format: Format, DataType: 'string' }, mqttDataFormat.data[key])
              // 不同单位的数据进行合计时候，要转换为同一基础单位 （例如：把 m3/H 转换为 m3）
              if (unitFormatObj && unitFormatObj.step) {
                _val = _val * unitFormatObj.step
                DefaultValue = DefaultValue * unitFormatObj.step
              }

              // 如果默认值（即标准值）存在，则对比默认值和实际值，过滤掉异常数据（实际值大于标准值36500倍（100年的累计值）说明数据有误）
              if (DefaultValue) {
                _val = _val > $mqttData.outFormat({ Format: Format, DataType: 'string' }, DefaultValue) * 365 * 100 ? 0 : _val
              }
              _unit = $mqttData.getBaseUnit(Unit)
              // console.log(DeviceSn, Unit, _unit, mqttDataFormat.data[key], _val, DefaultValue)
            }

            if (!rData[key]) {
              rData[key] = {
                Id: key,
                StandardNum: 0,
                Num: UTILS_MODULE.keepDecimal(Number(_val)) * 1,
                Unit: _unit
              }
            } else {
              rData[key].Num = UTILS_MODULE.keepDecimal(rData[key].Num) * 1 + UTILS_MODULE.keepDecimal(Number(_val)) * 1
              rData[key].Num = UTILS_MODULE.keepDecimal(rData[key].Num) * 1
            }
          })
      }
    }

    // console.log(rData)
    return rData
  }
}

export default UTILS_MODULE
