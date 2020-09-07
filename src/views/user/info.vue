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
                  <span>{{ fillForm.Account }}</span>
                </el-form-item>
              </el-col>
              <!-- 性别 -->
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item :label="$t('sex')" prop="bSex">
                  <span v-if="!fillForm.bSexIsEdit">{{ sexTypeDic[fillForm.bSex] }}</span>
                  <i class="el-icon-edit" v-if="!fillForm.bSexIsEdit" @click="fillForm.bSexIsEdit = true"></i>
                  <el-radio-group size="small" v-model="fillForm.bSex" v-if="fillForm.bSexIsEdit">
                    <el-radio v-for="(value, key) in sexTypeDic" :label="key" :key="key">{{ value }}</el-radio>
                  </el-radio-group>
                  <el-button type="cancel" v-if="fillForm.bSexIsEdit" @click="cancelEdit('bSex')">{{ $t('cancel') }}</el-button>
                  <el-button type="primary" v-if="fillForm.bSexIsEdit" @click="changeInfo('bSexIsEdit')">{{ $t('confirm') }}</el-button>
                </el-form-item>
              </el-col>
              <!-- 头像 -->
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item :label="$t('avatar')" prop="Picture" class="img-item">
                  <img @click="changeAvatarImg" v-if="userInfo.Picture" :src="userInfo.Picture" class="avatar" />
                  <i @click="changeAvatarImg" v-else class="el-icon-plus avatar-uploader-icon"></i>
                </el-form-item>
              </el-col>
              <!-- 名称 -->
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item :label="$t('name')" prop="UserName" :show-message="fillForm.UserNameIsEdit">
                  <span v-if="!fillForm.UserNameIsEdit">{{ fillForm.UserName }}</span>
                  <i class="el-icon-edit" v-if="!fillForm.UserNameIsEdit" @click="fillForm.UserNameIsEdit = true"></i>
                  <el-input :placeholder="$t('name')" v-model="fillForm.UserName" v-if="fillForm.UserNameIsEdit"></el-input>
                  <el-button type="cancel" v-if="fillForm.UserNameIsEdit" @click="cancelEdit('UserName')">{{ $t('cancel') }}</el-button>
                  <el-button type="primary" v-if="fillForm.UserNameIsEdit" @click="changeInfo('UserNameIsEdit')">{{ $t('confirm') }}</el-button>
                </el-form-item>
              </el-col>
              <!-- 备注 -->
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item :label="$t('remark')" prop="remark" :show-message="fillForm.remarkIsEdit">
                  <span v-if="!fillForm.remarkIsEdit">{{ fillForm.remark }}</span>
                  <i class="el-icon-edit" v-if="!fillForm.remarkIsEdit" @click="fillForm.remarkIsEdit = true"></i>
                  <el-input :placeholder="$t('remark')" v-model="fillForm.remark" v-if="fillForm.remarkIsEdit"></el-input>
                  <el-button type="cancel" v-if="fillForm.remarkIsEdit" @click="cancelEdit('remark')">{{ $t('cancel') }}</el-button>
                  <el-button type="primary" v-if="fillForm.remarkIsEdit" @click="changeInfo('remarkIsEdit')">{{ $t('confirm') }}</el-button>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <h1 class="user_info_title">{{ $t('group') }}</h1>
          <el-form class="user-info-form">
            <el-row :gutter="10">
              <!-- 组织名称 -->
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item :label="$t('groupname')" prop="GroupName">
                  <span>{{ groupInfo.GroupName }}</span>
                </el-form-item>
              </el-col>
              <!-- 组织代号 -->
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item :label="$t('groupcode')" prop="Code">
                  <span>{{ groupInfo.Code }}</span>
                </el-form-item>
              </el-col>
              <!-- 组织LOGO -->
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item :label="$t('logo')" prop="Logo" class="img-item">
                  <!-- <img v-if="groupInfo.Logo" :src="groupInfo.logo" class="avatar">
                  <img v-else src="~@assets/images/logo.png" alt="" style="width:66px;height66px">-->
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
                    <img v-if="groupInfo.Logo" :src="groupInfo.Logo" class="logo" />
                    <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                  </el-upload>
                  <img v-else-if="groupInfo.Logo" :src="groupInfo.Logo" class="logo" />
                  <img v-else src="~@assets/images/logo.png" alt class="logo" />
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
  </div>
</template>
<script>
import { SEX_TYPE_DIC } from '@constants/dictionaries'
import { IMAGE_URL, UPLOAD_CONFIG } from '@constants/index'
import { $validate } from '@helper'
// let self
export default {
  name: 'user-info',

  data() {
    return {
      loading: true,
      imgUrlPrefix: IMAGE_URL,
      sexTypeDic: SEX_TYPE_DIC,
      isChangePwdDialogVisible: false,
      isChangeAvatarImg: false,
      logoFilePostUrl: UPLOAD_CONFIG.logoImageCof.url || UPLOAD_CONFIG.url,
      logoFileConfig: UPLOAD_CONFIG.logoImageCof,
      groupInfo: {
        GroupName: '',
        Logo: '',
        Code: ''
      },
      fillForm: {
        bSex: '保密',
        bSexIsEdit: false,
        UserName: '未填写',
        UserNameIsEdit: false,
        remark: '未填写',
        remarkIsEdit: false
      },
      editAvatarImgData: { Picture: '', PictureName: '' },
      fillFormBak: {},
      rules: {
        UserName: [
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
      }
    }
  },

  computed: {},

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
          result.bSex = String(result.bSex)
          result.PictureName = result.Picture
          result.Picture = result.Picture ? this.imgUrlPrefix + result.Picture + `?_=${this.$_.random(0, 99999)}` : null
          this.fillForm = Object.assign({}, this.fillForm, result)
          this.fillFormBak = JSON.parse(JSON.stringify(this.fillForm))
          // 获取组织信息
          this.$apis.group
            .findByToken()
            .then(result => {
              result.Logo = result.Logo ? this.imgUrlPrefix + result.Logo + `?_=${this.$_.random(0, 99999)}` : null
              this.groupInfo = result
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
      this.$store.commit('$vuexSetUserPicture', img) // 更新vuex中的用户头像
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
      if (response) {
        if (response.Success === true) {
          this.groupInfo.Logo = URL.createObjectURL(file.raw)
          this.$store.commit('$vuexSetUserGroupLogo', this.groupInfo.Logo)
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
            this.$message.success(result.Message)
            this.fillForm[isEditFlag] = false
            this.fillFormBak = JSON.parse(JSON.stringify(this.fillForm))
            this.userInfo.UserName = this.fillForm.UserName
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
      this.editAvatarImgData.Picture = this.fillForm.Picture
      this.editAvatarImgData.PictureName = this.fillForm.PictureName
      this.editAvatarImgData.Id = this.fillForm.Id
      this.isChangeAvatarImg = true
    }
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
