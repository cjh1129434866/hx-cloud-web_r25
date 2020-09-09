<!--
 * @Author: jiapeng.Zheng
 * @Date: 2018-10-31 09:10:54
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-31 16:22:54
 * @Description: 个人信息
 -->
<template>
  <div class="module-content">
    <!-- 临时添加的关闭按钮 -->
    <i class="el-icon-close module-content-close" :title="$t('close')" @click="$vueRouterGenerator.goBackByHistoryPath($route.fullPath)"></i>
    <div class="panel panel-default user-info">
      <div class="panel-body">
        <el-card class="box-card" :loading="loading" :body-style="{ margin: '0 auto', width: '500px' }">
          <h1 class="user_info_title">{{ $t('baseinfo') }}</h1>
          <el-form class="user-info-form" label-position="left" :model="fillForm" :rules="rules" :inline="false" ref="fillForm">
            <el-row :gutter="10">
              <!-- 账号 -->
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item :label="$t('account')" prop="date1">
                  <span>{{ fillForm.account }}</span>
                </el-form-item>
              </el-col>
              <!-- 性别 -->
              <!-- <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item :label="$t('sex')" prop="bSex">
                  <span v-if="!fillForm.bSexIsEdit">{{ sexTypeDic[fillForm.bSex] }}</span>
                  <i class="el-icon-edit" v-if="!fillForm.bSexIsEdit" @click="fillForm.bSexIsEdit = true"></i>
                  <el-radio-group size="small" v-model="fillForm.bSex" v-if="fillForm.bSexIsEdit">
                    <el-radio v-for="(value, key) in sexTypeDic" :label="key" :key="key">{{ value }}</el-radio>
                  </el-radio-group>
                  <el-button type="cancel" v-if="fillForm.bSexIsEdit" @click="cancelEdit('bSex')">{{ $t('cancel') }}</el-button>
                  <el-button type="primary" v-if="fillForm.bSexIsEdit" @click="changeInfo('bSexIsEdit')">{{ $t('confirm') }}</el-button>
                </el-form-item>
              </el-col> -->
              <!-- 名称 -->
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item :label="$t('name')" prop="userName" :show-message="fillForm.UserNameIsEdit">
                  <span v-if="!fillForm.UserNameIsEdit">{{ fillForm.userName }}</span>
                  <i class="el-icon-edit" v-if="!fillForm.UserNameIsEdit" @click="fillForm.UserNameIsEdit = true"></i>
                  <el-input :placeholder="$t('name')" v-model="fillForm.userName" v-if="fillForm.UserNameIsEdit"></el-input>
                  <el-button type="cancel" v-if="fillForm.UserNameIsEdit" @click="cancelEdit('UserNameIsEdit')">{{ $t('cancel') }}</el-button>
                  <el-button type="primary" v-if="fillForm.UserNameIsEdit" @click="changeInfo('UserNameIsEdit')">{{ $t('confirm') }}</el-button>
                </el-form-item>
              </el-col>
              <!-- 手机号 -->
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item :label="$t('phone')" prop="phone" :show-message="fillForm.phoneIsEdit">
                  <span v-if="fillForm.phone && !fillForm.phoneIsEdit">{{ fillForm.phone }}</span>
                  <i class="el-icon-edit" v-if="!fillForm.phoneIsEdit" @click="fillForm.phoneIsEdit = true"></i>
                  <el-input :placeholder="$t('phone')" v-model="fillForm.phone" v-if="fillForm.phoneIsEdit"></el-input>
                  <el-button type="cancel" v-if="fillForm.phoneIsEdit" @click="cancelEdit('phoneIsEdit')">{{ $t('cancel') }}</el-button>
                  <el-button type="primary" v-if="fillForm.phoneIsEdit" @click="changeInfo('phoneIsEdit')">{{ $t('confirm') }}</el-button>
                </el-form-item>
              </el-col>
              <!-- 邮箱 -->
               <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item :label="$t('email')" prop="email" :show-message="fillForm.emailIsEdit">
                  <span v-if="fillForm.email && !fillForm.emailIsEdit">{{ fillForm.email }}</span>
                  <i class="el-icon-edit" v-if="!fillForm.emailIsEdit" @click="fillForm.emailIsEdit = true"></i>
                  <el-input :placeholder="$t('email')" v-model="fillForm.email" v-if="fillForm.emailIsEdit"></el-input>
                  <el-button type="cancel" v-if="fillForm.emailIsEdit" @click="cancelEdit('emailIsEdit')">{{ $t('cancel') }}</el-button>
                  <el-button type="primary" v-if="fillForm.emailIsEdit" @click="changeInfo('emailIsEdit')">{{ $t('confirm') }}</el-button>
                </el-form-item>
              </el-col>
              <!-- 头像 -->
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item :label="$t('avatar')" prop="picture" class="img-item">
                  <img @click="changeAvatarImg" v-if="userInfo.picture" :src="userInfo.picture" class="avatar" />
                  <i @click="changeAvatarImg" v-else class="el-icon-plus avatar-uploader-icon"></i>
                </el-form-item>
              </el-col>
              <!-- 备注 -->
             <!--  <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item :label="$t('remark')" prop="remark" :show-message="fillForm.remarkIsEdit">
                  <span v-if="!fillForm.remarkIsEdit">{{ fillForm.remark }}</span>
                  <i class="el-icon-edit" v-if="!fillForm.remarkIsEdit" @click="fillForm.remarkIsEdit = true"></i>
                  <el-input :placeholder="$t('remark')" v-model="fillForm.remark" v-if="fillForm.remarkIsEdit"></el-input>
                  <el-button type="cancel" v-if="fillForm.remarkIsEdit" @click="cancelEdit('remark')">{{ $t('cancel') }}</el-button>
                  <el-button type="primary" v-if="fillForm.remarkIsEdit" @click="changeInfo('remarkIsEdit')">{{ $t('confirm') }}</el-button>
                </el-form-item>
              </el-col> -->
            </el-row>
          </el-form>
          <h1 class="user_info_title">{{ $t('group') }}</h1>
          <el-form class="user-info-form">
            <el-row :gutter="10">
              <!-- 组织名称 -->
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item :label="$t('groupname')" prop="name">
                  <span>{{ groupInfo.name }}</span>
                </el-form-item>
              </el-col>
              <!-- 组织代号 -->
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item :label="$t('groupcode')" prop="code">
                  <span>{{ groupInfo.code }}</span>
                </el-form-item>
              </el-col>
              <!-- 组织LOGO -->
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <!-- <el-form-item :label="$t('logo')" prop="logo" class="img-item">
                  <img v-if="groupInfo.logo" :src="groupInfo.logo" class="avatar">
                  <img v-else src="~@assets/images/logo.png" alt="" style="width:66px;height66px">
                    <el-upload
                      v-if="IsAdmin"
                      class="avatar-uploader"
                      accept="image/*"
                      :data="fillForm"
                      :action="logoFilePostUrl"
                      :show-file-list="false"
                      :on-success="handleLogoSuccess"
                      :before-upload="beforeLogoUpload"
                    >
                      <i class="el-icon-plus avatar-uploader-icon"></i>
                    </el-upload>
                  <img v-else-if="groupInfo.logo" :src="groupInfo.logo" class="logo" />
                  <img v-else src="~@assets/images/logo.png" alt class="logo" />
                </el-form-item> -->
                 <el-form-item :label="$t('logo')" prop="picture" class="img-item">
                    <img @click="changeGroupLogo" v-if="groupInfo.logo" :src="groupInfo.logo" class="avatar" />
                    <i @click="changeGroupLogo" v-else class="el-icon-plus avatar-uploader-icon"></i>
                  </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <h1 class="user_info_title">{{ $t('security') }}</h1>
          <el-form class="user-info-form">
            <el-row :gutter="10">
              <!-- 登录密码 -->
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item :label="$t('loginpassword')" prop="date1">
                  <el-button type="text" @click="changePwd">{{ $t('changepassword') }}</el-button>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>
      </div>
    </div>
    <!-- 修改密码 -->
    <change-pwd-dialog v-model="isChangePwdDialogVisible" :option="{ title: $t('changepassword') }"></change-pwd-dialog>
    <!-- 修改图片 -->
    <img-cropper-dialog
      v-model="isChangeAvatarImg"
      :option="{ title: $t('upload') + $t('image') }"
      :form-data="editAvatarImgData"
      image-category="avatar"
      @upload-success="uploadAvatarSuccess"
    ></img-cropper-dialog>
    <!-- 修改group logo -->
    <img-cropper-dialog
      v-model="isChangeGroupLogo"
      :option="{ title: $t('upload') + $t('logo') }"
      :form-data="editGroupLogoData"
      image-category="logo"
      method="put"
    ></img-cropper-dialog>
  </div>
