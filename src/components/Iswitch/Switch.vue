<!--
 * @Author: jiapeng.Zheng
 * @Date: 2018-12-10 09:08:40
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-31 13:51:22
 * @Description: 开关
 -->
<template>
  <div class="i-switch" v-if="skinCof.style === '1'" :class="[{ [skinCof.activeClass]: myValue === activeValue }]" @click="switchClick">
    <span>{{ data.DataName }}</span>
  </div>
  <div v-else class="i-switch">
    <span class="switch-name">{{ data.DataName }}</span>
    <el-switch v-model="myValue" allow-focus @change="onChange" :width="50" :disabled="disabled" :active-value="activeValue" :inactive-value="inactiveValue"></el-switch>
  </div>
</template>

<script>
import { AUTO_MODE } from '@constants/deviceConfig'
import { SWITCH_ACTIVE, SWITCH_UNACTIVE } from '@constants/dataTypeConfig'
// let self

export default {
  name: 'Iswitch',
  props: {
    value: {
      default: ''
    },
    disabled: {
      required: true
    },
    skinCof: {
      type: Object,
      default() {
        return {
          style: '0',
          activeClass: 'active'
        }
      }
    },
    data: {
      required: true,
      type: Object,
      default() {
        return {}
      }
    },
    ctrlModeConf: {
      required: true,
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      activeValue: SWITCH_ACTIVE, // this.dataValueFormat(1), // 开
      inactiveValue: SWITCH_UNACTIVE, // this.dataValueFormat(0), // 关
      myValue: String(this.$mqttData.outFormat({ Format: this.data.dataFormat, DataType: 'boolean' }, this.value)) // this.value
    }
  },
  watch: {
    value(newVal) {
      this.myValue = String(this.$mqttData.outFormat({ Format: this.data.dataFormat, DataType: 'boolean' }, newVal))
    }
  },

  methods: {
    switchClick() {
      if (!this.disabled) {
        const newVal = this.myValue === this.activeValue ? this.inactiveValue : this.activeValue
        this.onChange(newVal)
      } else {
        this.$message.warning(this.data.disableTitle)
      }
    },
    async onChange(newVal) {
      // 判断该控制量是否受控制模式的影响
      if (this.data.isAssCtrlModel) {
        // 判断是否配置了控制模式
        if (this.ctrlModeConf.DefineKey) {
          // 判断控制模式是否为自动模式
          if (String(this.ctrlModeConf.val) === AUTO_MODE) {
            // 控制模式为自动模式时（值为1）不允许控制设备
            this.$message.warning('自动模式下不允许控制设备')
            this.myValue = newVal === this.activeValue ? this.inactiveValue : this.activeValue
          } else {
            this.$emit('input', this.dataValueFormat(newVal)) // this.dataValueFormat(newVal)
            this.$emit('change')
          }
        } else {
          this.$message.warning(`${this.$t('deviceConfig')}尚未配置控制模式`)
          this.$emit('input', this.dataValueFormat(newVal)) // this.dataValueFormat(newVal)
          this.$emit('change')
        }
      } else {
        this.$emit('input', this.dataValueFormat(newVal)) // this.dataValueFormat(newVal)
        this.$emit('change')
      }
    },
    /**
     * 数据转换
     */
    dataValueFormat(val) {
      return this.$mqttData.inFormat({ Format: this.data.dataFormat, DataType: 'boolean' }, val)
    }
  }
}
</script>
<style lang="scss">
@import '~@assets/scss/variables.scss';
.i-switch {
  text-align: center;
  .switch-name {
    display: block;
    margin-bottom: 8px;
  }
}
</style>
