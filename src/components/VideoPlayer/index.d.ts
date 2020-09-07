/*
 * @Author       : jiapeng.Zheng
 * @Date         : 2020-03-05 09:12:26
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-13 16:12:11
 * @Description  : 声明文件
 */
// import Vue from 'vue'

// 摄像头参数
type VideoParam = {
  Id: number
  DeviceSn: string // 摄像头所属的设备
  SecurityCode: string // 视频加密密码，默认摄像头标签上的6位验证码，修改密码后同步新的密码，支持1-12位大小写英文字母与数字注意只有开启视频加密的时候需要填入
  VideoSn: number // 视频的序列号（ID），摄像头标签上的9位数字序列号 (videoSn)
  Channel: number // 视频的通道编号， IPC（摄像机）固定为1，NVR可能有多个通道，
  AccessToken: string // token
  ExpireTime: number // token 过期时间
  VideoName: string
}

// 初始化播放器所需的参数
type VideoInitParam = {
  id: string // 播放器canvas元素的id
  autoplay: boolean // 是否自动播放
  url: string // 通过 VideoParam 的个属性拼接成的播放链接
  accessToken: string // 权限验证用的token，7天有效
  decoderPath: string
  width: number
  height: number
  handleError: (e: any) => void
  handleSuccess: () => void
}

// 回放参数
type RecObj = {
  startTime: number
  endTime: number
}

// 播放器停止、播放、手动切换进度时的返回结果
type ReqResObj = {
  msg: string
  success: boolean
}

// 播放器组件的各个状态（用于播放器的所有子组件之间通信）
// 跨组件共用的参数必须放在这里，通过 provide/inject 调用 videoCompStat
type VideoCompStat = {
  isVideoListFixed: boolean // 播放器左侧列表是否固定
  isFull: boolean // 全屏切换
  OSDTime: number // 当前播放的时间
}

// 播放器组件暴露给父组件的方法
interface IPlayCore {
  startPlay(): Promise<boolean> // 开始播放
  stopPlay(): Promise<boolean> // 停止播放
  // pausePlay(flag: boolean): void // 暂停播放
  playBlack(): void // 回放
  HDClick(isHD: boolean): Promise<boolean> // 高清切换
  rePlay(dateTime): Promise<boolean> // 回放
}

// 播放器组件必要的属性
interface IPlayCoreCompent extends IPlayCore {
  playerParam: VideoParam // 摄像头参数
  onPlayBackSuccess(data: Array<RecObj>): Array<RecObj> // 回放成功回调
  onPlayBackError(e: Error): void // 回放失败回调
  onPlayBackCancel(): void // 取消回放回调
}