</template>
<script>
import { SEX_TYPE_DIC } from '@constants/dictionaries'
import { IMAGE_URL, UPLOAD_CONFIG } from '@constants/index'
import { $validate } from '@helper'
import { mapGetters } from 'vuex'
const phoneNumberReg = /^1[3456789]\d{9}$/
const emailReg = /^([a-zA-Z0-9_\\.\-])+@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/
// let self
export default {
  name: 'user-info',
  data() {
    const validatorEmail = (rule, value, callback) => {
      if (value && !emailReg.test(value)) {
        callback(new Error('邮箱格式不正确'))
      } else {
        callback()
      }
    }

    const validatorPhone = (rule, value, callback) => {
      if (value && !phoneNumberReg.test(value)) {
        callback(new Error('手机号格式不正确'))
      } else {
        callback()
      }
    }

    return {
      loading: true,
      imgUrlPrefix: IMAGE_URL,
      sexTypeDic: SEX_TYPE_DIC,
      isChangePwdDialogVisible: false,
      isChangeAvatarImg: false,
      logoFilePostUrl: UPLOAD_CONFIG.logoImageCof.url || UPLOAD_CONFIG.url,
      logoFileConfig: UPLOAD_CONFIG.logoImageCof,
      groupInfo: {
        code: 'hx',
        description: null,
        id: '',
        logo: '',
        name: ''
      },
      fillForm: {
        // bSex: '保密',
        bSexIsEdit: false,
        userName: '未填写',
        UserNameIsEdit: false,
        remark: '未填写',
        remarkIsEdit: false,
        emailIsEdit: false,
        phoneIsEdit: false
      },
      editAvatarImgData: { picture: '', PictureName: 'xxx' },
      fillFormBak: {},
      rules: {
        email: [
          {
            message: '请输入邮箱',
            trigger: 'blur'
          },
          {
            validator: validatorEmail
          }
        ],
        phone: [
          {
            message: '请输入手机号',
            trigger: 'blur'
          },
          {
            validator: validatorPhone
          }
        ],
        userName: [
          {
            required: true,
            message: '请输入昵称',
            trigger: 'blur'
          },
          {
            min: 2,
            max: 5,
            message: '长度在 2 到 5 个字符',
            trigger: 'blur'
          },
          {
            required: true,
            ...$validate.lengthLimt(2, 5).rule(),
            trigger: 'blur'
          }
        ],
        remark: [
          {
            required: true,
            message: '请输入备注',
            trigger: 'blur'
          },
          {
            min: 1,
            max: 100,
            message: '长度在 1 到 100 个字符',
            trigger: 'blur'
          },
          {
            required: true,
            ...$validate.lengthLimt(1, 100).rule(),
            trigger: 'blur'
          }
        ]
      },
      isChangeGroupLogo: false,
      editGroupLogoData: {picture: '', PictureName: 'xxx'}
    }
  },

  computed: {
    ...mapGetters([
      'IsAdmin'
    ])
  },

  components: {
    ChangePwdDialog: resolve => require.ensure([], () => resolve(require('@views/user/changePwd')), 'ChangePwdDialog')
  },

  created() {
    // self = this
    this.handleRefresh()
  },

  watch: {},

  methods: {
    handleRefresh() {
      this.loading = true // 设置loading
      // 获取用户信息
      this.$apis.user
        .getUser()
        .then(result => {
          // result.bSex = String(result.bSex)
          result.data.PictureName = result.data.picture
          result.data.picture = result.data.picture ? this.imgUrlPrefix + '/' + result.data.picture + `?_=${this.$_.random(0, 99999)}` : null
          result.data.picture = result.data.logo ? this.imgUrlPrefix + '/' + result.data.logo + `?_=${this.$_.random(0, 99999)}` : null
          this.fillForm = Object.assign({}, this.fillForm, result.data)
          this.fillFormBak = JSON.parse(JSON.stringify(this.fillForm))
          // 获取组织信息
          this.$apis.group
            .findByToken(result.data.groupId)
            .then(result => {
              result.data.logo = result.data.logo ? this.imgUrlPrefix + '/' + result.data.logo + `?_=${this.$_.random(0, 99999)}` : null
              this.groupInfo = result.data
            })
            .catch(errMsg => {
              this.$message.error(errMsg)
              console.error(errMsg)
              this.loading = false // 移除loading
            })
        })
        .catch(errMsg => {
          this.loading = false // 移除loading
          console.error(errMsg)
          this.$message.error(errMsg)
        })
    },
    // 头像上传回调
    uploadAvatarSuccess(img) {
      // this.$store.commit('$vuexSetUserPicture', img) // 更新vuex中的用户头像
      this.handleRefresh() // 重新获取用户信息
    },
    // 上传logo
    beforeLogoUpload(file) {
      const { type, size } = this.logoFileConfig
      const isImage = type.indexOf(file.type) > -1
      const isLtM = file.size / 1024 / 1024 < size
      if (!isImage) {
        this.$message.error(`图片类型有误，只支持${type}类型的图片，请重新选择图片!`)
      }
      if (!isLtM) {
        this.$message.error(`图片大小不能超过 ${size * 1024}KB!`)
      }
      return isImage && isLtM
    },
    // 组织logo上传回调
    handleLogoSuccess(response, file) {
      console.log(response)
      if (response) {
        if (response.Success === true) {
          this.groupInfo.logo = URL.createObjectURL(file.raw)
          this.$store.commit('$vuexSetUserGroupLogo', this.groupInfo.logo)
          this.$message.success(response.Message)
        } else {
          this.$message.error(response.Message)
        }
      } else {
        console.error(response)
      }
    },
    cancelEdit(editFlag) {
      this.fillForm[editFlag] = this.fillFormBak[editFlag]
      this.fillForm[`${editFlag}IsEdit`] = false
    },
    // 修改用户信息
    changeInfo(isEditFlag) {
      this.$refs.fillForm.validate(valid => {
        if (!valid) return
        this.loading = true
        this.$apis.user
          .updateUser(this.fillForm)
          .then(result => {
            this.$message.success(result.message)
            this.fillForm[isEditFlag] = false
            this.fillFormBak = JSON.parse(JSON.stringify(this.fillForm))
            this.userInfo.userName = this.fillForm.userName
            this.$store.dispatch('getUserInfo')
          })
          .catch(errMsg => {
            console.error(errMsg)
            this.$message.error(errMsg)
          })
          .fin(() => {
            this.loading = false // 移除loading
          })
      })
    },
    // 修改密码
    changePwd() {
      this.isChangePwdDialogVisible = true
    },
    // 修改用户头像
    changeAvatarImg() {
      this.editAvatarImgData.picture = this.fillForm.picture
      this.editAvatarImgData.PictureName = this.fillForm.PictureName
      this.editAvatarImgData.Id = this.fillForm.Id
      this.isChangeAvatarImg = true
    },
    changeGroupLogo() {
      this.isChangeGroupLogo = true
    },
  /*   uploadGroupLogoSuccess() {
      
    } */
  }
}
</script>
<style type="text/css" lang="scss">
@import '~@assets/scss/variables.scss';
$avatar-size: 60px;
$item-label-width: 4em;

