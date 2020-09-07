/*
 * @Author: jiapeng.Zheng
 * @Date: 2018-04-24 14:02:15
 * @Last Modified by: jiapeng.Zheng
 * @Last Modified time: 2019-01-21 17:17:29
 * @description:
 */
import $ajax from '@helper/ajax'
import $utils from '@helper/utils'
// import $auth from '@helper/auth'
// import { VIDEO_CONFIG } from '@constants/index'

const serverUrl = $utils.serverUrl
const videoApiUrl = $utils.videoApiUrl

// /**
//  * 获取accessToken
//  * https://open.ys7.com/doc/zh/book/index/user.html#11-%E6%A0%B9%E6%8D%AEappkey%E5%92%8Csecret%E8%8E%B7%E5%8F%96accesstoken
//  * 注意：获取到的accessToken有效期是7天，请在即将过期或者接口报错10002时重新获取，请勿频繁调用，频繁调用将会被拉入限制黑名单。
//  */
// let getEZUIPlayerToken = async () => {
//   let videoToken = $utils.getCookie('videoToken')
//   if (!videoToken || videoToken === 'undefined') {
//     let data = VIDEO_CONFIG
//     let res = await $ajax.eZUIPlayerPost(videoApiUrl('lapp/token/get'), data)
//     videoToken = res.accessToken
//     $auth.setVideoToken(videoToken)
//   }
//   return videoToken
// }

// let testDeviceSn = '20180318010001'

export default {
  /**
   * 获取设备摄像头
   * @param {string} deviceSn 设备序列号
   */
  getDeviceVideo(deviceSn) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, deviceSn }
    return $ajax.get(serverUrl('DeviceVideo/GetDeviceVideo'), data)
  },

  /**
   * 获取摄像头Token
   * @param {number} Id 视频序列号
   * @param {string} deviceSn 视频所属设备序列号
   */
  getVideoToken(Id, deviceSn) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, Id, deviceSn }
    return $ajax.get(serverUrl('DeviceVideo/GetVideoToken'), data)
  },

  /**
   * 新增摄像头
   * @param {string} DeviceSn       设备序列号
   * @param {string} VideoName      视频名称
   * @param {number} Channel        视频通道号
   * @param {string} VideoSn        视频设备序列号
   * @param {string} SecurityCode   视频加密密码
   * @param {string} url            视频地址
   * @param {string} panelId        面板标识
   * @param {string} ApiUrl         萤石摄像头获取token的url
   * @param {string} Appkey         萤石摄像头AppKey
   * @param {string} Secret         萤石摄像头Secret
   */
  deviceVideoAdd({ DeviceSn, VideoName, Channel, VideoSn, SecurityCode, Url, panelId, ApiUrl, Appkey, Secret }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = {
      account,
      token,
      DeviceSn,
      VideoName,
      Channel,
      VideoSn,
      SecurityCode,
      Url,
      panelId,
      ApiUrl,
      Appkey,
      Secret
    }
    return $ajax.post(serverUrl('DeviceVideo/DeviceVideoAdd'), data)
  },
  /**
   * 更新摄像头
   * @param {string} deviceSn       设备序列号
   * @param {string} VideoName      视频名称
   * @param {number} Channel        视频通道号
   * @param {string} VideoSn        视频设备序列号
   * @param {string} SecurityCode   视频加密密码
   * @param {string} url            视频地址
   * @param {string} Id             视频标识
   * @param {string} ApiUrl         萤石摄像头获取token的url
   * @param {string} Appkey         萤石摄像头AppKey
   * @param {string} Secret         萤石摄像头Secret
   */
  updateDeviceVideo({ DeviceSn, VideoName, Channel, VideoSn, SecurityCode, Url, Id, ApiUrl, Appkey, Secret }) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, DeviceSn, VideoName, Channel, VideoSn, SecurityCode, Url, Id, ApiUrl, Appkey, Secret }
    return $ajax.put(serverUrl('DeviceVideo/UpdateDeviceVideo'), data)
  },
  /**
   * 删除摄像头
   * @param {string} Id       视频编号
   * @param {string} deviceSn 设备序列号
   */
  deleteDeviceVideo(Id, deviceSn) {
    const account = $utils.getCookie('account')
    const token = $utils.getCookie('token')
    const data = { account, token, deviceSn, Id }
    return $ajax.post(serverUrl('DeviceVideo/DeleteDeviceVideo'), data)
  },

  // ---------------------------- EZUIPlayer API ---------------------------------------------------

  // /**
  //  * 查询用户下指定设备的基本信息
  //  * https://open.ys7.com/doc/zh/book/index/device_select.html#12-%E8%8E%B7%E5%8F%96%E5%8D%95%E4%B8%AA%E8%AE%BE%E5%A4%87%E4%BF%A1%E6%81%AF
  //  * @param {String} deviceSerial 设备序列号
  //  */
  // async getEZUIPlayerInfo (deviceSerial) {
  //   let accessToken = await getEZUIPlayerToken()
  //   let data = { accessToken, deviceSerial }
  //   return $ajax.eZUIPlayerPost(videoApiUrl('lapp/device/info'), data)
  // },

  // /**
  //  * 根据设备验证码关闭设备视频加密开关
  //  * https://open.ys7.com/doc/zh/book/index/device_switch.html#12-%E5%85%B3%E9%97%AD%E8%AE%BE%E5%A4%87%E8%A7%86%E9%A2%91%E5%8A%A0%E5%AF%86
  //  * @param {String} deviceSerial  设备序列号
  //  * @param {String} validateCode  设备验证码，设备机身上的六位大写字母
  //  */
  // async encryptOff (deviceSerial, validateCode) {
  //   let accessToken = await getEZUIPlayerToken()
  //   let data = { accessToken, deviceSerial, validateCode }
  //   return $ajax.eZUIPlayerPost(videoApiUrl('lapp/device/encrypt/off'), data)
  // },
  // /**
  //  * 开启设备视频加密开关
  //  * https://open.ys7.com/doc/zh/book/index/device_switch.html#13-%E5%BC%80%E5%90%AF%E8%AE%BE%E5%A4%87%E8%A7%86%E9%A2%91%E5%8A%A0%E5%AF%86
  //  * @param {String} deviceSerial  设备序列号
  //  */
  // async encryptOn (deviceSerial) {
  //   let accessToken = await getEZUIPlayerToken()
  //   let data = { accessToken, deviceSerial }
  //   return $ajax.eZUIPlayerPost(videoApiUrl('lapp/device/encrypt/on'), data)
  // }

  /**
   * 根据时间获取存储文件信息
   * http://open.ys7.com/doc/zh/book/index/device_select.html
   * @param {*} param0
   * accessToken    String  访问令牌  Y
   * deviceSerial   String  设备序列号,存在英文字母的设备序列号，字母需为大写  Y
   * channelNo      int     通道号，非必选，默认为1  N
   * startTime      long    起始时间，时间格式为：1378345128000。非必选，默认为当天0点  N
   * endTime        long    结束时间，时间格式为：1378345128000。非必选，默认为当前时间  N
   * recType        int     回放源，0-系统自动选择，1-云存储，2-本地录像。非必选，默认为0  N
   */
  async getEZUIplayerRecTime({ accessToken, deviceSerial, channelNo, startTime, endTime, recType }) {
    const data = { accessToken, deviceSerial, channelNo, startTime, endTime, recType }
    return $ajax.eZUIPlayerPost(videoApiUrl('lapp/video/by/time'), data)
  }
}
