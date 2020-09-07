// 读取 /src/assets/scss/theme 是为了读取该文件夹下所有文件的名称，用来生成主题列表供用户选择
const files = require.context('./../../assets/scss/theme', false, /\.scss$/)

const theme = []

files.keys().forEach(key => {
  key.replace(/(^\.\/)(.*)(\.scss$)/g, (match, $1, $2 /** $3, offset, str */) => {
    theme.push($2)
  })
})

/**
 * 主题列表
 */
export const THEME_LIST = theme
/**
 * 默认的主题
 */
export const DEFAULT_THEME = 'base'
/**
 * 主题存储在用户配置中的key
 */
export const THEME_KEY = 'theme'
