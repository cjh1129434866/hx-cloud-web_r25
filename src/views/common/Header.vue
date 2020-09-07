<!--
 * @Author: jiapeng.Zheng
 * @Date: 2019-06-26 14:29:25
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-04-15 14:05:24
 * @Description:
 -->
<template>
  <header class="header">
    <div class="logo">
      <!-- <img v-if="this.$userGroup.Logo" :src="this.$userGroup.Logo" />
      <img v-else src="~@assets/images/logo.png" /> -->
      <icon class="logo-icon" name="logo/hx"></icon>
      <span class="title">{{ $t('projectTitle') }}</span>
      <!-- <div class="path-breadcrumb">
        <el-breadcrumb>
          <el-breadcrumb-item v-for="(item, index) of breadcrumbData" :key="index" :to="item.path">{{ item.title[$currentLang] }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div> -->
    </div>

    <!-- <a href="javascript:;" class="menu" @click="onToggleMenuClick">
      <span></span>
    </a> -->

    <!-- <div>
      <span class="header-icon-wrap"><icon name="goback"></icon></span>
      <span class="header-icon-wrap"><icon name="goforward"></icon></span>
    </div> -->

    <ul class="module-header-button">
      <!-- <li class="header-button" :title="$t('allProject')" @click="onProjectClick">
        <span class="header-icon-wrap">
          <icon name="menu/project"></icon>
        </span>
      </li>
      <li class="header-button" :title="$t('allSites')" @click="onSitesClick">
        <span class="header-icon-wrap">
          <icon name="menu/sites"></icon>
        </span>
      </li>
      <li class="header-button" :title="$t('allDevice')" @click="onDeviceClick">
        <span class="header-icon-wrap">
          <icon name="menu/device"></icon>
        </span>
      </li> -->
      <!-- 全屏(max-width > 1200px) -->
      <li class="header-button" :title="isFull ? $t('reduce') : $t('full')" @click="onFullClick">
        <span class="header-icon-wrap">
          <icon :name="isFull ? 'panel/min' : 'panel/full'"></icon>
        </span>
      </li>
      <!-- 换肤 -->
      <li :class="`${themeIsActive ? 'active' : ''}`">
        <span class="header-icon-wrap" v-popover:themePopover>
          <icon name="panel/skin"></icon>
        </span>
        <el-popover popper-class="theme-popover" ref="themePopover" placement="bottom" trigger="click" @show="themeIsActive = true" @hide="themeIsActive = false">
          <span v-for="theme in themes" :key="theme" class="theme-switch-btn" :class="[theme, { actived: $theme === theme }]" @click="onSetThemeClick(theme)">{{
            $t(`${theme}`)
          }}</span>
        </el-popover>
      </li>
      <!-- 通知(max-width > 1200px) -->
      <!-- <li class="header-button" :class="`${bellIsActive ? 'active' : ''}`" v-popover:noticePopover>
        <span :title="$t('Notice')" class="header-icon-wrap">
          <el-badge :value="noticeLn" :max="99">
            <icon name="bell"></icon>
          </el-badge>
        </span>
        <el-popover
          popper-class="notice-popover"
          ref="noticePopover"
          placement="bottom"
          width="400"
          trigger="click"
          @show="bellIsActive = true"
          @hide="bellIsActive = false"
        >
          <notice-view
            @notice-data="
              data => {
                noticeLn = data.length
              }
            "
          ></notice-view>
        </el-popover>
      </li> -->
      <!-- 首页(max-width > 1200px) -->
      <li class="header-button" :title="$t('HomePage')" @click="onHomeClick">
        <span class="header-icon-wrap">
          <icon name="home"></icon>
        </span>
      </li>
      <!-- 登录者信息下拉 -->
      <li>
        <el-dropdown @command="handleCommand" class="operate" trigger="click">
          <!-- 登录者信息 -->
          <span class="account header-icon-wrap">
            <icon v-if="!userInfo.Picture" name="account" class="iconavatar"></icon>
            <img v-else :src="userInfo.Picture" class="avatar" />
            <!-- <span class="account-info">
              {{ userInfo.UserName }}
              <br>{{ userInfo.RoleName }}
            </span> -->
          </span>
          <el-dropdown-menu slot="dropdown" class="dropmenu">
            <!-- 首页(max-width <= 1200px) -->
            <el-dropdown-item command="Home" class="dropdown-item-button">
              <icon class="icons" name="home"></icon>
              {{ $t('HomePage') }}
            </el-dropdown-item>
            <!-- 全屏(max-width <= 1200px) -->
            <el-dropdown-item command="Full" class="dropdown-item-button">
              <icon class="icons" :name="isFull ? 'panel/min' : 'panel/full'"></icon>
              {{ isFull ? $t('reduce') : $t('full') }}
            </el-dropdown-item>
            <!-- 通知(max-width <= 1200px) -->
            <!-- <el-dropdown-item command="Bell" class="dropdown-item-button">
              <icon class="icons" name="bell"></icon>
              {{ $t('Notice') }}<el-tag size="small" type="danger">{{ noticeLn }}</el-tag>
            </el-dropdown-item> -->
            <!-- 个人信息 -->
            <el-dropdown-item command="UserInfo">
              <icon class="icons" name="account"></icon>
              {{ $t('userInfo') }}
            </el-dropdown-item>
            <!-- <el-dropdown-item command="Project" class="dropdown-item-button">
              <icon class="icons" name="menu/project"></icon>
              {{ $t('allProject') }}
            </el-dropdown-item>
            <el-dropdown-item command="Sites" class="dropdown-item-button">
              <icon class="icons" name="menu/sites"></icon>
              {{ $t('allSites') }}
            </el-dropdown-item>
            <el-dropdown-item command="Device" class="dropdown-item-button">
              <icon class="icons" name="menu/device"></icon>
              {{ $t('allDevice') }}
            </el-dropdown-item> -->
            <!-- <el-dropdown-item command="Switch">
              <icon class="icons" name="switch"></icon>
              {{ $t('switchLang') }}
            </el-dropdown-item> -->
            <!-- <el-dropdown-item command="QrCode">
              <icon class="icons" name="qrcode"></icon>
              {{ $t('apk') }}
            </el-dropdown-item>
            <el-dropdown-item command="About">
              <icon class="icons" name="about"></icon>
              {{ $t('about') }}
            </el-dropdown-item>
            <el-dropdown-item divided command="Logout">
              <icon class="icons" name="logout"></icon>
              {{ $t('signOut') }}
            </el-dropdown-item>-->
            <!-- 登出 -->
            <el-dropdown-item command="Logout">
              <icon class="icons" name="logout"></icon>
              {{ $t('signOut') }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </li>
    </ul>
  </header>
</template>

<script>
import $_ from '@helper/lodash'
import { $mqtt } from '@helper'
import { NOTICE_TYPE_ALL, NOTICE_STATE_UNSOLVED } from '@constants/noticeTypeConfig'
import { THEME_LIST, THEME_KEY, DEFAULT_THEME } from '@constants/theme'
import $document from '@helper/document'
// import { APK_SERVER_CONFIG } from '@constants/index'
// import UPDATE_LOG from '@constants/store/updateLog.json'
let _this
export default {
  name: 'headers',
  props: {
    breadcrumbData: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      themes: THEME_LIST,
      themeIsActive: false,
      bellIsActive: false,
      noticeLn: 0, // 通知信息的数量
      noticeUrl: '/common/notice/list',
      homeUrl: '/common/home',
      deviceListUrl: '/common/app/device',
      sitesListUrl: '/common/app/station',
      peojectListUrl: '/common/app/project',
      loginUrl: '/login',
      userInfoUrl: '/common/user/info',
      isFull: false
    }
  },

  watch: {
    $theme(newVal, oldVal) {
      $document.addClass(document.body, newVal)
      $document.removeClass(document.body, oldVal)
    }
  },

  components: {},

  computed: {},

  created() {
    _this = this
    $document.addClass(document.body, this.$theme)
    $document.removeClass(document.body, DEFAULT_THEME)
    window.addEventListener('resize', this.checkIsFull, false)
    window.addEventListener('keydown', this.preventF11Event, false)
  },
  destroyed() {
    window.removeEventListener('resize', this.checkIsFull, false)
    window.removeEventListener('resize', this.preventF11Event, false)
  },

  methods: {
    /**
     * 检查是否全屏
     */
    checkIsFull: $_.throttle(() => {
      _this.isFull = $document.checkFullScreen()
    }, 500),
    /**
     * 阻止F11事件，使用HTML5的全屏API代替
     * @param {Event} e
     */
    preventF11Event(e) {
      e = e || window.event
      if (e.keyCode === 122) {
        e.preventDefault()
        this.isFull ? $document.exitFullScreen() : $document.fullScreen()
      }
    },

    handleCommand(item) {
      this[`on${item}Click`]()
    },

    /* ----------------------------On Click Event---------------------------- */
    onToggleMenuClick() {
      this.$emit('toggleMenuClick')
    },
    /**
     * 主题设置
     */
    onSetThemeClick(theme) {
      const $userConfig = JSON.parse(JSON.stringify(this.$userConfig))
      $userConfig[THEME_KEY] = theme
      this.$store.commit('$vuexSetUserConfig', $userConfig)
    },
    onBellClick() {
      this.$vueRouterGenerator.goToPage(`${this.noticeUrl}/${NOTICE_TYPE_ALL}/${NOTICE_STATE_UNSOLVED}`)
    },
    onFullClick() {
      if (this.isFull) {
        $document.exitFullScreen()
      } else {
        $document.fullScreen()
      }
    },
    onHomeClick() {
      this.$vueRouterGenerator.goToPage(this.homeUrl)
    },
    onDeviceClick() {
      this.$vueRouterGenerator.goToPage(this.deviceListUrl)
    },
    onSitesClick() {
      this.$vueRouterGenerator.goToPage(this.sitesListUrl)
    },
    onProjectClick() {
      this.$vueRouterGenerator.goToPage(this.peojectListUrl)
    },
    onLogoutClick() {
      // 清除登录标识
      this.$auth.clearSession()
      // 清空store
      this.$store.commit('$vuexSetUserInfo', {})
      // 返回登录页
      this.$vueRouterGenerator.goToPage(this.loginUrl)
      // 断开mqtt
      $mqtt.disConnects()
      // 该系统没有登出接口
      // this.$apis.user.logout().then(result => {
      //   this.$auth.clearSession()
      //   this.$store.commit('$vuexSetUserInfo', {})
      //   this.$router.push('/login')
      // }).catch((err) => {
      //   this.$router.push('/')
      //   this.$message.error(err.msg)
      // })
    },
    // onSwitchClick() {
    //   const targetLang = this.$i18n.locale === 'zh' ? 'en' : 'zh'
    //   this.$utils.setCookie('lang', targetLang)
    //   this.$i18n.locale = targetLang
    //   this.$store.commit('$vuexSetActiveMenu', {
    //     path: this.$route.path,
    //     title: { ...this.$store.state.$activeMenu.title }
    //   })
    // },
    onUserInfoClick() {
      this.$vueRouterGenerator.goToPage(this.userInfoUrl)
    }
    // onQrCodeClick() {
    //   const h = this.$createElement
    //   this.$alert(h('div', { style: 'text-align:center' }, [h('img', { attrs: { src: APK_SERVER_CONFIG.qrCodeUrl } }, '')]), this.$t('apk'), {
    //     confirmButtonText: this.$t('confirm'),
    //     callback: action => {}
    //   })
    // }
    // onAboutClick() {
    //   const h = this.$createElement
    //   const logWrap = []
    //   for (const logs of UPDATE_LOG) {
    //     const contentWrap = []
    //     for (const [contentIndex, content] of logs.content.entries()) {
    //       contentWrap.push(h('li', null, `${contentIndex + 1}、${content}`))
    //     }
    //     logWrap.push(h('b', null, `${logs.time} ${this.$t('projectTitle')} ${logs.version}`), h('ul', { style: 'padding-top:10px' }, contentWrap))
    //   }
    //   const wrap = h('p', { style: 'height:120px;overflow-y:auto' }, logWrap)
    //   this.$alert(wrap, this.$t('about'), {
    //     confirmButtonText: this.$t('confirm'),
    //     callback: action => {}
    //   })
    // }
  }
}
</script>

<style type="text/css" lang="scss">
@import '~@assets/scss/variables.scss';
@import '~@assets/scss/mixins.scss';

// $menu-width: $header-height + $spacing-size;

$header-left-padding: 50px;
$header-right-padding: 30px;
$header-icon-size: 20px;
$header-logo-padding: ($header-height - $header-logo-height)/2;

.header {
  position: absolute;
  z-index: $sidenav-index;
  height: $header-height;
  line-height: $header-height;
  padding: 0 30px;
  // padding: {
  //   left: $header-left-padding;
  //   right: $header-right-padding;
  // }
  width: 100%;
  min-width: 320px;
  // box-shadow: $box-shadow-header;
  font-size: $font-large;

  a {
    &:hover,
    &:focus {
      text-decoration: none;
      span {
        text-decoration: none;
      }
    }
  }
  .logo {
    height: 100%;
    float: left;
    line-height: normal;
    padding: $header-logo-padding 0;
    display: flex;
    align-items: center;
    img,
    .logo-icon {
      width: $logo-width;
      height: $header-logo-height;
      margin-right: 1em;
    }
    .title {
      letter-spacing: 1px;
      font-weight: bold;
    }
    .path-breadcrumb {
      float: left;
      padding: 0 $spacing-size;
      margin: 0 $spacing-size;
      line-height: normal;
      border-left: 1px solid $border-grey;
      .el-breadcrumb {
        // height: 100%;
        .el-breadcrumb__item {
          line-height: $header-logo-height;
        }
      }
    }
  }

  .menu {
    position: absolute;
    top: 0;
    left: 0;
    padding: $header-logo-padding $spacing-size;
    width: $header-left-padding;
    height: 100%;
  }
  ul.module-header-button {
    margin-bottom: 0;
    float: right;
    // height: $header-height;
    height: 100%;
    line-height: normal;
    li {
      float: left;
      display: flex;
      align-items: center;
      height: 100%;
      .header-icon-wrap {
        cursor: pointer;
        display: inline-block;
        padding: 0 $spacing-size;
        .icon {
          margin: 0;
          font-size: $header-icon-size;
        }
        .el-badge {
          line-height: normal;
        }
        .el-badge__content {
          border: none;
        }
      }
      .operate {
        float: right;
        position: relative;
        .account {
          .iconavatar {
            vertical-align: middle;
          }
          .avatar {
            display: inline-block;
            vertical-align: middle;
            width: $header-logo-height;
            height: $header-logo-height;
            border-radius: 50%;
          }
          .account-info {
            display: inline-block;
            vertical-align: middle;
            margin: 0 $spacing-size 0 0;
            max-width: 80px;
            @include text-overflow();
          }
        }
      }
    }
  }
}

.menu span:after,
.menu span:before {
  content: '';
  position: absolute;
  left: 0;
  top: ($header-height - $header-logo-padding * 2) * 2/5;
}

.menu span:after {
  top: ($header-height - $header-logo-padding * 2) * 4/5;
}

.menu span {
  position: relative;
  display: block;
}

.menu span,
.menu span:after,
.menu span:before {
  width: 100%;
  height: ($header-height - $header-logo-padding * 2) * 1/5;
  background-color: $white;
  transition: all 0.3s;
  -moz-transition: all 0.3s; /* Firefox 4 */
  -webkit-transition: all 0.3s; /* Safari 和 Chrome */
  -o-transition: all 0.3s; /* Opera */
  backface-visibility: hidden;
}

.sidenav-open .menu span {
  background-color: transparent;
}

.sidenav-open .menu span:before {
  transform: rotate(45deg);
  top: $spacing-size;
}

.sidenav-open .menu span:after {
  transform: rotate(-45deg);
  top: $spacing-size;
}

.notice-list {
  display: flex;
  justify-content: space-between;
  margin: 0;
  li {
    cursor: pointer;
    float: left;
    width: 31%;
    text-align: center;
    padding: $spacing-size;
    margin: 0 4px;
    border-radius: 4px;
    color: $white;
    font-size: $font-medium;
    transition: color 0.15s linear;
    .notice-num {
      margin-top: $spacing-size;
    }
    &:hover {
      opacity: 0.7;
    }
  }
}

// 头部颜色切换按钮
.el-popover.theme-popover {
  min-width: 4em;
  .theme-switch-btn {
    cursor: pointer;
    width: 2em;
    display: inline-block;
  }
}
</style>
