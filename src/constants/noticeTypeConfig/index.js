/**
 * 报警类型：所有
 */
export const NOTICE_TYPE_ALL = '0'
/**
 * 报警状态：所有
 */
export const NOTICE_STATE_ALL = '0'
/**
 * 报警状态：未处理
 */
export const NOTICE_STATE_UNSOLVED = '1'
/**
 * 报警状态：已处理
 */
export const NOTICE_STATE_SOLVED = '2'
// 消息类型配置
export const NOTICE_TYPE_CONFIG = {
  all: { sort: 1, iconName: 'bell', class: 'success', color: '#1d8ce0', nameTag: 'all' },
  info: { sort: 2, iconName: 'notice/notice', class: 'info', color: '#20a0ff', nameTag: 'notice' },
  warning: { sort: 3, iconName: 'notice/alert', class: 'warning', color: '#f7ba2a', nameTag: 'alert' },
  danger: { sort: 4, iconName: 'notice/malfunction', class: 'danger', color: '#ff4949', nameTag: 'malfunction' }
}
