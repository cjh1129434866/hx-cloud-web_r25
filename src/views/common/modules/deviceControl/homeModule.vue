<!--
 * @Author: jiapeng.Zheng
 * @Date: 2019-06-26 14:29:25
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-04-07 14:00:14
 * @Description:
 -->
<template>
  <el-container :class="$style['device-home-module']">
    <el-header :class="$style['home-module-header']" height="auto">
      <el-input :class="[$style['search-input'], $style['opt']]" placeholder="请输入" size="mini" prefix-icon="el-icon-search" v-model="filterValue"></el-input>
      <el-dropdown trigger="click" @command="handleCommand">
        <i class="el-icon-s-tools hover"></i>
        <el-dropdown-menu slot="dropdown" class="device-control-dropdown-menu">
          <el-dropdown-item command="Modify">{{ isModify ? '关闭编辑' : '开启编辑' }}</el-dropdown-item>
          <el-dropdown-item command="Full">{{ isFull ? $t('reduce') : $t('full') }}</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </el-header>
    <el-main :class="$style['home-module-main']" v-loading="isLoading">
      <EasyScrollbar :class="$style['scroll']">
        <div :class="$style['base-data-view']">
          <!-- 暂无数据 -->
          <div class="no-data" v-if="!baseDataList.length && !isAdd">{{ $t('nodata') }} <i class="el-icon-plus hover" :title="$t('adds')" @click="onAddBtnClick"></i></div>
          <!-- 参数列表 -->
          <div
            :class="$style['base-data']"
            v-for="(baseData, index) in baseDataList"
            :key="`base-data-${baseData.Id}`"
            :title="`${baseData.DataName}：${baseData.DataValue}`"
            v-show="filterValuerChange(baseData)"
          >
            <!-- 处于编辑状态的参数 -->
            <div v-if="editForm && editForm.Id === baseData.Id && isModify" :class="$style['edit-form-wrap']">
              <el-input v-model.trim="editForm.DataValue" size="mini" placeholder="参数值" maxlength="10" :class="$style['edit-form']" class="edit-form-input">
                <el-input v-model.trim="editForm.DataName" slot="prepend" placeholder="参数名" :autofocus="true" maxlength="10"></el-input>
              </el-input>
              <div :class="$style['opt-btn']">
                <i class="el-icon-check" :class="$style['edit-btn']" :title="$t('confirm')" @click="updateBaseData(editForm, index)"></i>
                <i class="el-icon-close" :class="$style['del-btn']" :title="$t('cancel')" @click="editForm = null"></i>
              </div>
            </div>
            <!-- 参数 -->
            <template v-else>
              <!-- 编辑、删除按钮 -->
              <div :class="$style['opt-btn']" v-if="isModify">
                <i :class="$style['del-btn']" class="el-icon-delete" :title="$t('deletes')" @click="delBaseData(baseData.Id, index)"></i>
                <!-- <i :class="$style['edit-btn']" class="el-icon-edit-outline" :title="$t('modifs')" @click="onEditBtnClick(baseData)"></i> -->
              </div>
              <div :class="$style['data-item']" @click="onEditBtnClick(baseData)">
                <!-- 参数名称 -->
                <span :class="$style['item-name']">{{ baseData.DataName }}</span>
                <!-- 参数值 -->
                <span :class="$style['item-value']" class="actived">{{ baseData.DataValue }}</span>
              </div>
            </template>
          </div>
          <!-- 新增按钮 -->
          <div v-if="!isAdd && baseDataList.length" :class="$style['base-data']" style="justify-content: center;">
            <el-button size="mini" type="primary" @click="onAddBtnClick">{{ $t('adds') }}</el-button>
          </div>
          <!-- 新增区域 -->
          <div v-if="isAdd" :class="[$style['base-data'], $style['edit-form-wrap']]">
            <el-input v-model.trim="addForm.DataValue" size="mini" placeholder="参数值" maxlength="10" show-word-limit :class="$style['edit-form']" class="edit-form-input">
              <el-input v-model.trim="addForm.DataName" slot="prepend" placeholder="参数名" :autofocus="true" maxlength="10" show-word-limit></el-input>
            </el-input>
            <div :class="$style['opt-btn']">
              <i class="el-icon-check" :class="$style['edit-btn']" :title="$t('confirm')" @click="addBaseData(addForm)"></i>
              <i class="el-icon-close" :class="$style['del-btn']" :title="$t('cancel')" @click="isAdd = false"></i>
            </div>
          </div>
        </div>
      </EasyScrollbar>
    </el-main>
  </el-container>
</template>
<script lang="ts">
import { Component, Prop, Watch, Emit, Vue } from 'vue-property-decorator'
import { DEVICE_PARAM_PANEL } from '@constants/panelConfig'
import DeviceBaseDataApi from '@helper/apis/deviceBaseData.js'
import PanelApi from '@helper/apis/panel.js'

@Component({})
export default class HomeModule extends Vue {
  /**
   * 设备信息
   */
  @Prop({
    default() {
      return { DeviceNo: '' }
    }
  })
  deviceInfo: DeviceVO

  isAdd = false // 是否点击了新增按钮
  isModify = false // 是否处于修改
  isFull = false // 是否处于全屏
  isLoading = false
  baseDataList: Array<DeviceBaseVO> = [] // 参数列表
  filterValue = '' // 搜索过滤，根据 filterValue 过滤筛选 baseDataList
  // 正在编辑的数据
  addForm = {
    DataName: '',
    DataValue: ''
  }
  editForm: DeviceBaseVO | null = null // 保存目前编辑的数据

  get paramPanelId(): number | null {
    return this.$store.getters['devicePanel/getPanelId'](DEVICE_PARAM_PANEL)
  }

