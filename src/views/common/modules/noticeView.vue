<!--
 * @Author: jiapeng.Zheng
 * @Date: 2019-02-15 16:54:15
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-04-30 09:48:09
 * @Description: 通知模块
 -->
<template>
  <el-tabs v-model="activeTab" v-loading="loading" class="notice-view" :class="[$style['notice-view']]">
    <el-tab-pane v-for="(value, key) in $commonParam.warnTypeDict" :key="key" :label="value.TypeName" :name="key">
      <span slot="label" :class="[$style['notice-name']]">
        <el-badge is-dot :hidden="!(_showData[key] ? _showData[key].length : 0)">{{ value.TypeName }}</el-badge>
      </span>
      <ul class="notice-table" :class="[$style['notice-table']]">
        <div class="notice-table-title" :class="[$style['notice-table-title']]">
          <span>{{ value.TypeName }}信息 ({{ _showData[activeTab] ? _showData[activeTab].length : 0 }})</span>
          <!-- <span v-if="_showData[activeTab] ? _showData[activeTab].length : 0" class="text-link" :class="[$style['btn']]" @click="onMoreClick(activeTab)">{{
            $t('more')
          }}</span> -->
        </div>
        <EasyScrollbar class="content-scrollbar" :barOption="barOption">
          <template v-for="(item, index) in _showData[activeTab]">
            <li
              class="notice-item"
              :class="[$style['notice-item']]"
              :key="index"
              :title="`${index + 1}.设备【${item.DeviceName}】${item.CodeDescription}(${item.Dt})`"
              @click="onNoticeInfoClick(item)"
            >
              <span :class="[$style['notice-type']]" :style="`color:${$commonParam.warnTypeDict[item.TypeId].Color}`">
                <icon :name="$commonParam.warnTypeDict[item.TypeId].Icon"></icon><span>{{ value.TypeName }}</span>
              </span>
              {{ index + 1 }}.设备【{{ item.DeviceName }}】 {{ item.CodeDescription }}
            </li>
          </template>
          <template v-if="_showData[activeTab]">
            <li v-if="_showData[activeTab].length === 0" class="notice-nodata" :class="[$style['notice-nodata']]">
              {{ $t('nodata') }}
            </li>
          </template>
          <template v-else>
            <li class="notice-nodata" :class="[$style['notice-nodata']]">{{ $t('nodata') }}</li>
          </template>
        </EasyScrollbar>
      </ul>
    </el-tab-pane>
  </el-tabs>
