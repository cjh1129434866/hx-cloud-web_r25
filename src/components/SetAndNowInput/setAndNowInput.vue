<!--
 * @Author: jiapeng.Zheng
 * @Date: 2019-06-27 17:32:54
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-31 13:51:04
 * @Description: 设定值和当前值
 -->
<template>
  <div class="set-and-now-input">
    <!-- 时间格式的设定值 -->
    <template v-if="data.componentDataType === dataTypeDatetime">
      <div class="set-input">
        <span class="input-name">设定值</span>
        <el-time-picker ref="timePicker" class="input-val" size="mini" :clearable="false" v-model="setValue"></el-time-picker>
        <span class="input-unit"></span>
      </div>
    </template>
    <!-- 下拉格式 -->
    <template v-else-if="data.componentDataType === dataTypeSelect">
      <div class="set-input">
        <!-- <span class="input-name">设定值</span>
        <el-time-picker ref="timePicker" class="input-val" size="mini" :clearable="false" v-model="setValue"></el-time-picker>
        <span class="input-unit"></span>-->
        <label class="input-name">设定值</label>
        <el-select class="input-val" size="mini" popper-class="set-select-option" v-model="setValue" @change="onSeletChange">
          <el-option v-for="item in seletOption" :key="item.value" :label="item.name" :value="item.value"></el-option>
        </el-select>
      </div>
    </template>
    <!-- 其他格式 -->
    <template v-else>
      <div class="set-input">
        <span class="input-name">设定值</span>
        <el-tooltip effect="danger" placement="top" :manual="true" v-model="isNotValidate" :content="validateMsg">
          <el-input class="input-val" size="mini" :disabled="disabled" v-model="setValue" @change="onSetValueInputChange" @keyup.enter.native="onBeforeSend">
            <span slot="suffix" class="el-input__icon">{{ setValueUnit }}</span>
          </el-input>
        </el-tooltip>
        <!-- <span class="input-unit">{{ setValueUnit }}</span> -->
      </div>
      <!-- 只有 Associate（关联数据定义） 才有当前值 -->
      <div class="now-input" v-if="data.Associate.key">
        <span class="input-name">当前值</span>
        <span class="input-val">{{ nowValue }}</span>
        <span class="input-unit">{{ nowValueUnit }}</span>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { MessageBox } from 'element-ui'
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import $_ from '@helper/lodash.js'
import { DATA_TYPE_DATETIME, DATA_TYPE_SELECT } from '@constants/dataTypeConfig/index.js'
import $mqttData from '@/prototype/mqttData.js'

@Component({})
export default class SetAndNowInput extends Vue {
  @Prop({ default: '' })
  value: string | number
  @Prop({
    default() {
      return {}
    }
  })
  data: DeviceControlBO
  @Prop({ default: false })
  disabled: boolean
  @Prop({ default: '' })
  controlName: string

  /**
   * 设定值的验证消息
   */
  validateMsg = ''
  /**
   * 设定值是否不通过验证
   */
  isNotValidate = false

  /**
   * 设定值（设备上传的值，已经格式化）
   */
  setValue: string | number | Date = ''
  /**
   * 设定值单位
   */
  setValueUnit = ''
  /**
   * 最大的设定值（用户在数据定义中配置的值，{option:{max:''}}）
   */
  setValueMax: number = null // Math.pow(2, 31)
  /**
   * 最小的设定值（用户在数据定义中配置的值，{option:{min:''}}）
   */
  setValueMin: number = null // 0
  /**
   * 当前值（设备上传的值，已经格式化）
   */
  nowValue: string | number = ''
  /**
   * 当前值单位
   */
  nowValueUnit = ''

  /**
   * 时间类型的数据定义
   */
  dataTypeDatetime = DATA_TYPE_DATETIME

  /**
   * 下拉类型的数据定义
   */
  dataTypeSelect = DATA_TYPE_SELECT

  /**
   * 下拉选项
   */
  seletOption: Array<{ name: string; value: number | string }> = []

  /**
   * 是否由设备上传导致数据发生变化
   */
  isAutoChange = false

  /**
   * 时间选择器是否显示
   */
  timePickerRef: any = { pickerVisible: false }

  // 监听设定值（设备上传的值，未格式化）
  @Watch('value')
  onValueChange(newVal: string | number) {
    this.setValue = this.dataValueFormat(newVal).out // 将接收到的设备数据格式化为前端组件能够处理的值
    this.timePickerManualSet(this.setValue as Date)
    // this.isAutoChange = true
    // console.log('input value', newVal)
  }

  // 监听 mqtt 获取当前值
  @Watch('$mqtt_device_data')
  onMqttDeviceDataChange(v) {
    // 获取设备编码 DeviceNo 、关联数据定义 Associate （即当前值的信息）
    const { DeviceNo, Associate, dataType } = this.data
    // 获取当前值的 key 和单位信息 Unit 、格式化 Format
    const { key } = Associate
    // 通过 DeviceNo 和 key 获取当前值
    const nowVal = v[DeviceNo].data[key] || ''
    const setVal = v[DeviceNo].data[dataType] || ''
    // 格式化当前值
    this.nowValue = this.dataValueFormat(nowVal, this.data.Associate.Format).out
    // 格式化设定值
    this.setValue = this.dataValueFormat(setVal).out
    this.timePickerManualSet(this.setValue as Date)

    // this.isAutoChange = true
  }

  @Watch('timePickerRef.pickerVisible')
  onPickerVisibleChange(isVisible) {
    this.$nextTick(() => {
      // 只有当时间选择器消失，且数据改变了，才下发时间数据
      if (!isVisible && this.isChange) {
        this.onBeforeSend()
      }
    })
  }