.user_info_title {
  font-size: $font-medium;
  padding: $spacing-size 0;
  width: 80px;
  margin: auto;
  text-align: center;
  border-bottom: 2px solid;
}

.user-info-form {
  margin: $spacing-size * 4 0;
  .el-form-item {
    &.img-item {
      margin: 12.5px 0;
    }
    .el-form-item__label {
      padding: 0;
      width: $item-label-width;
      margin-right: 1em;
      text-align: right;
    }
    .el-form-item__label,
    .el-form-item__content {
      line-height: 40px;
    }
    .el-form-item__content {
      margin-left: $item-label-width + 1em;
    }
    .el-input {
      width: 200px;
    }
  }
  .avatar-uploader .el-upload {
    border: 1px dashed $border-grey;
    border-radius: 4px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader-icon {
    font-size: $icon-large-size;
    width: $avatar-size;
    height: $avatar-size;
    line-height: $avatar-size;
    border: 1px dashed $border-grey;
    border-radius: 50%;
    cursor: pointer;
    text-align: center;
  }
  .avatar,
  .logo {
    width: $avatar-size;
    height: $avatar-size;
    display: block;
  }
  .avatar {
    cursor: pointer;
    border-radius: 50%;
    border: 1px dashed $border-grey;
  }
}
</style>
