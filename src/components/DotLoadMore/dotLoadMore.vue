<template>
  <div @click="onClick" :class="{ loading: this.isLoading }">
    <div v-if="isLoading">{{ this.$t('loading') }}<span class="dot">...</span></div>
    <slot v-else>{{ this.$t('loadMore') }}</slot>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
@Component
export default class DotLoadMore extends Vue {
  @Prop()
  isLoading: boolean

  onClick() {
    if (!this.isLoading) {
      this.$emit('click')
    }
  }
}
</script>
<style lang="scss" scoped>
.loading:hover {
  cursor: default;
  text-decoration: none;
}
.dot {
  display: inline-block;
  height: 1em;
  line-height: 1;
  text-align: left;
  vertical-align: -0.25em;
  overflow: hidden;
}
.dot::before {
  display: block;
  content: '...\A..\A.';
  white-space: pre-wrap; /* 也可以是white-space: pre */
  animation: dot 1s infinite step-start both;
}
@keyframes dot {
  33% {
    transform: translateY(-2em);
  }
  66% {
    transform: translateY(-1em);
  }
}
</style>