</template>
<script>
import { NOTICE_STATE_UNSOLVED } from '@constants/noticeTypeConfig'
import { BAR_OPTION } from '@constants/easyScrollbarConfig/index.js'
import { _DEVICE, _STATION } from '@constants/projectType'
let _timer = null
export default {
  name: 'notice-view',
  props: {
    projObj: {
      type: Object,
      default() {
        return { Id: 0 }
      }
    },
    deviceSn: {
      type: String
    },
    activeItemData: {
      type: Object,
      default() {
        return {
          dataType: _STATION.key,
          id: ''
        }
      }
    }
  },
  data() {
    return {
      activeTab: '',
      loading: false,
      noticeTime: 5, // 获取报警信息的间隔时间，单位：分钟
      originalData: [], // 原始的通知信息
      deviceUrl: '/common/home/device',
      stationDeviceUrl: '/common/home/station',
      barOption: BAR_OPTION
    }
  },

  watch: {
    'projObj.Id'() {
      this.handRefresh()
    }
  },

  components: {},

  computed: {
    // 要展示的数据
    _showData() {
      const originalData = this.originalData || []
      const _showData = originalData.reduce((exit, entry) => {
        const { TypeId, DeviceSn } = entry
        exit[TypeId] = exit[TypeId] || []
        if (this.deviceSn && this.deviceSn !== '0') {
          // 过滤掉非当前设备的报警信息
          if (DeviceSn === this.deviceSn) {
            exit[TypeId].push(entry)
          }
        } else {
          exit[TypeId].push(entry)
        }
        return exit
      }, {})
      this.$emit('notice-data', _showData)
      return _showData
    }
  },

  created() {
    this.activeTab = String((this.$commonParam.warnTypes[0] || {}).Id || '') // 默认激活第一个Tab
  },
  mounted() {
    // 每隔 noticeTime 分钟获取一次报警信息
    if (!_timer) {
      _timer = setInterval(() => {
        this.handRefresh()
      }, this.noticeTime * 60 * 1000)
    }
  },
  // // 不需要销毁计时器，要让其一直获取报警信息
  destroyed() {
    clearInterval(_timer)
    _timer = null
  },

  methods: {
    async handRefresh() {
      this.loading = true
      this.$apis.warn
        .getListWarn(NOTICE_STATE_UNSOLVED, this.projObj.Id)
        .then(result => {
          this.originalData = result.Data
          const errorObj = {} // 未处理的设备报警
          // 遍历报警信息
          result.Data.forEach(element => {
            const { DeviceNo, Code, Dt } = element
            errorObj[DeviceNo] = errorObj[DeviceNo] || { ts: '', error: {} }
            errorObj[DeviceNo].ts = this.$utils.mqttReceiveDateConvert(new Date(Dt))
            errorObj[DeviceNo].error[Code] = true // true 代表设备报警
            errorObj[DeviceNo] = this.$utils.mqttDeviceDataFormatMethod(errorObj[DeviceNo], DeviceNo)
          })
          // 保存设备未处理的（NOTICE_STATE_UNSOLVED）报警信息
          this.$store.commit('$vuexSetDeviceError', errorObj)
        })
        .catch(errMsg => {
          console.error(errMsg)
          this.$message.error('获取报警信息失败')
        })
        .fin(() => {
          this.loading = false // 移除loading
          this.initTableScroll()
        })
    },
    // 通知内容点击
    onNoticeInfoClick(rowData) {
      const { DeviceSn, DeviceName, FullId, FullName } = rowData
      let toPath = `${this.deviceUrl}/${DeviceSn}`
      // 跳转到具体某个站场列表下的设备
      if (this.activeItemData.dataType === _STATION.key && this.activeItemData.id) {
        toPath = `${this.stationDeviceUrl}/${this.activeItemData.id}?_activeDevice=${DeviceSn}`
      }

      const fromPath = {
        fullPath: this.$vueRouterGenerator.genFullPathByFullId(FullId, FullName, _DEVICE.key),
        fullPathName: FullName,
        fullPathID: FullId
      }
      this.$vueRouterGenerator.goToPage(toPath, DeviceName, fromPath)
    },
    // 查看更多
    onMoreClick(typeId) {
      const toPath = `${this.noticeCenterUrl}?projectId=${this.projObj.Id}&stateId=${Number(false)}&warnTypeId=${typeId}`
      this.$vueRouterGenerator.goToPage(toPath)
    },
    initTableScroll(num = 0) {
      this.$nextTick(() => {
        const $statistics = document.querySelector('.notice-table .easy-scrollbar__wrap')
        $statistics && ($statistics.scrollTop = num) // 将滚动条置顶
      })
    }
  }
}
</script>
<style type="text/css" lang="scss" module>
@import '~@assets/scss/variables.scss';
@import '~@assets/scss/mixins.scss';
.notice-view {
  .notice-name {
    line-height: $font-default;
  }
  .notice-table {
    height: 100%;
    // height: 210px;
    margin: 0;
    padding: $spacing-medium-size;
    padding-top: 0;
    display: flex;
    flex-direction: column;
    .notice-table-title {
      margin-bottom: $spacing-size;
      .btn {
        float: right;
      }
    }
    .notice-item {
      padding: $spacing-size 0;
      cursor: pointer;
      @include text-overflow();
      .notice-type {
        margin-right: 1em;
      }
    }
    .notice-nodata {
      text-align: center;
    }
  }
}
</style>
