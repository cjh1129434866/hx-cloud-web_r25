import Vue from 'vue'
import VueI18n from 'vue-i18n'
import Cookies from 'js-cookie'
import eleEN from 'element-ui/lib/locale/lang/en'
import eleZH from 'element-ui/lib/locale/lang/zh-CN'

Vue.use(VueI18n)
const files = require.context('.', true, /\.js$/) // 读取当前所在文件夹（包括子文件夹）下的所有文件
const customZh: VueI18n.LocaleMessageObject = {} // 自定义的中文信息
const customEn: VueI18n.LocaleMessageObject = {} // 自定义的英文信息
const messages: VueI18n.LocaleMessages = {} // 语言环境信息
// 添加第三方翻译的语言环境信息
const addLang = (key: string, customMsg: VueI18n.LocaleMessageObject, otherMsg: Array<VueI18n.LocaleMessageObject>) => {
  messages[key] = Object.assign(customMsg, ...otherMsg)
}
// 整合当前文件下的翻译的语言环境信息
files.keys().forEach(key => {
  if (key === './index.js') return
  Object.assign(customZh, files(key).default['zh'])
  Object.assign(customEn, files(key).default['en'])
})

// 添加element-ui的翻译的语言环境信息
addLang('zh', customZh, [eleZH])
addLang('en', customEn, [eleEN])

/* 当用户未手动选择语言时（通过cookie），根据浏览器的 navigator 获取语言 */
const browserLanguage = (window.navigator.language || window.navigator['browserLanguage']).split('-')[0]
const lang = Cookies.get('lang') || (browserLanguage in messages ? browserLanguage : 'en')

export const locales = messages
export const i18n = new VueI18n({
  locale: lang, // 设置地区
  messages: messages // 设置地区信息
})
