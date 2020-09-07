<!--
 * @Author: jiapeng.Zheng
 * @Date: 2019-06-26 14:29:24
 * @LastEditors: jiapeng.Zheng
 * @LastEditTime: 2019-10-21 09:59:16
 * @Description:
 -->
<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
// export default {
//   name: 'app'
// }
@Component({})
export default class App extends Vue {}
</script>
<style lang="scss">
@import '~@assets/scss/style.scss';
</style>