  created() {
    const setValCof = this.data
    const nowValCof = this.data.Associate
    this.setValueMax = $mqttData._format(setValCof.dataFormat)['max'] || $mqttData.unitFormat(this.data.Unit, 'max') || this.setValueMax
    this.setValueMin = $mqttData._format(setValCof.dataFormat)['min'] || $mqttData.unitFormat(this.data.Unit, 'min') || this.setValueMin
    this.setValueUnit = $mqttData.unitFormat(setValCof.Unit)
    this.nowValueUnit = $mqttData.unitFormat(nowValCof.Unit)

    this.seletOption = $mqttData._format(this.data.dataFormat).options || []

    // 当$mqtt_device_data中有当前设备的数据时，手动设置设定值和当前值
    if (this.$mqtt_device_data[this.data.DeviceNo]) {
      this.onMqttDeviceDataChange(this.$mqtt_device_data)
    }
  }

  mounted() {
    if (this.$refs.timePicker) {
      this.timePickerRef = this.$refs.timePicker // 保存对 timePicker 组件的引用
    }
  }

  onSeletChange() {
    if (this.isChange) {
      this.onBeforeSend()
    }
  }

  onSetValueInputChange(newVal) {
    // let _unit = this.$utils.isJsonString(this.data.Unit) ? JSON.parse(this.data.Unit) : ['', '']
    // 如果有最大、最小值才需要进行判断
    if ($_.isFinite(this.setValueMax) && $_.isFinite(this.setValueMin)) {
      const numberVal = $_.toNumber(newVal)
      if ($_.isNaN(numberVal)) {
        this.validateMsg = this.$t('pleaseEnter').toString() + this.$t('number').toString()
        this.isNotValidate = true
      } else {
        const setValIn = this.dataValueFormat(numberVal).in // 格式化后要输出到设备的设定值
        const maxSetValIn = this.dataValueFormat(this.setValueMax).in // 格式化后要输出到设备的设定值所允许的最大值
        const minSetValIn = this.dataValueFormat(this.setValueMin).in // 格式化后要输出到设备的设定值所允许的最小值
        if (setValIn >= maxSetValIn) {
          this.validateMsg = `输入的数值不能大于${this.setValueMax}${this.setValueUnit}`
          this.isNotValidate = true
        } else if (setValIn <= minSetValIn) {
          this.validateMsg = `输入的数值不能小于${this.setValueMin}${this.setValueUnit}`
          this.isNotValidate = true
        } else {
          this.validateMsg = ''
          this.isNotValidate = false
        }
      }
    }
  }

  /**
   * 修改后的设定值(已经转换为设备能够处理的数据)
   */
  get setValueChange() {
    return this.dataValueFormat(this.setValue).in
  }
  /**
   * 设定值是否修改了
   */
  get isChange() {
    return String(this.setValueChange) !== String(this.value)
  }

  // 取消修改设定值
  setValueCancel() {
    this.validateMsg = ''
    this.isNotValidate = false
    this.setValue = this.dataValueFormat(this.value).out
    this.timePickerManualSet(this.setValue as Date)
  }

  // 手动设置时间选择器的旧时间
  timePickerManualSet(val: Date) {
    if (this.timePickerRef.picker) {
      this.timePickerRef.picker.oldHours = val.getHours()
      this.timePickerRef.picker.oldMinutes = val.getMinutes()
      this.timePickerRef.picker.oldSeconds = val.getSeconds()
      this.timePickerRef.picker.handleCancel()
    }
  }

  // 发送修改后的设定值
  setValueSend() {
    this.$emit('input', this.setValueChange)
    this.$emit('change')
  }

  onBeforeSend() {
    if (!this.isNotValidate && this.isChange) {
      const _val = this.dataValueFormat(this.setValueChange)

      MessageBox.confirm(`是否将${this.controlName}的${this.data.DataName}设置为：${_val.show}`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.setValueSend()
        })
        .catch(() => {
          this.setValueCancel()
        })
    }
  }

  // 数据转换
  dataValueFormat(value, format = this.data.dataFormat, datatype = this.data.componentDataType, Unit = this.data.Unit) {
    // 将从“设备”接收到的数据value,格式化为“前端组件”能够处理的值
    const _out = $mqttData.outFormat({ Format: format, DataType: datatype }, value)
    // 将用户通过“前端组件”修改的数据value,格式化为“设备”能够处理的值
    const _in = $mqttData.inFormat({ Format: format, DataType: datatype }, value)
    // 将从“设备”接收到的数据value，格式化为能“直接展示”的值
    const _show = $mqttData.showFormat({ Unit: Unit, Format: format, DataType: datatype }, value)
    return { out: _out, in: _in, show: _show }
  }
}
</script>
<style lang="scss" scoped>
@import '~@assets/scss/variables.scss';
.set-and-now-input {
  display: flex;
  flex-direction: column;
  margin: 0 $spacing-size;
  .set-input,
  .now-input {
    display: flex;
    align-items: baseline;
    padding: 0 0 $spacing-small-size 0;
    margin: $spacing-small-size 0 0 0;
    .input-name {
      width: 3em;
      flex-shrink: 0;
    }
    .input-val {
      margin: 0 $spacing-small-size;
      width: 100%;
      text-align: center;
    }
    .input-unit {
    }
  }
  .set-input {
    border-bottom: 1px dotted;
    // border-bottom-color: inherit;
  }
}
</style>
