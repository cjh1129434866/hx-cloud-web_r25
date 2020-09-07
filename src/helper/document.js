/*
 * @Author: jiapeng.Zheng
 * @Date: 2018-12-04 09:43:05
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-24 16:04:40
 * @Description:
 */
const DOCUMENT_MODULE = {
  toggleClass(el, className) {
    if (el.classList) {
      el.classList.toggle(className)
    } else {
      const classes = el.className.split(' ')
      const existingIndex = classes.indexOf(className)

      if (existingIndex >= 0) {
        classes.splice(existingIndex, 1)
      } else {
        classes.push(className)
      }
      el.className = classes.join(' ')
    }
  },

  changeClass(el, fromClassName, toClassName) {
    const classes = el.className.split(' ')
    const existingIndex = classes.indexOf(fromClassName)
    if (existingIndex >= 0) {
      DOCUMENT_MODULE.removeClass(el, fromClassName)
      DOCUMENT_MODULE.addClass(el, toClassName)
      return toClassName
    } else {
      DOCUMENT_MODULE.addClass(el, fromClassName)
      DOCUMENT_MODULE.removeClass(el, toClassName)
      return fromClassName
    }
  },

  addClass(el, className) {
    if (el.classList) {
      el.classList.add(className)
    } else {
      el.className += ` ${className}`
    }
  },

  removeClass(el, className) {
    if (el.classList) {
      el.classList.remove(className)
    } else {
      el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ')
    }
  },

  // // 获得标签名为tagName,类名className的元素
  getClass(tagName, className) {
    if (document.getElementsByClassName) {
      // 支持这个函数
      return document.getElementsByClassName(className)
    } else {
      const tags = document.getElementsByTagName(tagName) // 获取标签
      const tagArr = [] // 用于返回类名为className的元素
      for (let i = 0; i < tags.length; i++) {
        if (tags[i].class === className) {
          tagArr[tagArr.length] = tags[i] // 保存满足条件的元素
        }
      }
      return tagArr
    }
  },

  getChildren(el, tagName) {
    const nodeList = el.childNodes
    let ary = []
    if (/MSIE(6|7|8)/.test(navigator.userAgent)) {
      for (let i = 0; i < nodeList.length; i++) {
        const curNode = nodeList[i]
        if (curNode.nodeType === 1) {
          ary[ary.length] = curNode
        }
      }
    } else {
      ary = Array.prototype.slice.call(el.children)
    }

    // 获取指定子元素
    if (typeof tagName === 'string') {
      for (let k = 0; k < ary.length; k++) {
        const curTag = ary[k]
        if (curTag.nodeName.toLowerCase() !== tagName.toLowerCase()) {
          ary.splice(k, 1)
          k--
        }
      }
    }

    return ary
  },

  getStyle(el, attr) {
    if (el.currentStyle) {
      return el.currentStyle[attr]
    } else {
      return window.getComputedStyle(el, null)[attr]
    }
  },

  setStyle(el, attr, val) {
    if (el.style) {
      el.style[attr] = val
    }
  },

  setAttr(el, attr, val) {
    el.setAttribute(attr, val)
  },

  /**
   * 事件绑定
   * @param ele   要绑定事件的元素
   * @param type    要绑定的事件
   * @param handler    绑定事件的函数
   */
  bindEvent(el, type, handler) {
    if (el.attachEvent) {
      el.attachEvent('on' + type, handler)
    } else {
      el.addEventListener(type, handler, false)
    }
  },
  /**
   * 取消事件绑定
   * @param ele   绑定事件的元素
   * @param type    绑定的事件
   * @param handler    绑定事件的函数
   */
  removeBindEvent(el, type, handler) {
    if (window.removeEventListerner) {
      // 标准浏览器
      el.removeEventListerner(type, handler, false)
    } else if (window.detachEvent) {
      // IE浏览器
      el.detachEvent('on' + type, handler)
    }
  },
  /**
   * div 文字背景生成
   * @param {Object} options 配置信息
   */
  canvasWrapText(options) {
    const canvas = document.createElement('canvas') // canvas对象
    const settings = {
      text: '请修改掉默认的配置', // 需要绘制的文本
      family: 'Microsoft Yahei', // 文本样式
      size: 14, // 文本大小
      color: '#7a8ba9', // 文本的颜色
      angle: -45, // 文本倾斜角度
      globalAlpha: 0.2, // 文本透明度
      marginTop: 100, // 文本的上间距
      marginRight: 50 // 文本的右间距
    }
    // 覆盖默认配置
    Object.assign(settings, options)
    const ctx = canvas.getContext('2d')
    const font = `${settings.size ? settings.size : 14}px '${settings.family ? settings.family : 'Microsoft Yahei'}'`
    ctx.font = font
    ctx.fillStyle = settings.color
    const fontWidth = ctx.measureText(settings.text).width
    const canvasWidth = fontWidth / Math.sqrt(2)
    canvas.width = canvasWidth + settings.marginTop
    canvas.height = canvasWidth + settings.marginRight
    // 重新设置文字属性，因为改变canvas 的高度会导致绘制的纹理被清空
    ctx.font = font
    ctx.fillStyle = settings.color
    ctx.globalAlpha = settings.globalAlpha
    ctx.translate(canvasWidth / 2, canvasWidth / 2)
    ctx.rotate((settings.angle * Math.PI) / 180)
    ctx.fillText(settings.text, -fontWidth / 2, 14)
    return canvas.toDataURL()
  },

  /**
   * 计算 Flex 布局时，在 $container 容器下子最后一行所缺少的子项目数
   * @param { Element } $container    flex 布局容器
   * @param { Element[] } $items      flex 布局项目
   * @param { number } itemMaxWidth   flex 布局项目的最小宽度
   */
  calcFlexItemLastRowMissColNum($container, $items, itemMaxWidth = 400) {
    let num = 0
    itemMaxWidth = itemMaxWidth || 400 // 防止 itemMaxWidth 参数为0
    if ($container && $items && $items.length > 0) {
      const $item = $items[0]
      const containerWidth = $container.offsetWidth
      const itemWidth = Math.min($item.offsetWidth, itemMaxWidth) // $item.offsetWidth
      const flexItemCols = parseInt(containerWidth / itemWidth) || 1 // 一行最少有一列
      const lastRowColNum = $items.length % flexItemCols || flexItemCols // 最后一行的列数

      num = flexItemCols - lastRowColNum
    }
    return num
  },
  /**
   * 全屏
   */
  fullScreen(ele) {
    // ele = ele || document
    const element = ele || document.documentElement
    const fullMethod = element.requestFullscreen || element.msRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen
    if (fullMethod) {
      fullMethod.call(element)
    } else if (typeof window.ActiveXObject !== 'undefined') {
      // for Internet Explorer
      const wscript = new ActiveXObject('WScript.Shell')
      if (wscript !== null) {
        wscript.SendKeys('{F11}')
      }
    }
  },
  /**
   * 退出全屏
   */
  exitFullScreen() {
    const exitMethod = document.exitFullscreen || document.msExitFullscreen || document.mozCancelFullScreen || document.webkitExitFullscreen
    if (exitMethod) {
      exitMethod.call(document)
    } else if (typeof window.ActiveXObject !== 'undefined') {
      // for Internet Explorer
      const wscript = new ActiveXObject('WScript.Shell')
      if (wscript !== null) {
        wscript.SendKeys('{F11}')
      }
    }
  },
  /**
   * 检查是否全屏
   * @returns {boolean}
   */
  checkFullScreen() {
    // let isFull = document.fullscreenEnabled || window.fullScreen || document.webkitIsFullScreen || document.msFullscreenEnabled
    // // to fix : false || undefined == undefined
    // if (isFull === undefined) {
    //   isFull = false
    // }

    return window.innerHeight === window.screen.height && window.innerWidth === window.screen.width
  }
}

export default DOCUMENT_MODULE
