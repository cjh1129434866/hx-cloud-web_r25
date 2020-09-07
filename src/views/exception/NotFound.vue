<!--
 * @Author: jiapeng.Zheng
 * @Date: 2018-08-13 13:55:11
 * @LastEditors: jiapeng.Zheng
 * @LastEditTime: 2019-08-08 16:47:45
 * @Description: 404
 -->
<template>
  <div class="page-error">
    <div class="box">
      <div class="pic">
        <img v-if="$theme === 'dark'" src="~@assets/images/black/404.png" alt="404" />
        <img v-else src="~@assets/images/base/404.png" alt="404" />
      </div>
      <div class="info">
        {{ $t('NotFoundMsg') }}
      </div>
      <div class="btns">
        <el-button class="btn go-back-btn" @click.native="back">{{ $t('GoHomePage') }}</el-button>
        <el-button class="btn refresh-btn" @click.native="refresh">{{ $t('RefreshPage') }}</el-button>
      </div>
    </div>
  </div>
</template>
<script>
import $document from '@helper/document'
export default {
  name: 'not-found',
  methods: {
    back() {
      this.$router.replace('/common/home')
    },
    refresh() {
      this.$router.go(0)
    }
  },
  created() {
    $document.addClass(document.body, this.$theme)
  }
}
</script>
<style lang="scss">
@import '~@assets/scss/variables.scss';

.page-error {
  width: 100%;
  height: 100%;
  overflow: auto;
  text-align: center;
  font-weight: 300;
  .box {
    margin: auto;
    padding-top: 85px;
    padding-bottom: 76px;
    .pic {
      margin-bottom: 50px;
    }
    .info {
      font-size: 30px;
      margin-bottom: 75px;
    }
    .btns {
      .btn {
        font-weight: 300;
        width: 210px;
        height: 60px;
        border-radius: 60px;
        font-size: 26px;
        border-color: $theme-base-activeFontColor;
        &:hover {
          border-color: lighten($theme-base-activeFontColor, 10%);
        }
        &:first-child {
          margin-right: 100px;
        }
        &:last-child {
          margin-left: 0;
        }
        &.go-back-btn {
          color: #333333;
          &:hover {
            color: lighten($theme-base-activeFontColor, 10%);
          }
        }
        &.refresh-btn {
          background-color: $theme-base-activeFontColor;
          box-shadow: -2px 2px 3px rgba($theme-base-activeFontColor, 0.65);
          color: #ffffff;
          &:hover {
            background-color: lighten($theme-base-activeFontColor, 10%); // rgba($theme-base-activeFontColor, 0.65);
            // border: none;
          }
        }
      }
    }
  }
}
</style>
