<!--
 * @Author       : jiapeng.Zheng
 * @Date         : 2020-03-05 08:59:37
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-18 16:06:08
 * @Description  : 通用播放器组件
 -->
<template>
  <div class="player-view">
    <!-- <div :id="playEleId" class="video-win"></div> -->
    <!-- 播放器核心（根据 playerName 加载不同的播放器核心 ） -->
    <template v-if="canInitPlayCore">
      <component
        :is="playerName"
        :playerParam="playerParam"
        ref="PlayerCore"
        class="video-win"
        @onPlayBackSuccess="onPlayBackSuccess"
        @onPlayBackError="onPlayBackError"
        @onPlayBackCancel="onPlayBackCancel"
      ></component>
      <!-- 播放器控制条 -->
      <div class="video-ctrl-btns" v-if="canControl">
        <!-- 播放/停止、回放 按钮 -->
        <div class="play-btn">
          <!-- 暂停 -->
          <span class="hover" :title="$t('stop')" v-if="isPlaying" @click="stopPlay()">
            <icon class="icons" name="video/stop"></icon>
          </span>
          <!-- 播放 -->
          <span class="hover" :title="$t('play')" v-else @click="startPlay()">
            <icon class="icons" name="video/play"></icon>
          </span>
          <!-- <span class="hover" :title="$t('pause')" @click="pausePlay(isPlay=!isPlay)">
            <icon class="icons" name="video/pause"></icon>
          </span>-->
          <!-- 回放 -->
          <span class="hover" :title="$t('playback')" @click="playBlack()">
            <icon class="icons" name="video/playback"></icon>
          </span>
        </div>
        <!-- 回放进度条 -->
        <play-back-time-line ref="timeLine" :recList="recList" :manualReq="manualReq" v-if="isShowPlayBackTimeLine" @onRecTimeChange="onRecTimeChange"></play-back-time-line>
        <!-- 全屏、高清 按钮 -->
        <div class="set-btn">
          <!-- <span class="hover" @click="HDClick(isHD = !isHD)">{{isHD?'高清':'标清'}}</span> -->
          <span class="hover" :title="videoCompStat.isFull ? $t('reduce') : $t('full')" @click="videoCompStat.isFull = !videoCompStat.isFull">
            <icon v-if="videoCompStat.isFull" class="icons" name="panel/min"></icon>
            <icon v-else class="icons" name="panel/full"></icon>
          </span>
        </div>
      </div>
    </template>
    <!-- 播放器还未初始化 -->
    <div v-else class="video-win no-actived">
      <span v-if="!playerParam">请通过左侧列表 选择/添加 摄像头</span>
      <span v-else>
        播放失败！请重新
        <span class="text-link" @click="onPlayParamsChange(playerParam)">刷新</span>
      </span>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch, Inject } from 'vue-property-decorator'
import EZUIPlayerView from '../core/EZUIPlayerView.vue'
import PlayBackTimeLine from './playBackTimeLine.vue'
import $apis from '@helper/apis'

/* eslint-disable @typescript-eslint/no-empty-interface */
interface IPlayCoreEle extends Vue {}
interface IPlayCoreEle extends IPlayCore {}

@Component({ components: { EZUIPlayerView, PlayBackTimeLine } })
export default class PlayerView extends Vue {
  @Inject() videoCompStat: VideoCompStat
  @Prop({ default: 'EZUIPlayerView' })
  playerName: string
  @Prop({
    default: null
  })
  playerParam: VideoParam

  $playCore: IPlayCoreEle = null
  canControl = false // 初始化、停止播放状态切换过程中不允许对播放器进行操作
  // isPlay: boolean = false
  isPlaying = false // 播放/停止 切换
  canInitPlayCore = false // 是否可以初始化 PlayerCore 组件
  isHD = false // 是否处于高清
  isShowPlayBackTimeLine = false // 是否显示回放进度条
  recList: Array<RecObj> = [] // 回放片段
  manualReq: ReqResObj = { success: true, msg: '' } // 手动切换是否成功

  @Watch('playerParam')
  async onPlayParamsChange(newVal) {
    if (newVal) {
      await this.getAccessToken()
      await this.startPlay()
    } else {
      this.canInitPlayCore = false // 当 playerParam 为空时，通过把 canInitPlayCore 置为false来移除 PlayerCore 组件
    }
  }
  @Watch('canInitPlayCore')
  onCanInitPlayCoreChange(flag) {
    if (flag) {
      // 初始化PlayerCore组件后保存组件的引用
      this.$nextTick(() => {
        this.$playCore = this.$refs.PlayerCore as IPlayCoreEle
      })
    } else {
      this.$nextTick(() => {
        this.$playCore = null
      })
    }
  }

