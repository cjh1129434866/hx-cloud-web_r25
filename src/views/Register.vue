<template>
  <div class="register-wrap">
    <div class="register-box" v-if="!isAllSuccess">
      <img src="~@assets/images/logo.png" alt />
      <h1 class="heading" v-if="isAllSuccess">用户注册</h1>
      <el-steps class="register-steps" space="90%" :active="active" finish-status="success" align-center>
        <el-step title="填写账户信息"></el-step>
        <el-step title="加入或创建组织"></el-step>
      </el-steps>
      <!-- 账号密码 -->
      <el-form v-show="active === 0" class="user-info-form" :model="User" :rules="userFormRules" ref="userForm">
        <el-form-item prop="Account">
          <el-input v-model="User.Account" :placeholder="$t('username')"></el-input>
        </el-form-item>
        <el-form-item prop="Password">
          <el-input v-model="User.Password" type="password" :placeholder="$t('password')"></el-input>
        </el-form-item>
        <el-form-item prop="PasswordAgain">
          <el-input type="password" v-model="User.PasswordAgain" :placeholder="$t('passwordAgain')"></el-input>
        </el-form-item>
        <el-form-item prop="RealName">
          <el-input v-model="User.RealName" :placeholder="$t('realname')"></el-input>
        </el-form-item>
        <el-button type="primary" :loading="isLoading" @click="onRgisterClick">{{ $t('next') }}</el-button>
      </el-form>
      <!-- 加入或创建组织 -->
      <el-tabs v-show="active === 1" class="group-tabs">
        <el-tab-pane>
          <span slot="label">创建组织</span>
          <el-form :model="newGroup" :rules="newGroupFormRules" class="group-new-form" ref="newGroupForm">
            <el-form-item prop="GroupName" :label="$t('groupname')">
              <el-input v-model="newGroup.GroupName" :placeholder="$t('pleaseEnter') + $t('groupname')"></el-input>
            </el-form-item>
            <el-form-item prop="Code" :label="$t('groupcode')">
              <el-input v-model="newGroup.Code" :placeholder="$t('pleaseEnter') + $t('groupcode')"></el-input>
            </el-form-item>
            <el-button type="primary" :loading="isLoading" @click="onNewGroupClick">{{ $t('confirm') }}</el-button>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="加入组织">
          <span slot="label">加入组织</span>
          <el-form :inline="true" class="group-add-form">
            <el-form-item :model="addGroup" :label="$t('groupname')">
              <el-input v-model="addGroup.Name"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="search" @click="onSearchGroupClick()">{{ $t('search') }}</el-button>
            </el-form-item>
          </el-form>
          <el-table :data="remoteGroup" border :loading="isLoading">
            <el-table-column prop="GroupName" label="组织名称" min-width="200"></el-table-column>
            <el-table-column label="操作" min-width="100">
              <template v-slot="scope">
                <el-button @click="onAddGroup(scope.row.GroupName)" type="success" icon="plus" size="small">申请加入组织</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="table-operate">
            <el-pagination
              @size-change="
                val => {
                  handleSizeChange(val, 'addGroup')
                }
              "
              @current-change="
                val => {
                  handleCurrentChange(val, 'addGroup')
                }
              "
              :current-page="addGroup.currentPage"
              :page-sizes="addGroup.pageSizes"
              :page-size="addGroup.pageSize"
              :total="addGroup.pageTotal"
              layout="total, sizes, prev, pager, next, jumper"
            ></el-pagination>
          </div>
        </el-tab-pane>
      </el-tabs>
      <div class="register-bottom">
        <router-link class="login" to="/login">已有账号，返回登录</router-link>
      </div>
    </div>
    <div v-if="isAllSuccess" class="register-box register-success">
      <i class="el-icon-circle-check"></i>
      <span>
        {{ allSuccessMessage }}
        <router-link class="login" to="/login">返回登录</router-link>
      </span>
    </div>
  </div>
</template>

<script>
import { $validate } from '@helper'

