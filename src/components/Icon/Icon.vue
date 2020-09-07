<!--
 * @Author: jiapeng.Zheng
 * @Date: 2018-08-13 13:55:11
 * @LastEditors: jiapeng.Zheng
 * @LastEditTime: 2019-08-12 13:41:48
 * @Description:
 -->
<template>
  <svg class="icon" :class="`icon${name}`">
    <template v-if="linearGradient.id">
      <defs xmlns="http://www.w3.org/2000/svg">
        <linearGradient
          :id="linearGradient.id"
          :x1="direction[linearGradient.direction][0]"
          :y1="direction[linearGradient.direction][1]"
          :x2="direction[linearGradient.direction][2]"
          :y2="direction[linearGradient.direction][3]"
        >
          <stop offset="0%" :style="`stop-color:${linearGradient.startColor};stop-opacity:1`" />
          <stop offset="100%" :style="`stop-color:${linearGradient.stopColor};stop-opacity:1`" />
        </linearGradient>
      </defs>
      <use v-bind:xlink:href="Icons[name]" :style="`fill:url(#${linearGradient.id})`"></use>
    </template>
    <use v-else v-bind:xlink:href="Icons[name]"></use>
  </svg>
</template>

<script>
import Icons from '@assets/icons'

export default {
  name: 'svg-icon',
  props: {
    name: {
      type: String,
      required: true,
      default: 'tips',
      validator(val) {
        return Icons[val]
      }
    },
    linearGradient: {
      type: Object,
      default() {
        return {
          id: '',
          direction: 'toLeft',
          startColor: '',
          stopColor: ''
        }
      }
    }
  },
  data() {
    return {
      Icons: Icons,
      // linearGradient [x1,y1,x2,y2]
      direction: {
        toRight: ['0%', '0%', '100%', '0%'],
        toLeft: ['100%', '0%', '0%', '0%'],
        toBottom: ['0%', '0%', '0%', '100%'],
        toTop: ['0%', '100%', '0%', '0%']
      }
    }
  }
}
</script>
