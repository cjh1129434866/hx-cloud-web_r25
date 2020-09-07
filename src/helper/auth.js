/*
 * @Author: jiapeng.Zheng
 * @Date: 2018-08-13 13:55:11
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-31 17:03:14
 * @Description:
 */
/*
 * 权限验证模块
 */
import Cookies from 'js-cookie'
import $utils from '@helper/utils.js'
import { COOKIE_COONFIG, SESSIONSTORAGE_USERMENU_KEY, SESSIONSTORAGE_HISTORYUTL_KEY } from '@constants/index'

export default {
  checkSession() {
    return Cookies.get('isLogin')
  },
  setSession({ Account, Token }) {
    Cookies.set('isLogin', true, COOKIE_COONFIG)
    Cookies.set('account', Account, COOKIE_COONFIG)
    Cookies.set('token', Token, COOKIE_COONFIG)
  },
  getVideoToken() {
    return Cookies.get('videoToken')
  },
  setVideoToken(videoToken) {
    Cookies.set('videoToken', videoToken, COOKIE_COONFIG)
  },
  clearSession() {
    Cookies.remove('isLogin')
    Cookies.remove('account')
    Cookies.remove('token')
    Cookies.remove('videoToken')
    $utils.removeSessionStorage(SESSIONSTORAGE_USERMENU_KEY)
    $utils.removeSessionStorage(SESSIONSTORAGE_HISTORYUTL_KEY)
  }
}
