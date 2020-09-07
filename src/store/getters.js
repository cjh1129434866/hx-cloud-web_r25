import { THEME_KEY, DEFAULT_THEME } from '@constants/theme'
export default {
  IsAdmin: (state /**, getters */) => {
    return state.userInfo.IsAdmin
  },
  $theme: (state /**, getters */) => {
    return state.$userConfig[THEME_KEY] || DEFAULT_THEME
  }
}
