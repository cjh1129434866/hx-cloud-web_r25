<!--
 * @Author       : jiapeng.Zheng
 * @Date         : 2020-05-19 15:56:28
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-05-20 13:56:05
 * @Description  : 设备控制日志
-->
<template>
  <div class="app-device-ctrl-log">
    <div class="log-title card-title">
      <span class="title-name">
        <icon name="panel/record"></icon>
        {{ $t('deviceCtrlLog') }}
      </span>
      <span class="opt-area">
        <el-date-picker
          class="search-time"
          v-model="dateRange"
          size="small"
          type="daterange"
          align="right"
          :clearable="false"
          :placeholder="$t('pleaseSelect') + $t('dateRange')"
        ></el-date-picker>
        <el-input class="search-input" size="small" v-model="searchForm.search" :placeholder="$t('pleaseEnter')"></el-input>
        <el-button type="primary" size="small" @click="onSearchClick">{{ $t('search') }}</el-button>
      </span>
    </div>
    <div class="log-table">
      <el-table :data="logDataList" border height="auto" v-loading="isLoading">
        <el-table-column prop="Key" label="数据定义Key" align="center"></el-table-column>
        <el-table-column prop="KeyName" label="数据定义名称" align="center"></el-table-column>
        <el-table-column prop="OldValue" label="变更前的值" align="center"></el-table-column>
        <el-table-column prop="Value" label="要变更的值" align="center"></el-table-column>
        <el-table-column prop="NewValue" label="变更后的值" align="center"></el-table-column>
        <el-table-column width="200" prop="SendTime" label="发送时间" align="center"></el-table-column>
        <el-table-column width="200" prop="Time" label="接收时间" align="center"></el-table-column>
        <el-table-column label="耗时" align="center">
          <template slot-scope="scope">
            <span>{{ (new Date(scope.row.Time) - new Date(scope.row.SendTime)) / 1000 }}s</span>
          </template>
        </el-table-column>
        <el-table-column prop="Account" label="操作人" align="center"></el-table-column>
      </el-table>
      <div class="table-operate">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="searchForm.pageNo"
          :page-sizes="pageSizes"
          :page-size="searchForm.pageSize"
          :total="pageTotal"
          layout="total, sizes, prev, pager, next, jumper"
        ></el-pagination>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import DeviceLogApi from '@helper/apis/deviceLog'
import $utils from '@helper/utils'

@Component({})
export default class DeviceCtrlLog extends Vue {
  @Prop({
    default() {
      return { DeviceSn: '' }
    }
  })
  deviceInfo: DeviceVO

  pageTotal = 0 // 总页数
  pageSizes = [10, 20, 30] // 每页显示个数选择器的选项设置
  /**
   * 时间范围,默认最近一个月
   */
  dateRange = [new Date(new Date().setTime(new Date().getTime() - 3600 * 1000 * 24 * 31)), new Date()]
  searchForm: DeviceControlLogPageDTO = {
    DeviceSn: '',
    search: '',
    begin: '',
    end: '',
    order: 'SendTime',
    orderType: 'desc',
    pageNo: 1, // 当前第几页
    pageSize: 0 // 每页显示个数
  }
  /**
   * 设备控制日志
   */
  logDataList: DeviceControlLogVO[] = []
  isLoading = false

  created() {
    this.searchForm.DeviceSn = this.deviceInfo.DeviceSn
    this.searchForm.pageSize = this.pageSizes[0]
    this.onSearchClick()
  }

  handleSizeChange(val) {
    this.searchForm.pageSize = val
    this.onSearchClick()
  }

  handleCurrentChange(val) {
    this.searchForm.pageNo = val
    this.onSearchClick()
  }

  async onSearchClick() {
    this.searchForm.begin = $utils.dateConvert(this.dateRange[0], 'YYYY-MM-DD 00:00:00')
    this.searchForm.end = $utils.dateConvert(this.dateRange[1], 'YYYY-MM-DD 23:59:59')
    this.isLoading = true
    const result = await DeviceLogApi.getDeviceLog(this.searchForm)
    this.isLoading = false
    this.logDataList = result.List
    this.pageTotal = result.DataCount
    this.searchForm.pageSize = result.PageSize
    this.searchForm.pageNo = result.PageNo
  }
}
</script>
<style lang="scss">
@import '~@assets/scss/variables.scss';
.app-device-ctrl-log {
  height: 100%;
  display: flex;
  flex-direction: column;
  .log-title {
    .opt-area {
      display: flex;
      justify-content: space-around;
      .search-time {
        width: 300px;
      }
      .search-input {
        width: 200px;
      }
      .search-time,
      .search-input {
        margin-right: 1rem;
      }
    }
  }
  .log-table {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
}
</style>
