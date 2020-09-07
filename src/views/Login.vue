<!--
 * @Author: jiapeng.Zheng
 * @Date: 2019-06-26 14:29:25
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-04-01 11:26:42
 * @Description: 登录页
 -->
<template>
  <div class="login-wrap">
    <div class="login-mask"></div>
    <div class="title-wrap">
      <icon class="title-icon" name="logo/hx"></icon>
      <div class="title-name">
        <div class="title">{{ $t('projectTitle') }}</div>
        <div class="sub-title">{{ projectSubTitle }}</div>
      </div>
    </div>
    <div class="login-box">
      <el-form class="login-form" :model="account" :rules="rules" ref="validateForm">
        <el-form-item prop="Account">
          <!-- <icon name="people_fill"></icon> -->
          <el-input class="account-input" v-model="account.Account" @keydown.enter.native="onLoginClick">
            <span slot="prefix"><icon name="people_fill"></icon></span>
          </el-input>
        </el-form-item>
        <el-form-item prop="Password">
          <!-- <icon name="unlock_fill"></icon> -->
          <el-input class="password-input" v-model="account.Password" type="password" @keydown.enter.native="onLoginClick">
            <span slot="prefix"><icon name="unlock_fill"></icon></span>
          </el-input>
        </el-form-item>
        <el-form-item>
          <div class="login-error">{{ loginErrMsg }}</div>
        </el-form-item>
        <el-form-item>
          <el-button class="login-btn" :loading="isLoading" @click="onLoginClick">{{ $t('signIn') }}</el-button>
        </el-form-item>
      </el-form>
      <!-- <div class="login-bottom">
        <router-link to="/register">立即注册</router-link>
        <el-tooltip class="item" effect="dark" content="忘记密码请联系系统管理员" placement="bottom-start">
          <a href="javascript:void(0);" class="forget">忘记了密码？</a>
        </el-tooltip>
      </div> -->
    </div>
  </div>
</template>

<script>
// import { $vueRouterGenerator } from '@helper'

import { locales } from '@/locales'
export default {
  data() {
    return {
      projectSubTitle: locales.en['projectTitle'],
      loginErrMsg: '',
      messageTime: 3, // 消息显示的时间 3s
      isLoading: false,
      account: {
        Account: '', // '15817468540',
        Password: '' // 'abc'
      },
      rules: {
        Account: [
          {
            required: true,
            message: this.$t('pleaseEnter') + this.$t('accounts') + '!',
            trigger: 'change,blur'
          }
        ],
        Password: [
          {
            required: true,
            message: this.$t('pleaseEnter') + this.$t('passwords') + '!',
            trigger: 'change,blur'
          }
        ]
      }
    }
  },

  components: {},

  computed: {},

  watch: {
    'account.Account'() {
      this.loginErrMsg = ''
    },
    'account.Password'() {
      this.loginErrMsg = ''
    }
  },

  methods: {
    // 带倒计时的提示
    Ialert(messageContent, callback) {
      let messageTime = this.messageTime
      const h = this.$createElement
      this.$message.warning({
        message: h('span', {
          domProps: {
            innerHTML: `${messageContent},${messageTime}秒后自动跳转至操作页面`
          },
          ref: 'messageEle'
        }),
        duration: messageTime * 1000
      })

      let timer = setInterval(() => {
        messageTime--
        this.$refs.messageEle.innerHTML = `${messageContent},${messageTime}秒后自动跳转至操作页面`
        if (messageTime === 0) {
          typeof callback === 'function' ? callback() : void 0
          clearInterval(timer)
          timer = null
        }
      }, 1000)
    },
    onLoginClick() {
      this.$refs['validateForm'].validate(async valid => {
        if (valid) {
          const postData = this.account
          try {
            this.isLoading = true
            // 清除登录标识,主要是清除sessionStorage,防止用户在主页点击退回后重新登录时sessionStorage没有清除
            this.$auth.clearSession()
            const result = await this.$apis.user.login(postData)
            if (result.Token !== null) {
              // 保存用户的token和account到cookie
              this.$auth.setSession({ Account: postData.Account, Token: result.Token })
              // 获取用户的数据
              // let user = await this.$store.dispatch('getUser')
              // let { userInfo, $userMenu } = user
              // // 动态生成菜单
              // $vueRouterGenerator.generator($userMenu, userInfo.IsAdmin)
              // this.$router.push('/common/home')
              // document.documentElement.requestFullscreen() // 全屏

              // 不使用this.$router.push('/common/home')跳转链接是为了让整个应用重新生成,清空动态生成路由
              window.location = '/common/home'
            } else {
              this.Ialert('该用户未加入组织，请先加入或创建组织', () => {
                this.$router.push({ name: 'register', params: { account: postData.Account } })
              })
            }
          } catch (errMsg) {
            // this.$message.error(errMsg)
            this.loginErrMsg = String(errMsg)
            console.error(errMsg)
          } finally {
            this.isLoading = false
          }
        } else {
          // this.$router.push('/demo/form')
          return false
        }
      })
    }
  }
}
</script>

