<!--
 * @Author: jiapeng.Zheng
 * @Date: 2019-10-11 13:58:43
 * @LastEditors: jiapeng.Zheng
 * @LastEditTime: 2019-10-12 15:00:34
 * @Description: 波浪动画
 -->
<template>
  <div ref="canvasWaves" class="canvas-waves" @mouseenter="onMouseenter" @mouseleave="onMouseleave">
    <canvas ref="wave"></canvas>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

type WaveNode = Array<number>

type Wave = {
  color: string | CanvasGradient
  nodes: Array<WaveNode>
}

type LinearGradientDirection = 'toRight' | 'toLeft' | 'toTop' | 'toBottom'

type WaveProp = {
  colorDirection: LinearGradientDirection
  startColor: string
  stopColor: string
}

@Component({})
export default class CanvasWaves extends Vue {
  @Prop({ default: 0 })
  width: number
  @Prop({ default: 63 })
  height: number
  @Prop({ default: 2 })
  waveNodeNumber: number // 构成一个波形所需的辅助点，点越多波峰（波谷）越多
  @Prop({
    default() {
      return [{ startColor: '#04ffe4', stopColor: '#048ad3', colorDirection: 'toRight' }]
    }
  })
  waveProp: Array<WaveProp> // 波形配置数组：线性渐变开始颜色(startColor)，线性渐变结束颜色(stopColor)，线性渐变方向(toRight)
  @Prop({ default: false })
  hasAssistLine: boolean // 是否生成辅助线

  cvs: HTMLCanvasElement = null
  ctx: CanvasRenderingContext2D = null
  waves: Array<Wave> = []
  isStart = false

  mounted() {
    this.cvs = this.$refs.wave as HTMLCanvasElement
    this.ctx = this.cvs.getContext('2d')

    if (this.height) {
      this.cvs.height = this.height
    }
    if (this.width) {
      this.cvs.width = this.width
    }
    // 根据 waveProp 和 waveNodeNumber 生成绘制波形所需的参数
    for (let i = 0; i < this.waveProp.length; i++) {
      this.waves.push(this.genWaveData(this.waveProp[i], this.waveNodeNumber))
    }
    // 开始绘制波形
    this.start()
  }

  /**
   * 生成canvas绘制波形所需的参数
   * @param { WaveProp }  waveProp   每个波形配置
   * @param { number }    nodeNum    每个波形包含的辅助点
   */
  genWaveData(waveProp: WaveProp, nodeNum: number) {
    const wave: Wave = {
      color: this.genColor(waveProp), // 生成颜色
      nodes: []
    }
    // 每两个辅助点绘制出一个波峰
    for (let i = 0; i <= nodeNum + 2; i++) {
      // 每个辅助点由4个值构成，即x轴的坐标、y轴的坐标、随机数、变化速度
      // 其中x轴平分整个 canvas 的宽度，同时在 canvas 左右范围外新增两个用于使图形闭合的点，具体作用看 drawWave
      const node: WaveNode = [((i - 1) * this.cvs.width) / nodeNum, 0, Math.random() * 200, 1] // this.speed * plusOrMinus
      wave.nodes.push(node)
    }
    return wave
  }

  /**
   * 根据 waveProp 生成对应的颜色（支持上下左右四个方向的线性渐变）
   * @param { WaveProp }  waveProp   每个波形配置
   */
  genColor({ startColor = '#04ffe4', stopColor = '#048ad3', colorDirection = 'toRight' } = {}) {
    const colorDirectionMatrix = {
      toRight: [0, 0, this.cvs.width, 0],
      toLeft: [this.cvs.width, 0, 0, 0],
      toTop: [0, this.cvs.height, 0, 0],
      toBottom: [0, 0, 0, this.cvs.height]
    }
    const matrix = colorDirectionMatrix[colorDirection] || colorDirectionMatrix.toRight
    const grd = this.ctx.createLinearGradient(matrix[0], matrix[1], matrix[2], matrix[3])
    grd.addColorStop(0, startColor)
    grd.addColorStop(1, stopColor)
    return grd
  }