  // created() {}

  // mounted() {}

  destroyed() {
    if (this.$playCore) {
      this.stopPlay()
    }
  }

  // 获取token
  async getAccessToken() {
    try {
      // 判断Token是否存在，且是否过期
      if (!(this.playerParam.AccessToken && this.playerParam.ExpireTime && this.playerParam.ExpireTime > new Date().getTime())) {
        // 异步获取Token
        const {
          Data: { AccessToken, ExpireTime }
        } = await $apis.video.getVideoToken(this.playerParam.Id, this.playerParam.DeviceSn)
        // 更新Token
        this.playerParam.AccessToken = AccessToken
        this.playerParam.ExpireTime = ExpireTime
      }
      this.canInitPlayCore = true // 只有成功获取到Token才允许初始化播放组件
    } catch (error) {
      this.canInitPlayCore = false
      this.$message.error('获取Token失败')
    }
  }

  // 重新开始播放
  async startPlay() {
    this.canControl = false
    if (await this.$playCore.startPlay()) {
      this.isPlaying = true
      this.canControl = true
    } else {
      this.isPlaying = false
      this.canControl = false
      this.$message.error('播放失败')
    }
  }

  // 停止播放
  async stopPlay() {
    this.canControl = false
    this.isShowPlayBackTimeLine = false
    if (await this.$playCore.stopPlay()) {
      this.isPlaying = false
      this.canControl = true
    } else {
      // this.isPlaying = true
      // this.canControl = true
      this.$message.error('停止失败')
    }
  }

  // // pausePlay
  // pausePlay(isPlay) {
  //   this.$playCore.pausePlay(isPlay)
  // }

  // 打开“回放参数选择”窗口
  playBlack() {
    this.canControl = false
    if (this.$playCore) {
      this.$playCore.playBlack()
    }
  }

  // 高清/标清 切换
  async HDClick(isHD) {
    if (!(await this.$playCore.HDClick(isHD))) {
      this.$message.error('切换失败')
    }
  }

  // 监听“回放进度条组件 play-back-time-line ”的onRecTimeChange事件,当手动更改进度条上的时间时会触发该事件
  async onRecTimeChange(dateTime: number) {
    // 从用户更改的时间点(dateTime)进行回放
    if (await this.$playCore.rePlay(dateTime)) {
      this.manualReq = { success: true, msg: '' }
    } else {
      this.$message.error('回放失败')
      this.manualReq = { success: false, msg: '回放失败' }
    }
  }

  /**
   * 回放成功时的回调函数
   * @param { Array<RecObj> } recList 回放的时间片段
   */
  onPlayBackSuccess(recList: Array<RecObj>) {
    this.recList = recList
    this.isPlaying = true
    this.isShowPlayBackTimeLine = true
    this.canControl = true
  }
  /**
   * 取消回放时的回调函数
   */
  onPlayBackCancel() {
    this.canControl = true
  }

  /**
   * 回放失败时的回调函数
   */
  onPlayBackError(e) {
    this.recList = []
    this.isPlaying = true
    this.isShowPlayBackTimeLine = false
    this.canControl = true
    this.$message.error(String(e))
  }
}
</script>
<style lang="scss" scoped>
@import '~@assets/scss/variables.scss';
@import '~@assets/scss/mixins.scss';
.player-view {
  position: relative;
  display: flex;
  height: 100%;
  flex-direction: column;
  .video-win {
    position: absolute;
    width: 100%;
    height: 100%;
    flex-grow: 1;
    &.no-actived {
      @include flex-box-center();
    }
  }
  .video-ctrl-btns {
    opacity: 0;
    position: absolute;
    bottom: 0;
    width: 100%;
    font-size: 25px;
    background-color: $theme-dark-cardColor;
    color: $theme-dark-fontColor;
    display: flex;
    justify-content: space-between;
    &:hover {
      opacity: 1;
    }
    .hover:hover {
      color: $theme-dark-activeFontColor;
    }
    .play-btn,
    .set-btn {
      display: flex;
      margin: 10px;
    }
    .canvas-container {
      flex-grow: 1;
    }
  }
}
</style>
