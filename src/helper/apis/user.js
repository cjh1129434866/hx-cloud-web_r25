/*
 * @Author: jiapeng.Zheng
 * @Date: 2018-04-24 14:02:19
 * @Last Modified by: jiapeng.Zheng
 * @Last Modified time: 2019-07-11 14:25:28
 * @description: 用户api
 */
import $ajax from '@helper/ajax'
import $utils from '@helper/utils'
// import store from '@store'

const serverUrl = $utils.serverUrl

export default {
  /**
   * 登录
   * @param { Account: '', Password: ''} data
   */
  login(data) {
    return $ajax.post(serverUrl('user/login'), data)
  },

  /**
   * 注册：单纯的添加用户，此时用户还未添加组织，无法登陆
   * @param { Account: '', Password: '', RealName:''} data
   */
  register(data) {
    return $ajax.post(serverUrl('user/Register'), data)
  },
  /**
   * 更新用户组织
   * @param { Account: '', GroupName:'' } data
   */
  userUpdateToken(data) {
    return $ajax.post(serverUrl('user/UserUpdateToken'), data)
  },
  /**
   * 登出:本系统后台暂无登出接口
   */
  logout() {
    return $ajax.get(serverUrl('user/logout'))
  },
  /**
   * 添加用户
   * @param { UserAccount: '', RealName: '', Password: '', PasswordAgain: '' } data
   */
  addUser({ UserAccount, RealName, Password, PasswordAgain }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, UserAccount, RealName, Password, PasswordAgain }
    return $ajax.post(serverUrl('user/AddUser'), data)
  },
  /**
   * 获取用户信息
   */
  getUser() {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token }
    return $ajax.get(serverUrl('user/GetUser'), data)
  },
  /**
   * 直接根据account和token获取用户信息（不通过cookie，登录时用）
   */
  getUserByAccountAndToken({ account, token }) {
    const data = { account, token }
    return $ajax.get(serverUrl('user/GetUser'), data)
  },
  /**
   * 获取用户角色(只有管理员角色才能操作)
   * @param {string} userId 用户标识
   */
  getUserRole(userId) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, userId }
    return $ajax.get(serverUrl('UserRole/GetUserRole'), data)
  },

  /**
   * 更新用户角色信息(只有管理员角色才能操作)
   * @param {string} userId   用户标识
   * @param {string} roleId   角色标识
   */
  addOrUpdateUserRole({ userId, roleId }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, userId, roleId }
    return $ajax.post(serverUrl('UserRole/AddOrUpdateUserRole'), data)
  },
  /**
   * 更新用户信息
   * @param {string} Id         用户标示
   * @param {string} UserName   昵称
   * @param {string} bSex       性别
   * @param {string} remark     备注
   */
  updateUser({ Id, UserName, bSex, remark }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, Id, UserName, bSex, remark }
    return $ajax.post(serverUrl('user/UpdateUser'), data)
  },
  /**
   * 修改用户密码
   * @param {string} Password       密码
   * @param {string} PasswordAgain  确认密码
   */
  changePwd({ Password, PasswordAgain }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, Password, PasswordAgain }
    return $ajax.post(serverUrl('user/ChangePassword'), data)
  },
  /**
   * 获取组织内的用户列表(管理员操作)
   * @param {string} pageNo   当前页，默认为1
   * @param {string} pageSize 页大小，默认为15
   * @param {String} Account  查询字段：用户账户
   * @param {String} UserName 查询字段：用户名称
   * @param {String} roleId   查询字段：用户角色
   * @param {String} IsAdmin  查询字段：用户是否管理员
   * @param {String} Valide   查询字段：用户状态
   */
  getUserList({ pageNo, pageSize, Account, UserName, roleId, IsAdmin, Valide }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, pageNo, pageSize, Account, UserName, roleId, IsAdmin, Valide }
    return $ajax.get(serverUrl('user/GetUserList'), data)
  },
  /**
   * 审核用户
   * @param {string} id     用户标示
   * @param {string} valid  用户状态，0表示为激活，1表示正常用户，2表示用户不可用
   */
  checkUser({ id, valid }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, id, valid }
    return $ajax.post(serverUrl('user/UserCheck'), data)
  }
}