  /**
   * 开始绘制
   */
  start() {
    // 使整个 canvas 的颜色与当前的背景一致
    const fill = window.getComputedStyle(this.$refs.canvasWaves as Element, null).getPropertyValue('background-color')
    this.ctx.fillStyle = fill
    this.ctx.globalCompositeOperation = 'source-over'
    this.ctx.fillRect(0, 0, this.cvs.width, this.cvs.height)
    // 开始生成波形
    this.ctx.globalCompositeOperation = 'screen'
    for (let i = 0; i < this.waves.length; i++) {
      for (let j = 0; j < this.waves[i].nodes.length; j++) {
        // 重新计算波形的高度
        this.bounce(this.waves[i].nodes[j])
      }
      // 绘制波形
      this.drawWave(this.waves[i])
      // 绘制辅助线和辅助点
      if (this.hasAssistLine) {
        this.draAssistLine(this.waves[i].nodes)
        this.draAssistNode(this.waves[i].nodes)
      }
    }
    this.ctx.globalCompositeOperation = 'hue'
    this.ctx.fillStyle = fill
    // 开启动画
    if (this.isStart) {
      requestAnimationFrame(this.start)
    }
  }

  /**
   * 重新计算波形波峰(波谷)的高度
   * @param { WaveNode } 每个波形的单个辅助点
   */
  bounce(node: WaveNode) {
    // 生成y轴，确保波形的高度不超出 canvas
    node[1] = (this.cvs.height / 2) * Math.sin(node[2] / 20) + this.cvs.height / 2
    // 改变随机数
    node[2] = node[2] + node[3]
  }

  /**
   * 绘制波形
   * @param { Wave } 每个波形的配置
   */
  drawWave(obj: Wave) {
    // 计算两个坐标的中间坐标
    const diff = function(a, b) {
      return (b - a) / 2 + a
    }
    this.ctx.fillStyle = obj.color
    this.ctx.beginPath()
    // 第一个点（canvas左侧范围外）与canvas左下角构成直线
    this.ctx.moveTo(0, this.cvs.height)
    this.ctx.lineTo(obj.nodes[0][0], obj.nodes[0][1])
    for (let i = 0; i < obj.nodes.length; i++) {
      if (obj.nodes[i + 1]) {
        // 使用二次贝塞尔曲线在canvas内绘制波形
        this.ctx.quadraticCurveTo(obj.nodes[i][0], obj.nodes[i][1], diff(obj.nodes[i][0], obj.nodes[i + 1][0]), diff(obj.nodes[i][1], obj.nodes[i + 1][1]))
      } else {
        // 最后一个点（canvas右侧范围外）与canvas右下角构成直线
        this.ctx.lineTo(obj.nodes[i][0], obj.nodes[i][1])
        this.ctx.lineTo(this.cvs.width, this.cvs.height)
      }
    }
    // 路径闭合，由于上述两个canvas范围外的点与canvas的左下角和右下角相连，确保了路径闭合时图形下方一直是一直线
    // 防止波形变化时，图形下方出现空白
    this.ctx.closePath()
    this.ctx.fill()
  }

  /**
   * 绘制波形的辅助线
   * @param { Array<WaveNode> } 每个波形的所有辅助点
   */
  draAssistLine(nodes: Array<WaveNode>) {
    this.ctx.strokeStyle = '#888'
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i + 1]) {
        this.ctx.lineTo(nodes[i + 1][0], nodes[i + 1][1])
      }
    }
    this.ctx.stroke()
  }
  /**
   * 绘制波形的辅助点
   * @param { Array<WaveNode> } 每个波形的所有辅助点
   */
  draAssistNode(nodes: Array<WaveNode>) {
    this.ctx.strokeStyle = '#888'
    for (let i = 0; i < nodes.length; i++) {
      this.ctx.beginPath()
      this.ctx.arc(nodes[i][0], nodes[i][1], 4, 0, 2 * Math.PI)
      this.ctx.closePath()
      this.ctx.stroke()
    }
  }

  onMouseenter() {
    this.isStart = true
    this.start()
  }

  onMouseleave() {
    this.isStart = false
  }
}
</script>
<style lang="scss" scoped>
.canvas-waves {
  position: relative;
  canvas {
    position: absolute;
    bottom: 0;
    max-width: 100%;
    max-height: 100%;
  }
}
</style>
