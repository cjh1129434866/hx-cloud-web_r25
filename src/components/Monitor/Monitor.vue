<!--
 * @Author: jiapeng.Zheng
 * @Date: 2018-12-10 09:08:40
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-05-07 10:16:41
 * @Description:
 -->
<template>
  <!-- 监控类型 -->
  <span class="monitor" v-if="data.componentDataType === dataTypeMonitor">
    <span class="item-name" :title="data.DataName">{{ data.DataName }}</span>
    <span class="item-value actived" :title="showVal">{{ showVal }}</span>
    <!-- <span class="item-unit">{{ $mqttData.unitFormat(data.Unit) }}</span> -->
  </span>
  <!-- 下拉类型 -->
  <span v-else-if="data.componentDataType === dataTypeSelect" class="select">
    <label class="item-name" :title="data.DataName">{{ data.DataName }}</label>
    <el-select class="item-value" size="mini" v-model="outVal" @change="onSeletChange">
      <el-option v-for="item in seletOption" :key="item.value" :label="item.name" :value="item.value"></el-option>
    </el-select>
  </span>
  <!-- 枚举类型 -->
  <span v-else class="enum">
    <!-- data.componentDataType === 'enum' -->
    <span class="item-name" :title="data.DataName">{{ data.DataName }}</span>
    <span class="item-value actived">
      <span>{{ outVal || '-' }}</span>
    </span>
  </span>
</template>

<script>
import { DATA_TYPE_UNIT_CONFIG, DATA_TYPE_MONITOR, DATA_TYPE_SELECT } from '@constants/dataTypeConfig'

export default {
  name: 'monitor',
  props: {
    value: {
      require: true,
      default: ''
    },
    data: {
      require: true,
      type: Object,
      default() {
        return {}
      }
    },
    dataKey: {
      require: true,
      default: ''
    },
    disabled: {
      required: true
    }
  },
  watch: {
    value(newVal) {
      this.dataFormat(newVal)
      this.isAutoChange = true
    }
  },
  computed: {},
  data() {
    return {
      // statisticsLine: null,
      // maxPoint: 10,
      dataTypeUnitConfig: DATA_TYPE_UNIT_CONFIG,
      dataTypeMonitor: DATA_TYPE_MONITOR,
      dataTypeSelect: DATA_TYPE_SELECT,
      isAutoChange: false, // 是否由设备上传导致数据发生变化
      seletOption: [],
      outVal: null,
      showVal: null
    }
  },
  filters: {},
  created() {
    this.seletOption = this.$mqttData._format(this.data.dataFormat).options || [] // seletOption
  },
  mounted() {
    this.dataFormat(this.value)
  },
  methods: {
    dataFormat(val) {
      const formatObj = {
        Format: this.data.dataFormat,
        DataType: this.data.componentDataType,
        Unit: this.data.Unit
      }
      this.outVal = this.$mqttData.outFormat(formatObj, val) // 用于界面显示
      this.showVal = this.$mqttData.showFormat(formatObj, val)
    },
    onSeletChange(val) {
      if (this.isAutoChange) {
        this.isAutoChange = false
      } else {
        this.$emit('input', val)
        this.$emit('change')
      }
    }
  }
}
</script>
<style lang="scss">
@import '~@assets/scss/variables.scss';
.item-name {
  margin-right: 0.5em;
}
.select {
  display: flex;
  align-items: center;
  .item-name,
  .item-value {
    width: auto;
  }
}
.enum {
  .enum-value {
    margin-left: 0.5em;
    color: $text-grey;
    &.is-active {
      color: $element-danger-color;
    }
  }
}
</style>
