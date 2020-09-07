<!--
 * @Author: jiapeng.Zheng
 * @Date: 2019-05-29 10:52:49
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-31 17:06:36
 * @Description:
 -->
<template>
  <el-tooltip effect="danger" placement="top" :manual="true" v-model="isNotValidate" :content="validateMsg">
    <div v-if="!isEdit">
      <!-- 频率进度条 -->
      <div v-if="compstyle2.indexOf(setValueUnit[0]) > -1" class="ctrl-progress">
        <div class="progress-content">
          <div class="progress-top">
            <div class="progress-top-value" :style="{ width: percentage_compstyle2 + '%' }">
              <!-- <div
                class="value-content"
              >{{dataValueFormat(nowValue,data.Associate.Format).out}}{{nowValue?$mqttData.unitFormat(data.Associate.Unit):''}}</div>-->
              <div class="value-content">
                <el-button title="当前值/设定值" type="text" :disabled="disabled" @click="isEdit = !isEdit">
                  <span class="set-value">{{ dataValueFormat(nowValue, data.Associate.Format).out }}{{ nowValue ? $mqttData.unitFormat(data.Associate.Unit) : '' }}</span>
                  <!-- <span
                    class="set-value"
                  >{{dataValueFormat(nowValue,data.Associate.Format).out}}{{nowValue?$mqttData.unitFormat(data.Associate.Unit):''}}/{{dataValueFormat(setValue).out}}{{$mqttData.unitFormat(data.Unit)}}</span>-->
                </el-button>
              </div>
            </div>
          </div>
          <el-progress :percentage="percentage_compstyle2" :status="status" :show-text="false"></el-progress>
          <div class="progress-text">{{ setValueMax }}{{ $mqttData.unitFormat(data.Unit) }}({{ data.DataName }})</div>
        </div>
      </div>
      <!-- 其他类型的进度条  -->
      <div v-else class="ctrl-progress">
        <div class="progress-content">
          <div class="progress-top">
            <div class="progress-top-value" :style="{ width: percentage + '%' }">
              <!-- <div
                v-if="isSetInterval"
                class="value-content"
              >{{parseInt(nowValue_s)}}{{nowValue?$mqttData.unitFormat(data.Associate.Unit):''}}</div>-->
              <div v-if="isSetInterval" class="value-content">{{ percentage + '%' }}</div>
              <div v-else class="value-content">{{ dataValueFormat(nowValue, data.Associate.Format).out }}{{ nowValue ? $mqttData.unitFormat(data.Associate.Unit) : '' }}</div>
            </div>
          </div>
          <el-progress :percentage="percentage" :status="status" :show-text="false"></el-progress>
          <div class="progress-text">
            <el-button type="text" :disabled="disabled" @click="isEdit = !isEdit">
              <span class="set-value">{{ dataValueFormat(setValue).out }}{{ $mqttData.unitFormat(data.Unit) }}</span>
            </el-button>
            ({{ data.DataName }})
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <el-input size="mini" v-model="dataValueFormat(setValue).out" :disabled="disabled" @change="setValueChange" class="ctrlInput">
        <el-button slot="append" type="text" class="ctrlInputBtn" :disabled="disabled || isNotValidate" @click="setValueSend">
          {{ $mqttData.unitFormat(data.Unit) }}
          <i class="el-icon-upload2 el-icon--right"></i>
        </el-button>
      </el-input>
      <el-button class="cancelBtn" type="text" @click="setValueCancel">
        <i class="el-icon-circle-cross el-icon--right"></i>
      </el-button>
    </div>
  </el-tooltip>
</template>

<script>
import { UNIT_FREQ, UNIT_TIME, DATA_TYPE_BOOLEAN, SWITCH_ACTIVE, SWITCH_UNACTIVE } from '@constants/dataTypeConfig'
import { AUTO_MODE } from '@constants/deviceConfig'

// let self

