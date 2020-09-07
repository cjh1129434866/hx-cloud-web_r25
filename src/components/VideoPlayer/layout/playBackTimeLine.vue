<!--
 * @Author       : jiapeng.Zheng
 * @Date         : 2020-03-10 09:33:35
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-13 16:14:16
 * @Description  : 回放进度条
 -->
<template>
  <div class="canvas-container" id="canvas-container" ref="timeLineWrapEle">
    <canvas id="canvas" class="time-line-body" height="48" ref="timeLineEle">该浏览器不支持canvas</canvas>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch, Emit, Inject } from 'vue-property-decorator'
import $_ from '@helper/lodash'

let _this

@Component({})
export default class PlayBackTimeLine extends Vue {
  @Inject() videoCompStat: VideoCompStat
  @Prop({
    default() {
      return []
    }
  })
  recList: Array<RecObj> // 可回放的时间段
  @Prop({
    default: {}
  })
  manualReq: ReqResObj // 手动切换成功

  timeLine = new TimeLine() // 回放进度条

  @Watch('videoCompStat.OSDTime')
  onOSDTimeChange(dateTime: number) {
    this.timeLine.run({ time: new Date(dateTime * 1000) })
  }

  // a-4、“视频重放”重放成功后会改变 manualReq 值,当 manualReq 变化后才允许操作进度条
  @Watch('manualReq')
  onManualTimeSuccess(flag: ReqResObj) {
    // if (flag.success) {
    //   this.timeLine.unReadOnly()
    // }
    console.log(flag)
    this.timeLine.unReadOnly()
  }

  @Watch('videoCompStat.isVideoListFixed')
  onIsVideoListFixedChange() {
    this.windowResizeHandle()
  }

  created() {
    _this = this
    window.addEventListener('resize', this.windowResizeHandle, false)
  }

  mounted() {
    this.init()
  }

  destroyed() {
    window.removeEventListener('resize', this.windowResizeHandle, false)
  }

  init() {
    this.resizeWidthHeight()
    this.timeLine.init({
      // id: 'canvas',
      onChange: async nowTime => {
        // a、当进度条被拖动后
        this.timeLine.readOnly() // a-1、暂时禁止操作进度条
        this.onRecTimeChange(nowTime) // a-2、触发组件上的 onRecTimeChange 事件
      }
    })
    this.timeLine.getRecord(this.recList)
  }

  resizeWidthHeight() {
    this.$nextTick(() => {
      const $timeLineWrapEle = _this.$refs.timeLineWrapEle as HTMLElement
      const $timeLineEle = _this.$refs.timeLineEle as HTMLCanvasElement
      $timeLineEle.width = $timeLineWrapEle.offsetWidth
      $timeLineEle.height = $timeLineWrapEle.offsetHeight
      this.timeLine.canvasWidth = $timeLineWrapEle.offsetWidth
    })
  }

  // window resize
  windowResizeHandle = $_.throttle(() => {
    _this.resizeWidthHeight()
  }, 500)

  // a-3、将改变后的时间传递给父组件，由父组件执行“视频回放”
  @Emit('onRecTimeChange')
  onRecTimeChange(nowTime) {
    return nowTime
  }
}
</script>
<style lang="scss" scoped>
.canvas-container {
  position: absolute;
  bottom: 48px;
  width: 100%;
}
</style>