export default {
  data() {
    return {
      isLoading: false,
      active: 0,
      isAllSuccess: false,
      allSuccessMessage: '',
      remoteGroup: [],
      addGroup: {
        Name: '',
        pageNo: 1, // 第几页
        currentPage: 1,
        pageTotal: 0, // 总条数
        pageSize: 15, // 每页显示个数
        pageSizes: [10, 20, 30] // 每页显示个数选择器的选项设置
      },
      newGroup: { GroupName: '', Code: '' },
      User: {
        Account: '',
        Password: '',
        PasswordAgain: '',
        RealName: ''
      },
      userFormRules: {
        Account: [
          {
            required: true,
            message: this.$t('pleaseEnter') + this.$t('username'),
            trigger: 'blur,change'
          },
          {
            type: 'string',
            required: true,
            ...$validate.LettersOrNumber(3, 15).rule(),
            trigger: 'blur'
          }
        ],
        Password: [
          {
            required: true,
            message: this.$t('pleaseEnter') + this.$t('password'),
            trigger: 'blur,change'
          },
          {
            type: 'string',
            required: true,
            ...$validate.LettersOrNumber(3, 10).rule(),
            trigger: 'blur'
          }
        ],
        PasswordAgain: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (value === '') {
                callback(new Error(this.$t('pleaseEnter') + this.$t('passwordAgain')))
              } else if (value !== this.User.Password) {
                callback(new Error('两次输入密码不一致!'))
              } else {
                callback()
              }
            },
            trigger: 'blur,change'
          }
        ],
        RealName: [
          {
            required: true,
            message: this.$t('pleaseEnter') + this.$t('realname'),
            trigger: 'blur,change'
          },
          {
            required: true,
            ...$validate.lengthLimt(2, 5).rule(),
            trigger: 'blur,change'
          }
        ]
      },
      newGroupFormRules: {
        GroupName: [
          {
            required: true,
            message: this.$t('pleaseEnter') + this.$t('groupname'),
            trigger: 'blur,change'
          },
          {
            required: true,
            ...$validate.lengthLimt(2, 25).rule(),
            trigger: 'blur,change'
          }
        ],
        Code: [
          {
            required: true,
            message: this.$t('pleaseEnter') + this.$t('groupcode'),
            trigger: 'blur,change'
          },
          {
            type: 'string',
            required: true,
            ...$validate.LettersOrNumber(3, 36).rule(),
            trigger: 'blur'
          }
        ]
      }
    }
  },

  computed: {},
  components: {},
  created() {
    // 判断用户是否已经注册
    const params = this.$route.params
    if (params.account) {
      this.active = 1
      this.User.Account = params.account
    }
  },

  methods: {
    // 注册
    onRgisterClick() {
      // this.isLoading = true
      this.$refs['userForm'].validate(valid => {
        if (valid) {
          this.$apis.user
            .register(this.User)
            .then(result => {
              this.$message.success(`${result.Message},请加入或创建组织`)
              if (this.active <= 2) this.active++
            })
            .catch(errMsg => {
              this.$message.error(errMsg)
              console.error(errMsg)
            })
            .fin(() => {
              this.isLoading = false
            })
        } else {
          this.isLoading = false
          return false
        }
      })
    },
    // 创建组织
    onNewGroupClick() {
      this.$refs['newGroupForm'].validate(valid => {
        if (valid) {
          this.$confirm(`是否创建并加入【${this.newGroup.GroupName}】？`, '提示', {
            cancelButtonClass: 'el-button--cancel',
            closeOnClickModal: false
          })
            .then(() => {
              this.$apis.group
                .add({ ...this.User, ...this.newGroup })
                .then(result => {
                  this.isAllSuccess = true
                  this.allSuccessMessage = result.Message
                })
                .catch(errMsg => {
                  this.$message.error(errMsg)
                  console.error(errMsg)
                })
                .fin(() => {
                  this.isLoading = false
                })
            })
            .catch(() => {
              this.$message.warning('取消创建')
            })
        } else {
          return false
        }
      })
    },
    // 搜索组织
    onSearchGroupClick() {
      this.isLoading = true
      this.remoteGroup = []
      this.$apis.group
        .findByName(this.addGroup)
        .then(result => {
          this.remoteGroup = result.listGroup
          this.addGroup.pageTotal = result.DataCount
          // this.addGroup.pageNo = result.pageNo
          // this.addGroup.pageSize = result.pageSize
        })
        .catch(errMsg => {
          this.$message.error(errMsg)
          console.error(errMsg)
        })
        .fin(() => {
          this.isLoading = false
        })
    },
    // 分页，每页显示个数改变
    handleSizeChange(val, tableName) {
      this[tableName].pageSize = val
    },
    // 分页，当前页改变
    handleCurrentChange(val, tableName) {
      this[tableName].currentPage = val
    },
    // 加入组织
    onAddGroup(groupName) {
      this.$confirm(`是否加入【${groupName}】？`, '提示', {
        cancelButtonClass: 'el-button--cancel',
        closeOnClickModal: false
      })
        .then(() => {
          this.isLoading = true
          this.$apis.user
            .userUpdateToken({ Account: this.User.Account, GroupName: groupName })
            .then(result => {
              this.isAllSuccess = true
              this.allSuccessMessage = result.Message
            })
            .catch(errMsg => {
              this.$message.error(errMsg)
              console.error(errMsg)
            })
            .fin(() => {
              this.isLoading = false
            })
        })
        .catch(() => {
          this.$message.warning('取消加入')
        })
    }
  }
}
</script>

<style lang="scss">
@import '~@assets/scss/variables.scss';
@import '~@assets/scss/mixins.scss';

.register-wrap {
  width: 520px;
  margin: 0 auto;
  padding-top: 150px;
  min-height: 400px;
  position: relative;
}
.register-box {
  width: 520px;
  padding: 30px;
  height: 100%;
  background-color: #fff;
  clear: both;
  display: table;
  border-radius: 4px;
  border: 1px solid #d7dce5;
  &.register-success {
    text-align: center;
    color: $element-success-color;
    i {
      font-size: 20em;
    }
    span {
      display: block;
      margin: 20px 0 0 0;
      font-size: 1.5em;
    }
    .login {
      display: block;
      margin: 20px auto 0 auto;
      font-size: 1.5em;
    }
  }
  .heading {
    text-align: center;
    margin-bottom: 30px;
    font-size: 24px;
    color: #707473;
  }
  img {
    display: block;
    width: 80px;
    margin: 0 auto 20px;
  }
  .register-steps {
    padding: 0 30px $spacing-size 30px;
  }
  .user-info-form {
    .el-form-item {
      margin-bottom: 30px;
    }
  }
  .group-tabs {
    .table-operate {
      margin-bottom: $spacing-size;
    }
    .group-add-form {
      .el-form-item {
        margin-bottom: 0;
      }
    }
  }
  .register-bottom {
    padding: $spacing-size 0 0 0;
    .login {
      float: right;
    }
  }

  .el-button--primary {
    display: block;
    width: 100%;
    margin: 0 auto;
  }
}

@media (max-width: 667px) {
  .register-wrap {
    margin-top: 0;
    width: 350px;
  }
  .register-box {
    width: 350px;
  }
}

@media (max-width: 320px) {
  .register-wrap {
    width: 100%;
    padding-top: 60px;
  }
  .register-box {
    width: 100%;
    border: 0 none;
  }
}
</style>