  @Watch('deviceInfo.DeviceSn')
  async onDeviceInfoChange(newVal) {
    this.isModify = false
    this.isAdd = false
    this.editForm = null
    this.baseDataList = await this.getBaseData(newVal)
  }

  // ----------------- “设备参数”api -----------------
  // 获取设备参数
  async getBaseData(deviceSn: string) {
    this.isLoading = true
    const data = await DeviceBaseDataApi.getDeviceBaseData(deviceSn)
    this.isLoading = false
    return data.list
  }
  // 删除设备参数
  delBaseData(id: number, index: number) {
    this.$confirm(`是否删除该参数？`, '提示', {
      cancelButtonClass: 'el-button--cancel',
      closeOnClickModal: false
    })
      .then(async () => {
        try {
          await DeviceBaseDataApi.deleteDeviceBaseData(id, this.deviceInfo.DeviceSn)
          this.$message.success('删除设备参数成功')
          this.baseDataList.splice(index, 1)
        } catch (error) {
          this.$message.error('删除设备参数失败')
        }
      })
      .catch(err => {
        console.error(err)
      })
  }
  // 修改设备参数
  async updateBaseData(data: DeviceBaseVO, index: number) {
    const _data: DeviceBaseDTO = {
      Id: data.Id,
      DataName: data.DataName,
      DataValue: data.DataValue,
      DeviceSn: this.deviceInfo.DeviceSn,
      DataType: 'string',
      PanelId: this.paramPanelId
    }
    DeviceBaseDataApi.updateDeviceBaseData(_data)
      .then(() => {
        this.editForm = null
        this.$message.success('修改设备参数成功')
        this.baseDataList.splice(index, 1, { Id: _data.Id, DataName: _data.DataName, DataValue: _data.DataValue })
      })
      .catch(err => {
        console.error(err)
        this.$message.error('修改设备参数失败')
      })
  }
  // 新增设备参数
  async addBaseData(data: DeviceBaseVO) {
    const _data: DeviceBaseDTO = {
      DataName: data.DataName,
      DataValue: data.DataValue,
      DeviceSn: this.deviceInfo.DeviceSn,
      DataType: 'string',
      PanelId: this.paramPanelId
    }
    DeviceBaseDataApi.deviceBaseDataAdd(_data)
      .then((res: DeviceBaseDTO) => {
        this.isAdd = false
        this.$message.success('新增设备参数成功')
        this.baseDataList.push({
          Id: res.Id,
          DataName: res.DataName,
          DataValue: res.DataValue
        })
      })
      .catch(err => {
        console.error(err)
        this.$message.error(`新增设备参数失败：${String(err)}`)
      })
  }
  // ----------------- 下拉组件事件 -----------------
  handleCommand(command) {
    this[`on${command}Click`]()
  }
  // 开启/关闭编辑
  onModifyClick() {
    this.isModify = !this.isModify
  }
  // 全屏切换
  @Emit('onFullClick')
  onFullClick() {
    this.isFull = !this.isFull
    return this.isFull
  }
  // ----------------------------------
  // 新增按钮点击事件
  onAddBtnClick() {
    this.addForm = {
      DataName: '',
      DataValue: ''
    }
    if (this.paramPanelId === null) {
      // 添加产品参数面板
      PanelApi.addPanel(DEVICE_PARAM_PANEL, String(this.$t('deviceParam')), this.deviceInfo.DeviceSn)
        .then(result => {
          this.$store.commit('devicePanel/addPanel', result)
          this.isAdd = true
        })
        .catch(errMsg => {
          this.$message.error(String(errMsg))
          console.error(errMsg)
        })
    } else {
      this.isAdd = true
    }
  }
  // 编辑按钮点击事件
  onEditBtnClick(data: DeviceBaseVO) {
    if (this.isModify) {
      this.editForm = JSON.parse(JSON.stringify(data)) || null
    }
  }
  // 参数过滤事件
  filterValuerChange(item: DeviceBaseVO) {
    return item.DataName.indexOf(this.filterValue) > -1 || item.DataValue.indexOf(this.filterValue) > -1
  }
  // ----------------- 生命周期 -----------------
  async created() {
    this.baseDataList = await this.getBaseData(this.deviceInfo.DeviceSn)
  }
}
</script>
<style lang="scss" module>
@import '~@assets/scss/variables.scss';
@import '~@assets/scss/mixins.scss';
.device-home-module {
  height: 100%;
  .home-module-header {
    text-align: right;
    padding: {
      top: $spacing-size;
      bottom: $spacing-size;
    }
    .opt {
      margin: 0 $spacing-size/2;
    }
    .search-input {
      width: 180px;
    }
  }
  .home-module-main {
    padding-top: 0;
    .scroll {
      height: 100%;
      .base-data-view {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        .base-data {
          flex-basis: 33.33%;
          padding-right: 10px;
          display: flex;
          justify-content: flex-start;
          @include text-overflow();
          line-height: 30px;
          height: 30px;
          .data-item {
            @include text-overflow();
            .item-name {
              margin-right: 0.5em;
            }
          }
          .edit-form-wrap {
            width: 100%;
          }
        }
      }
    }
  }
  .opt-btn {
    margin: 0 0.25em;
    .edit-btn,
    .del-btn {
      cursor: pointer;
      padding: 0 0.25em;
    }
    .edit-btn {
      color: $theme-dark-activeBgHasFont;
      &:hover {
        color: lighten($theme-dark-activeBgHasFont, 10%);
      }
    }
    .del-btn {
      color: $element-danger-color;
      &:hover {
        color: lighten($element-danger-color, 10%);
      }
    }
  }
  .edit-form-wrap {
    display: flex;
    align-items: center;
    .edit-form {
      width: auto;
    }
  }
}
.more-dropdown-menu {
  color: red;
}
</style>
