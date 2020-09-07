/*
 * @Author: jiapeng.Zheng
 * @Date: 2019-08-12 08:49:40
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-27 16:31:47
 * @Description:
 */
// 第三方组件库引入的全局变量
import Vue from 'vue'
declare global {
  const AMap: any
  const EZUIKit: { EZUIPlayer: any } // 2.6 版本的ezuikit
  const EZUIPlayer: any // 1.4 版本以下的ezuikit
  const TimeLine: any // 播放器时间线
  // const ExcelJS: any
}
declare module 'vue/types/vue' {
  interface Vue {
    /**
     * 开启 css modules 时注入的变量
     */
    $style: any
    /**
     * src/mixins/globalMixin.js 中混入到每个组件的计算属性,用于显示当前激活的路由
     */
    $activeMenu: { parentPath: string; path: string; title: { en: string; zh: string } }
    /**
     * src/mixins/globalMixin.js 中混入到每个组件的计算属性,用于本地化
     */
    $currentLang: string
    /**
     * src/mixins/globalMixin.js 中混入到每个组件的计算属性,用于判断是否处于移动端
     */
    $isMobile: boolean
    /**
     * src/mixins/globalMixin.js 中混入到每个组件的计算属性,用于判断mqtt是否连接成功，成功时才可以订阅主题
     */
    $mqttIsConnect: boolean
    /**
     * src/mixins/globalMixin.js 中混入到每个组件的计算属性,包含通过mqtt接收到的设备的控制数据
     */
    $mqtt_device_data: any
    /**
     * src/mixins/globalMixin.js 中混入到每个组件的计算属性,包含通过mqtt接收到的设备的报警数据
     */
    $mqtt_error_data: any
    $vueRouterGenerator: any
    /**
     * src/mixins/globalMixin.js 中混入到每个组件的计算属性,当前主题下的样式
     */
    $theme: any
    /**
     * src/mixins/globalMixin.js 中混入到每个组件的计算属性,当前用户的配置信息
     */
    $userConfig: any
    /**
     * src/mixins/globalMixin.js 中混入到每个组件的计算属性, 从服务器、第三方接口获取的各种常量
     */
    $commonParam: any
  }
}
