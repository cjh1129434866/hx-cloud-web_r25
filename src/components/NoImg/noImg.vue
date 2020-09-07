<!--
 * @Author: jiapeng.Zheng
 * @Date: 2018-12-10 09:08:40
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-31 13:51:14
 * @Description:
 -->
<template>
  <div class="no-img">
    <icon class="no-img-icon" name="panel/noImg"></icon>
    <span>
      <span class="no-img-text">{{ noImgText }}</span>
      <span v-if="isAddBtn" @click="addBtnClick">
        <icon class="click-btn" name="panel/addSquare"></icon>
      </span>
    </span>
  </div>
</template>

<script>
export default {
  name: 'no-img',
  props: {
    noImgText: {
      default() {
        return this.$t('no') + this.$t('image')
      }
    },
    isAddBtn: {
      default: false
    }
  },
  watch: {},
  computed: {},
  data() {
    return {}
  },
  filters: {},

  methods: {
    addBtnClick() {
      this.$emit('addBtnClick')
    }
  }
}
</script>
<style lang="scss">
@import '~@assets/scss/variables.scss';
.no-img {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: $font-default;
  .icon {
    margin-right: 0;
  }
  .no-img-icon {
    font-size: 80px;
    margin-bottom: $spacing-large-size;
  }
  .no-img-text {
    vertical-align: top;
    line-height: $font-medium;
  }
  .click-btn {
    font-size: $font-medium;
    margin-left: 0.5em;
  }
}
</style>
