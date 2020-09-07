<!--
 * @Author       : jiapeng.Zheng
 * @Date         : 2020-03-03 12:39:36
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-31 10:23:50
 * @Description  : 萤石摄像头播放器
 -->
<template>
  <div>
    <div :id="playEleId" ref="playEle" class="ezui-player"></div>
    <el-dialog :visible="isPlayBlackClick" width="20%" class="edit-dialog playback-dialog" :close-on-click-modal="false" :modal-append-to-body="false" :show-close="false">
      <span slot="title" class="el-dialog__title">选择回放时间和类型</span>
      <el-form>
        <div class="form-group">
          <el-form-item label="回放类型">
            <el-select v-model="playback" :clearable="false">
              <el-option v-for="(item, index) in playBackList" :key="index" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="开始时间">
            <el-date-picker v-model="begin" type="datetime" :clearable="false" :picker-options="beginPickerOptions" placeholder="选择日期时间"></el-date-picker>
          </el-form-item>
          <el-form-item label="结束时间">
            <el-date-picker v-model="end" type="datetime" :clearable="false" :picker-options="endPickerOptions" placeholder="选择日期时间"></el-date-picker>
          </el-form-item>
        </div>
      </el-form>
      <span slot="footer">
        <el-button type="cancel" @click="onPlayBackCancel">{{ $t('cancel') }}</el-button>
        <el-button type="primary" @click="startPlayBlack">{{ $t('confirm') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Emit, Watch, Inject } from 'vue-property-decorator'

import { SEARCH_DATE_RANGE, SYS_CONFIG } from '@constants/index'
import $_ from '@helper/lodash'
import $utils from '@helper/utils'
import $document from '@helper/document'
import $apis from '@helper/apis'

let _this: EZUIPlayerView

@Component
export default class EZUIPlayerView extends Vue implements IPlayCoreCompent {
  @Inject() videoCompStat: VideoCompStat
  @Prop({
    default() {
      return {}
    }
  })
  playerParam: VideoParam

  protocol = 'ezopen://' // 协议头，固定为ezopen://格式
  domain = 'open.ys7.com' // 域名
  playback = '' // 回放源: 本地存储回放（缺省值）、云存储回放（cloud）
  begin = $utils.getDateRange({ rangeNumber: 0, format: 'YYYY-MM-DD 00:00:00' }).Begin // 回放开始的时间
  end = $utils.getDateRange({ rangeNumber: 1, format: 'YYYY-MM-DD 23:59:59' }).End // 回放结束的时间
  beginPickerOptions = {
    disabledDate(time) {
      const dateDiff = $utils.dateCompare(_this.end, time)
      return !(dateDiff >= 0 && dateDiff < SEARCH_DATE_RANGE)
    }
  }
  endPickerOptions = {
    disabledDate(time) {
      const dateDiff = $utils.dateCompare(time, _this.begin)
      return !(dateDiff >= 0 && dateDiff < SEARCH_DATE_RANGE)
    }
  }
  playBackList = [
    { id: '', name: 'SD卡/NVR' },
    { id: '.cloud', name: '云存储' }
  ]
  isPlayBlackClick = false
  playEleId = 'ezopen-playWind' // 播放器元素标识
  decoder = null
  playingTimer = null // 播放进行时的定时器

  @Watch('videoCompStat.isVideoListFixed')
  onIsVideoListFixedChange() {
    this.windowResizeHandle()
  }

  created() {
    _this = this
    window.addEventListener('resize', this.windowResizeHandle, false)
  }

  mounted() {
    // this.startPlay()
  }

  destroyed() {
    window.removeEventListener('resize', this.windowResizeHandle, false)
    this.clearInitPlayingTimer()
    this.stopPlay()
  }

  // 播放定时器,每隔一秒自动执行一次（主要用来获取当前播放的时间）
  initPlayingTimer() {
    if (!this.playingTimer) {
      this.playingTimer = setInterval(function() {
        const getOSDTimePromise = _this.decoder.getOSDTime()
        getOSDTimePromise
          .then(function(v) {
            _this.videoCompStat.OSDTime = v
          })
          .catch(function(e) {
            console.log(e)
            // 当 e === -1时，说明播放结束
            if (e === -1) {
              _this.clearInitPlayingTimer()
            }
          })
      }, 1000)
    }
  }
  // 清除播放定时器
  clearInitPlayingTimer() {
    if (this.playingTimer) {
      clearInterval(this.playingTimer)
      this.playingTimer = null
    }
  }

  // 动态获取父级元素的宽度和高度
  getWidthHeight() {
    const $playEle = this.$parent.$el as HTMLElement
    console.log($playEle.offsetWidth, $document.getStyle($playEle, 'width'))
    return {
      h: parseFloat($document.getStyle($playEle, 'height')),
      w: parseFloat($document.getStyle($playEle, 'width'))
    }
  }

  // window resize
  windowResizeHandle = $_.throttle(() => {
    setTimeout(() => {
      const { w, h } = this.getWidthHeight()
      _this.decoder.reSize(w, h)
    })
    // this.$nextTick(() => {
    //   let { w, h } = this.getWidthHeight()
    //   _this.decoder.reSize(w, h)
    // })
  }, 500)

  // 获取播放参数
  getInitParams({ isPlayBlack = false, definition = '', playback = '', queryObj = {} } = {}): VideoInitParam {
    // EZOPEN协议 http://open.ys7.com/doc/zh/readme/ezopen.html
    let videoUrl = `${this.protocol}${this.playerParam.SecurityCode}@${this.domain}/${this.playerParam.VideoSn}/${this.playerParam.Channel}`
    if (isPlayBlack) {
      // 回放url：ezopen://[验证码@]域名/序列号/通道号[.回放源].rec[?参数1=值&参数2=值]
      videoUrl += `${playback}.rec`
    } else {
      // 预览url：ezopen://[验证码@]域名/序列号/通道号[.清晰度].live[?参数1=值&参数2=值]
      videoUrl += `${definition}.live`
    }
    videoUrl = $utils.queryString(videoUrl, queryObj)
    // 根据父级容器重置播放器的宽高
    const { w, h } = this.getWidthHeight()

    return {
      id: this.playEleId,
      autoplay: true,
      url: videoUrl,
      accessToken: this.playerParam.AccessToken,
      decoderPath: SYS_CONFIG.EzuikitPath, // '/js/ezuikit26',
      width: w,
      height: h,
      handleError: null,
      handleSuccess: null
    }
  }

  // 根据播放参数初始化播放器
  _initVideo(opt: VideoInitParam) {
    this.clearInitPlayingTimer()
    return new Promise<boolean>((resolve, reject) => {
      const param = opt || this.getInitParams()
      param.handleSuccess = () => {
        console.log('[_initVideo] 初始化播放器成功')
        this.initPlayingTimer()
        resolve()
      }
      param.handleError = e => {
        console.log('[_initVideo] 初始化播放器失败', e)
        reject(e)
      }
      console.log('[_initVideo] 开始初始化播放器')
      this.$nextTick(() => {
        this.decoder = new EZUIKit.EZUIPlayer(param)
      })
    })
  }

  // 根据播放参数初始化播放器
  async initVideo(opt?: VideoInitParam) {
    try {
      await this._initVideo(opt)
      return true
    } catch (error) {
      return false
    }
  }

  // 开始播放（必须存在，父组件 playerView 会直接调用该方法）
  async startPlay() {
    try {
      console.log('[startPlay] 开始播放')
      await this.initVideo()
      console.log('[startPlay] 播放成功')
      return true
    } catch (error) {
      console.log('[startPlay] 播放失败', error)
      return false
    }
  }

  // 停止播放（必须存在，父组件 playerView 会直接调用该方法）
  async stopPlay() {
    this.clearInitPlayingTimer()
    try {
      console.log('[stopPlay] 停止播放')
      await this.decoder.stop()
      console.log('[stopPlay] 停止播放成功')
      return true
    } catch (error) {
      console.log('[stopPlay] 停止播放失败', error)
      return false
    }
  }

  // // 暂停播放
  // async pausePlay(v) {
  //   if (v) {
  //     this.decoder.pause()
  //   } else {
  //     this.decoder.play()
  //   }
  // }

  // 回放（必须存在，父组件 playerView 会直接调用该方法）
  playBlack() {
    this.isPlayBlackClick = true
  }

  // “回放参数选择”窗口中的确定事件，根据用户选择的回放类型、回放开始、结束时间进行回放
  async startPlayBlack() {
    console.log('[startPlayBlack] 开始回放')
    let recTimes: Array<RecObj> = []
    this.isPlayBlackClick = false
    try {
      const queryObj = {
        begin: $utils.dateConvert(this.begin, 'YYYYMMDDHHmmss'),
        end: $utils.dateConvert(this.end, 'YYYYMMDDHHmmss')
      }
      console.log('[startPlayBlack] 获取回放片段')
      const data: Array<RecObj> = await $apis.video.getEZUIplayerRecTime({
        accessToken: this.playerParam.AccessToken,
        deviceSerial: this.playerParam.VideoSn,
        channelNo: this.playerParam.Channel,
        startTime: new Date(this.begin).getTime(),
        endTime: new Date(this.end).getTime(),
        recType: this.playback ? 1 : 2 // 回放源，1-云存储，2-本地录像
      })
      if (data && data.length) {
        console.log('[startPlayBlack] 获取回放片段成功')
        // 先停止播放再重新初始化
        if (await this.stopPlay()) {
          const initParams = this.getInitParams({ isPlayBlack: true, playback: this.playback, queryObj: queryObj })
          if (await this.initVideo(initParams)) {
            recTimes = data
          }
        }
        console.log('[startPlayBlack] 回放成功')
        this.onPlayBackSuccess(recTimes)
      } else {
        this.onPlayBackError(new Error('回放失败,未找到录像片段'))
        console.log('[startPlayBlack] 获取回放片段失败:未找到录像片段')
      }
      // return recTimes
    } catch (error) {
      console.log('[startPlayBlack] 获取回放片段失败', error)
      this.onPlayBackError(error)
    }
  }

  // 只有预览情况下才支持高清播放，回放时暂不支持高清回放
  async HDClick(isHD: boolean) {
    console.log('[HDClick] 清晰度切换')
    let _isSuccess = false
    // 先停止播放
    if (await this.stopPlay()) {
      // 播放停止成功后，根据用户选择的清晰度等参数重新播放
      const initParams = this.getInitParams({ definition: isHD ? '.hd' : '' })
      _isSuccess = await this.initVideo(initParams)
    }
    console.log(`[HDClick] 清晰度切换${_isSuccess ? '成功' : '失败'}`)
    return _isSuccess
  }

  // 从固定的时间进行回放
  async rePlay(dateTime) {
    console.log(`[rePlay] 从 ${dateTime} 进行回放`)
    let _isSuccess = false
    const queryObj = {
      begin: $utils.dateConvert(dateTime, 'YYYYMMDDHHmmss')
    }
    const initParams = this.getInitParams({ isPlayBlack: true, playback: this.playback, queryObj: queryObj })
    if (this.stopPlay()) {
      _isSuccess = await this.initVideo(initParams)
    }
    console.log(`[rePlay] 从 ${dateTime} 进行回放${_isSuccess ? '成功' : '失败'}`)
    return _isSuccess
  }

  @Emit('onPlayBackSuccess')
  onPlayBackSuccess(data: Array<RecObj>) {
    return data
  }

  @Emit('onPlayBackError')
  onPlayBackError(e: Error) {
    return e
  }

  @Emit('onPlayBackCancel')
  onPlayBackCancel() {
    this.isPlayBlackClick = false
  }
}
</script>
<style lang="scss" scoped>
.ezui-player {
  width: 100;
  height: 100%;
}
.playback-dialog {
  .el-date-editor {
    width: 100%;
  }
}
</style>