<style lang="scss">
@import '~@assets/scss/variables.scss';
@import '~@assets/scss/mixins.scss';
$login-box-width: 400px;
$letter-spacing: 2px;
$font-color: #ffffff;

#app .login-wrap {
  width: 100%;
  height: 100%;
  background-image: url('~@assets/images/login.jpg');
  background-repeat: no-repeat;
  background-size: cover;
  font-size: $font-medium;
  color: $font-color;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .login-mask {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.1);
  }
  .title-wrap {
    position: relative;
    display: flex;
    margin-bottom: 55px;
    .title-icon {
      font-size: 60px;
      margin-right: 35px;
    }
    .title {
      font-size: 38px;
      margin-bottom: 10px;
      letter-spacing: 5px;
      font-family: SimHei;
      font-weight: bold;
    }
    .sub-title {
      text-align: center;
      font-size: 14px;
      font-weight: bold;
      word-spacing: 7px;
    }
  }
  .login-box {
    position: relative;
    padding: $spacing-size * 3 $spacing-size * 5 $spacing-size * 4 $spacing-size * 5;
    width: 400px;
    border-radius: $radius-size;
    letter-spacing: $letter-spacing;

    .el-form-item {
      width: 100%;
      margin-bottom: 25px;
      &.is-error {
        border-color: $element-danger-color;
      }
      &:nth-last-child(1),
      &:nth-last-child(2) {
        border: none;
        margin-bottom: 0;
      }
      .el-form-item__label {
        color: $font-color;
        margin-bottom: 0;
        padding: 0;
        &::before {
          content: '';
          margin-right: 0;
          width: 0;
        }
      }
      .el-form-item__content {
        line-height: 1;
        display: flex;
        .icon {
          position: absolute;
          z-index: 1;
          font-size: 18px;
          margin: 14px 15px;
        }
        .el-input {
          background-color: rgba(#55565c, 0.8);
          line-height: 46px;
          border-radius: 46px;
          .el-input__inner {
            border: none;
            height: auto;
            padding: 0 25px 0 53px;
            background: rgba(0, 0, 0, 0);
            color: $font-color;
          }
        }
        .el-form-item__error {
          right: 0;
          left: auto;
        }
      }
    }

    .login-form {
      .password-input {
        input {
          letter-spacing: 6px;
        }
      }
      .login-error {
        color: $element-danger-color;
        height: 65px;
        width: 100%;
        letter-spacing: normal;
        text-align: center;
      }
      .login-btn {
        color: $font-color;
        background: linear-gradient(to bottom, #048ad3, #04ffe4);
        display: block;
        border: none;
        margin: 0 auto;
        font-size: $font-medium;
        font-weight: bold;
        border-radius: 40px;
        height: 40px;
        width: $login-box-width/2;
      }
    }
  }
  .login-bottom {
    padding: 20px 0 0 0;
    .forget {
      float: right;
    }
  }
}
</style>
