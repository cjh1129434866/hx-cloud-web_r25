<!--
 * @Author: jiapeng.Zheng
 * @Date: 2018-12-14 17:38:06
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-31 16:47:53
 * @Description: 布局
 -->
<template>
  <div class="page-frame">
    <!-- <mqtt></mqtt> -->
    <header-component :breadcrumbData="BreadcrumbData" @toggleMenuClick="onToggleMenuClick" @headerButtonClick="onHeaderButtonClick"></header-component>
    <div class="frame-content">
      <side-nav @toggleMenuClick="onToggleMenuClick"></side-nav>
      <main @click="onHideMenuClick">
        <section class="page-module" id="page-module">
          <EasyScrollbar class="content-scrollbar" :barOption="barOption">
            <router-view></router-view>
          </EasyScrollbar>
        </section>
      </main>
    </div>
  </div>
</template>
<script>
// import store from '@store'
import SideNav from '@views/common/SideNav'
import HeaderComponent from '@views/common/Header'
// import Mqtt from '@views/common/Mqtt'
import { $mqtt, $utils, $document } from '@helper'
import { SIDENAV_STATUS } from '@constants/dictionaries'
import { BAR_OPTION } from '@constants/easyScrollbarConfig/index.js'

let __this

export default {
  name: 'Frame',

  props: {},

  data() {
    return {
      clientId: $utils.newClientId(),
      barOption: {
        ...BAR_OPTION,
        barColor: 'rgba(0, 0, 0, 0)' // 滚动条颜色
      }
    }
  },

  computed: {
    BreadcrumbData() {
      const BreadcrumbData = $utils.getDataFromJson({
        data: __this.$historyPath,
        parentKey: 'parentPath',
        parentNoddeflag: undefined,
        serachKey: 'path',
        serachData: __this.$route.fullPath
      })
      if (BreadcrumbData.length > 0) {
        // 根据 $historyPath 生成的 BreadcrumbData 重新设置 $activeMenu
        this.$store.commit('$vuexSetActiveMenu', BreadcrumbData[BreadcrumbData.length - 1])
      }
      return BreadcrumbData
    }
  },

  watch: {},

  async created() {
    __this = this
    const loadingInstance = this.$loading({ fullscreen: true })
    this.$store.commit('$vuexSetMqttIsConnect', false)
    try {
      const clinet = await this.connectMqtt()
      this.clientId = clinet.clientId
      loadingInstance.close()
    } catch (errMsg) {
      loadingInstance.close()
      __this.$notify.error({ title: '错误', message: `mqtt连接失败${errMsg}` })
    }
    // 窗口关闭时断开 mqtt 连接（待验证）
    window.onunload = () => {
      if (this.$vuexSetMqttIsConnect) {
        $mqtt.disConnects()
      }
    }
  },

  components: {
    SideNav,
    HeaderComponent
  },

  methods: {
    // 连接 mqtt
    async connectMqtt() {
      const client = await $mqtt.connect({
        clientId: this.clientId,
        onConnectionLostCallBack: responseObject => {
          console.error(responseObject)
          this.$store.commit('$vuexSetMqttIsConnect', false)
          // AMQJS0008I Socket closed.
          if (responseObject.errorCode === 8) {
            // mqtt断线重连
            this.connectMqtt()
          } else {
            __this.$notify.error({ title: '错误', message: responseObject.errorMessage })
          }
        }
      })

      this.$store.commit('$vuexSetMqttIsConnect', true)
      return client
    },
    // 导航菜单状态切换
    onToggleMenuClick() {
      const app = document.getElementById('app')
      const $sideNavStatus = $document.changeClass(app, SIDENAV_STATUS.open, SIDENAV_STATUS.close)
      this.$store.commit('$vuexSetSideNavStatus', $sideNavStatus)
    },
    // 导航菜单隐藏
    onHideMenuClick() {
      const app = document.getElementById('app')
      if (this.$sideNavStatus === SIDENAV_STATUS.open) {
        $document.removeClass(app, SIDENAV_STATUS.open)
        $document.addClass(app, SIDENAV_STATUS.close)
        this.$store.commit('$vuexSetSideNavStatus', SIDENAV_STATUS.close)
      }
    },
    // headerComponent 组件中地图按钮点击事件，目前只做了左侧地图隐藏功能
    onHeaderButtonClick(/* btnName, value */) {
      // this.mapViewIsShow = value
    }
  }
}
</script>

<style lang="scss">
@import '~@assets/scss/variables.scss';
.page-frame {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;

  .frame-content {
    flex: 1;
    display: flex;
    margin-top: $header-height;
  }

  main {
    flex: 1;
  }
}
</style>