export default {
  name: 'controllerInput',
  props: {
    value: {
      default: ''
    },
    disabled: {
      required: true
    },
    deviceInfo: {
      required: true,
      type: Object,
      default() {
        return {}
      }
    },
    data: {
      require: true,
      type: Object,
      default() {
        return {}
      }
    },
    deviceState: {
      require: true
    },
    ctrlModeConf: {
      required: true,
      type: Object,
      default() {
        return { val: '' }
      }
    },
    ctrlModeStatuVal: {
      required: true
    },
    accessoryData: {
      required: true
    }
  },
  data() {
    return {
      validateMsg: '',
      isNotValidate: false,
      isEdit: false,
      thisInterval: null,
      isGetByMqtt: true, // 是否通过mqtt获取值
      setValue: 0, // 设定值
      setValue_s: 0, // 设定值，单位秒
      setValue_change: 0, // 设定值change之后的值
      setValueUnit: [''], // 设定值的单位
      setValueMax: Math.pow(2, 31), // 最大设定值
      nowValue: 0, // 当前值
      nowValue_s: 0, // 当前值，单位秒
      status: '', // 进度条的状态, '': setValue_s <= setValue_s; 'exception': setValue_s > setValue_s
      unitCascaderProps: {
        children: 'children',
        label: 'label',
        value: 'value'
      },
      compstyle2: [UNIT_FREQ], // 第二种类型的进度条
      activeIndex: 0
    }
  },
  watch: {
    // 监听设定值
    value(newVal) {
      this.setValue = newVal
      // 设定值的单位,单位秒
      this.setValue_s = this.valueToValueS(this.setValue, this.data.Unit, this.data.dataFormat)
    },
    /**
     * 监听mqtt发送过来的数据
     * @param {string} v mqtt中的数据
     */
    $mqtt_device_data(v) {
      // 获取设备编码 DeviceNo 、关联数据定义 Associate （即当前值的信息）
      const { DeviceNo, Associate } = this.data
      // 获取当前值的 key 和单位信息 Unit 、格式化 Format
      const { key, Unit, Format } = Associate
      // 单位
      const _unit = this.$utils.isJsonString(Unit) ? JSON.parse(Unit) : ['', '']
      // 通过 DeviceNo 和 key 获取当前值
      this.nowValue = v[DeviceNo].data[key] || 0
      // 设置当前值，时间单位：秒
      this.nowValue_s = this.valueToValueS(this.nowValue, Unit, Format)

      // 当前值不等于设定值，且当前值不为0，且当前为单位为秒
      if (
        String(this.nowValue_s) !== String(this.setValue_s) &&
        _unit[0] === UNIT_TIME &&
        // _unit[1] === UNIT_TIME_S &&
        String(this.nowValue_s) !== '0'
      ) {
        const nowDataType = this.data.dataType
        // 从同一配件中筛选出除本身以外的其他单位为秒的控制项
        this.accessoryData.ControlData.forEach(element => {
          const { Unit, dataType } = element
          const { key } = element.Associate || {}
          const _unit = this.$utils.isJsonString(Unit) ? JSON.parse(Unit) : ['', '']
          if (nowDataType !== dataType && _unit[0] === UNIT_TIME && /* _unit[1] === UNIT_TIME_S && */ String(v[DeviceNo].data[key]) !== '0') {
            const changeV = JSON.parse(JSON.stringify(v))
            changeV[DeviceNo].data[key] = 0 // 清空其他时间进度条的值，防止错误数据
            this.$store.commit('$vuexSetMqttDeviceData', changeV[DeviceNo])
          }
        })
      }
    },
    /**
     * 根据 computed.isSetInterval 判断是否启动计时
     */
    isSetInterval(nv) {
      if (nv) {
        this.thisInterval = setInterval(() => {
          // 当前值小于设定值，说明倒计时不为0
          if (parseInt(this.nowValue_s) < parseInt(this.setValue_s)) {
            this.nowValue_s = parseInt(this.nowValue_s) + 1 // 当前值 +1 ,由于只有单位为秒的值才会开启定时器，故不需要对当前值进行转换，直接加1即可
          } else {
            console.error(`设定值(${this.data.dataType})小于当前值(${this.data.Associate.key})，请检查数据定义配置`)
            this.clearInterval()
          }
        }, 1000)
      } else {
        this.clearInterval()
      }
    },
    /**
     * 监听当前值，当当前值等于设定值时，执行以下规则：
     * 1、当前值置0，即关闭当前控制项的计时
     * 2、将同一配件下下一个（this.activeIndex % otherCtrl.length）单位为秒的控件的当前值置1，即开启下一控制项的计时
     * 3、切换同一配件下开关的状态
     * 4、this.activeIndex + 1
     */
    nowValue_s() {
      if (String(this.nowValue_s) === String(this.setValue_s) && this.isSetInterval) {
        // 非编辑模式下，倒计时为0时才需要重新获取数据
        // if (!this.isEdit) {
        //   // this.nowValue = 0 // 清空当前值
        //   // this.$emit('getDeviceData') // 重新获取mqtt数据
        // }
        const otherCtrl = []
        const switchCtrl = []
        // 从同一配件中筛选出除本身以外的其他单位为秒的控制项
        this.accessoryData.ControlData.forEach(element => {
          const { Associate, dataType, componentDataType } = element
          // let { key } = element.Associate || {}
          const _unit = this.$utils.isJsonString(Associate.Unit) ? JSON.parse(Associate.Unit) : ['', '']
          if (this.data.dataType !== dataType && _unit[0] === UNIT_TIME /* && _unit[1] === UNIT_TIME_S */) {
            otherCtrl.push(element)
          }
          if (this.data.dataType !== dataType && componentDataType === DATA_TYPE_BOOLEAN) {
            switchCtrl.push(element)
          }
        })
        if (otherCtrl.length > 0) {
          const { Associate } = otherCtrl[this.activeIndex % otherCtrl.length]
          const { key, Format, Unit } = Associate
          const { dataFormat, componentDataType, displayKey } = switchCtrl[this.activeIndex % switchCtrl.length]
          this.activeIndex = this.activeIndex < otherCtrl.length ? this.activeIndex + 1 : 0
          const changeV = JSON.parse(JSON.stringify(this.$mqtt_device_data[this.data.DeviceNo]))
          let ctrlVal = this.$mqttData.outFormat({ Format: dataFormat, DataType: componentDataType }, changeV.data[displayKey])
          // 反转同一配件下开关的值
          // debugger
          if (ctrlVal === SWITCH_ACTIVE) {
            ctrlVal = SWITCH_UNACTIVE
          } else if (ctrlVal === SWITCH_UNACTIVE) {
            ctrlVal = SWITCH_ACTIVE
          }
          changeV.data[displayKey] = this.$mqttData.inFormat({ Format: dataFormat, DataType: componentDataType }, ctrlVal)
          // this.valueToValueS(1, Unit, Format)
          changeV.data[key] = this.valueSToValue(1, Unit, Format) // this.$mqttData.outFormat({ Format: Format, DataType: DataType }, 1)
          changeV.data[this.data.Associate.key] = 0
          this.$store.commit('$vuexSetMqttDeviceData', changeV)
        }
      }
    }
  },
  computed: {
    // 进度条百分比
    percentage() {
      let percentage = 0
      let status = 'success'
      // 确保被除数不能为0
      if (this.setValue_s) {
        if (this.nowValue_s <= this.setValue_s) {
          percentage = Math.floor(100 * (this.nowValue_s / this.setValue_s) * 100) / 100
        } else {
          status = 'exception'
          percentage = 100 // percentage不能超过100，否则 el-progress 组件会报错
        }
      }
      /* eslint-disable vue/no-side-effects-in-computed-properties */
      this.status = status
      return percentage
    },
    // 第二种类型的进度条的百分比
    percentage_compstyle2() {
      let percentage = 0
      let status = 'success'
      // let outVal = this.dataValueFormat(this.setValue).out
      const outVal = this.dataValueFormat(this.nowValue).out
      if (outVal <= this.setValueMax) {
        percentage = Math.floor(100 * (outVal / this.setValueMax) * 100) / 100
      } else {
        status = 'exception'
        percentage = 100 // percentage不能超过100，否则 el-progress 组件会报错
      }
      /* eslint-disable vue/no-side-effects-in-computed-properties */
      this.status = status
      return percentage
    },
    // 是否启动计时
    isSetInterval() {
      const _unit = this.$utils.isJsonString(this.data.Associate.Unit) ? JSON.parse(this.data.Associate.Unit) : ['', '']
      return (
        _unit[0] === UNIT_TIME && // 单位为时间
        // _unit[1] === UNIT_TIME_S && // 单位为秒
        parseInt(this.nowValue_s) && // 当前值不为0
        String(this.nowValue_s) !== String(this.setValue_s) && // 当前值不等于设定值
        String(this.ctrlModeStatuVal) === AUTO_MODE && // 处于自动模式下
        !this.disabled &&
        this.deviceState === 'onLine'
      )
    }
  },
  filters: {},
  created() {
    // 禁用self，因为该组件会在 for 循环中被多次调用，每次调用都会 created 一次，
    // 若 created 一次都给 self 赋值，则会覆盖上一次的self
    // self = this
    const maxVal = this.$mqttData.unitFormat(this.data.Unit, 'max')
    this.setValueUnit = this.$utils.isJsonString(this.data.Unit) ? JSON.parse(this.data.Unit) : ['', '']
    this.setValueMax = maxVal || this.setValueMax
  },
  methods: {
    // 修改设定值
    setValueChange(newVal) {
      // let _unit = this.$utils.isJsonString(this.data.Unit) ? JSON.parse(this.data.Unit) : ['', '']
      const numberVal = this.$_.toNumber(newVal)
      if (this.$_.isNaN(numberVal)) {
        this.validateMsg = this.$t('pleaseEnter') + this.$t('number')
        this.isNotValidate = true
      } else if (this.dataValueFormat(numberVal).in > this.dataValueFormat(this.setValueMax).in) {
        this.validateMsg = `输入的数值不能大于${this.setValueMax}`
        this.isNotValidate = true
      } else if (
        this.setValueUnit[0] === UNIT_TIME &&
        // this.setValueUnit[1] === UNIT_TIME_S &&
        this.valueToValueS(this.dataValueFormat(numberVal).in, this.data.Unit, this.data.dataFormat) <= 10
      ) {
        this.validateMsg = '输入的数值不能小于10秒'
        this.isNotValidate = true
      } else {
        this.validateMsg = ''
        this.isNotValidate = false
        this.setValue_change = this.dataValueFormat(numberVal).in // 保存要改变的设定值
        // newVal = numberVal
      }
    },
    // 取消修改设定值
    setValueCancel() {
      this.validateMsg = ''
      this.isNotValidate = false
      this.setValue_change = 0
      this.isEdit = !this.isEdit
    },
    // 发送修改后的设定值
    setValueSend() {
      this.$emit('input', this.setValue_change)
      this.$emit('change')
      this.isEdit = false
    },
    /**
     * 将任意时间单位的值转换为单位为秒的值
     * @param unitString 单位对象
     * @param value 要转换的值
     */
    valueToValueS(value, unitString, format) {
      let valueS = value
      const _unit = this.$utils.isJsonString(unitString) ? JSON.parse(unitString) : ['', '']
      if (_unit[0] === UNIT_TIME) {
        const unitFormatObj = this.$mqttData.unitFormat(unitString, 'format')
        valueS = this.dataValueFormat(value, format).out
        if (unitFormatObj && unitFormatObj.step) {
          valueS = valueS * unitFormatObj.step
        }
      }
      return valueS
    },
    valueSToValue(value, unitString, format) {
      let valueS = value
      const _unit = this.$utils.isJsonString(unitString) ? JSON.parse(unitString) : ['', '']
      if (_unit[0] === UNIT_TIME) {
        const unitFormatObj = this.$mqttData.unitFormat(unitString, 'format')
        valueS = this.dataValueFormat(value, format).in
        if (unitFormatObj && unitFormatObj.step) {
          valueS = valueS / unitFormatObj.step
        }
      }
      return valueS
    },
    // 数据转换
    dataValueFormat(value, format = this.data.dataFormat) {
      const _out = this.$mqttData.outFormat({ Format: format, DataType: 'string' }, value)
      const _in = this.$mqttData.inFormat({ Format: format, DataType: 'string' }, value)
      return { out: _out, in: _in }
    },
    clearInterval() {
      clearInterval(this.thisInterval)
      this.thisInterval = null
    }
  }
}
</script>
<style type="text/css" lang="scss">
@import '~@assets/scss/variables.scss';
.ctrl-progress {
  display: block;
  // width: calc(100% - 160px);
  margin-top: -10px;
  .progress-content {
    // min-width: 320px;
    .progress-top {
      padding-right: 160px;
      margin-right: -160px;
      display: block;
      width: 100%;
      max-width: 410px;
      .progress-top-value {
        top: 0px;
        display: block;
        width: 100%;
        max-width: 100%;
        line-height: 15px;
        text-align: right;
        .value-content {
          // top: 0.5em;
          position: relative;
          display: inline-block;
          white-space: nowrap;
          button {
            padding-top: 0;
            padding-bottom: 0;
          }
        }
      }
    }
    .el-progress {
      padding-right: 160px;
      margin-right: -160px;
      display: inline-block;
      max-width: 410px;
      width: 100%;
    }

    .progress-text {
      display: inline-block;
      button {
        padding-top: 0;
        padding-bottom: 0;
      }
    }
  }
}
.ctrlInput {
  width: calc(100% - 45px);
  .el-input-group__append {
    .ctrlInputBtn {
      padding: 5px;
      // margin-right: -10px;
      border-radius: 0px 4px 4px 0;
      // &:hover {
      //   // margin-right: -11px;
      //   // background-color: $element-blue-color;
      //   // color: $white;
      // }
    }
    .is-disabled {
      &:hover {
        margin-right: -10px;
        background-color: $white;
        color: lighten($element-blue-color, 20%);
      }
    }
  }
}
.cancelBtn {
  color: $element-danger-color;
  &:hover {
    color: $element-danger-color;
  }
}
</style>
