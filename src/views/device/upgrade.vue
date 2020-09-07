<!--
 * @Author: jiapeng.Zheng
 * @Date: 2018-12-29 14:12:50
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-04-07 15:44:20
 * @Description: 设备升级
 -->
<template>
  <el-dialog :visible="isVisible" width="30%" @close="onClose" class="edit-dialog" append-to-body :show-close="false" :close-on-click-modal="false">
    <span slot="title" class="el-dialog__title">{{ $t('device') + $t('upgrades') }}</span>
    <el-form class="upgrade-form" :model="upgradeForm" :rules="upgradeFormRules" ref="upgradeForm">
      <el-form-item :label="$t('nowVersion') + ':'">{{ upgradeForm.nowVersion }}</el-form-item>
      <el-form-item :label="$t('packetSize') + ':'" prop="binSize">
        <el-input-number :disabled="isUpgrade" v-model="upgradeForm.binSize" :min="biteSize" :step="biteSize"></el-input-number>
      </el-form-item>
      <el-form-item :label="$t('sysOfNum') + ':'" prop="sysOfNum">
        <el-select v-model="upgradeForm.sysOfNum" :disabled="isUpgrade" :placeholder="$t('pleaseSelect') + $t('sysOfNum')">
          <el-option class="new-version-option" v-for="(item, index) in sysOfNumList" :key="index" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('upgradeFile') + ':'" prop="newVersionId">
        <el-select v-model="upgradeForm.newVersionId" :disabled="isUpgrade" :placeholder="$t('pleaseSelect') + $t('upgradeFile')" @change="newVersionChange">
          <el-option class="new-version-option" v-for="item in updateFileList" :key="item.Id" :label="item.fileName" :value="item.Id">
            <span class="option-left">【{{ typeFileDic[item.Level] }}】{{ item.fileName }}</span>
            <span class="option-right">{{ item.Version }}</span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('nowStatus') + ':'">{{ this.nowStatus }}</el-form-item>
      <el-progress v-if="progressIsVisible" :text-inside="true" :stroke-width="18" :percentage="percentage" :status="status"></el-progress>
    </el-form>
    <span slot="footer">
      <el-button type="cancel" :disabled="isUpgrade && !isSendFileAllComplate" @click="isVisible = false">{{ $t('cancel') }}</el-button>
      <el-button type="primary" :disabled="isUpgrade" @click="onUpgrade_one_getSate">{{ !isUpgrade ? $t('upgrades') : $t('upgrading') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { $ajax, $crc } from '@helper'
import { DECIVE_UPGRADE_TIME } from '@constants/index'
import { TYPE_FILE_DIC } from '@constants/dictionaries'

let _this

export default {
  name: 'device-upgrade',

  props: {
    value: {
      type: Boolean,
      required: true
    },
    nowVersion: {
      type: String
      // ,required: true
    },
    deviceNo: {
      type: String,
      required: true
    },
    typeId: {
      type: Number,
      required: true
    }
  },

  data() {
    return {
      isUpgrade: false, // 设备是否升级中，若为true，则不允许选择 newVersionId 和点击“升级按钮”
      isSendFileAllComplate: false, // 文件是否全部下发完成
      isVisible: false, // 是否现在“设备升级”弹窗
      progressIsVisible: false, // 是否显示进度条
      percentage: 0, // 进度条百分比
      status: '', // 进度条状态(获取文件和下发文件功能同一进度条)
      nowStatus: '', // 当前状态
      // 设备升级中的所有提示信息
      statusString: {
        zero: '',
        one: '1、获取设备状态中',
        one_error: '设备不需要升级！',
        two: '2、获取升级包中',
        two_error: '获取升级包失败！',
        three: '3、升级包下发中',
        four: '4、设备升级中',
        four_success: '设备升级成功'
      },
      topicObj: {}, // 订阅的主题
      // 设备升级时所需的额外信息
      upgradeForm: {
        deviceNo: '',
        nowVersion: '',
        newVersionId: '',
        sysOfNum: '10', // 默认是十进制，兼容旧设备，旧设备只允许上传十进制的数据
        binSize: 88, // 单包数据大小默认是88，兼容旧设备，旧设备单包数据最大只能是88
        newVersionObj: {}
      },
      biteSize: 4, // 每一次发送的数据包大小（必须是4的整数倍，不包括两位crc校验位）
      binArray: [], // 设备升级所需的总的数据包
      upgradeTimeOut: null, // 文件下发定时器
      sysOfNumList: [
        { label: '十进制', value: '10' },
        { label: '十六进制', value: '16' }
      ],
      typeFileDic: TYPE_FILE_DIC,
      updateFileList: [], // [{ id: '2', name: 'v2.0.1', url: '/test/fish.bin', describe: '新增自动重启功能' }], // 设备各个版本的信息
      upgradeFormRules: {
        newVersionId: [
          {
            required: true,
            type: 'number',
            message: this.$t('pleaseSelect') + this.$t('upgradeFile'),
            trigger: 'blur'
          }
        ],
        sysOfNum: [
          {
            required: true,
            message: this.$t('pleaseSelect') + this.$t('sysOfNum'),
            trigger: 'blur'
          }
        ],
        binSize: [
          {
            required: true,
            trigger: 'change',
            validator: (rule, value, callback) => {
              if (value % 4 === 0) {
                callback()
              } else {
                callback(new Error(`${this.$t('packetSize')}必须是${this.biteSize}的整数倍`))
              }
            }
          }
        ]
      }
    }
  },

  computed: {},

  watch: {
    async value(newVal) {
      if (newVal) {
        // ================== 获取设备升级文件列表 ==================
        const typeObj = this.$commonParam.deviceType.filter(element => {
          return this.typeId === element.Id
        })
        if (typeObj && typeObj.length > 0) {
          const { UpdateFile } = typeObj[0] // 设备类型ID是唯一的，因此 typeObj 的长度必定小于或等于1
          this.updateFileList = UpdateFile // []
          // UpdateFile.forEach(element => {
          //   let { Id, Url, Version, fileName } = element
          //   this.updateFileList.push({ id: Id, name: Version, url: Url, describe: fileName }) // { id: '2', name: 'v2.0.1', url: '/test/fish.bin', describe: '新增自动重启功能' }
          // })
        }
      }
      // ===================重置各个参数===================
      this.isUpgrade = false
      this.isSendFileAllComplate = false
      this.progressIsVisible = false
      this.nowStatus = ''
      this.upgradeForm.nowVersion = this.nowVersion
      this.upgradeForm.deviceNo = this.deviceNo
      this.isVisible = newVal
      this.destroyTopic() // 清空主题索引
      // ==================== 订阅主题 =====================
      if (newVal) {
        // 订阅设备升级消息，为了获取设备升级期间的各个状态
        const topicIndex = await this.$apis.deviceControl.subscribeAllDeviceData(this.upgradeForm.deviceNo, message => {
          if (message.state === 'ready') {
            // 设备允许升级，从服务器获取升级文件
            this.onUpgrade_two_getFile()
          } else if (message.state === 'refuse') {
            // 设备不用升级
            this.nowStatus = this.statusString['one_error']
            this.isUpgrade = false
          } else if (message.state === 'complete') {
            // 第 package - 1 个升级包下发成功，发送第 package 个升级包
            clearTimeout(this.upgradeTimeOut)
            this.upgradeTimeOut = null
            this.onUpgrade_three_sendFile(message.package * 1)
          } else if (message.state === 'error') {
            // 第 package - 1 个升级包下发失败，重新下发第 package - 1 个升级包
            this.onUpgrade_three_sendFile(message.package * 1 - 1)
          } else if (message.state === 'success') {
            // 设备升级成功，3秒后刷新页面
            this.nowStatus = this.statusString['four_success']
            this.isUpgrade = false
            this.$countDownMessage.alert({
              __this: _this,
              type: 'warning',
              time: 3,
              content: this.statusString['four_success'],
              timeOverContent: '自动刷新页面',
              callback: () => {
                window.location.reload()
              }
            })
          }
        })
        // 保存订阅的主题索引
        this.topicObj[this.upgradeForm.deviceNo].push(topicIndex)
      }
    }
  },
  components: {},

  created() {
    _this = this
  },

  destroyed() {
    this.destroyTopic()
  },
  methods: {
    /**
     * 新版本选择change，通过 val 获取选中版本的信息
     * @param {} id 选中的版本信息ID
     */
    newVersionChange(id) {
      const selectVersion = this.updateFileList.filter(item => {
        return item.Id === id
      })
      this.upgradeForm.newVersionObj = selectVersion[0]
    },
    /**
     * 格式化“升级文件”
     * 把 ArrayBuffer 转为 Uint8Array，并分成 arrayBuffer/ upgradeForm.binSize + 1 个包
     * 同时为每个包添加crc校验位
     * @param {ArrayBuffer} arrayBuffer 文件的二进制数据缓冲区
     */
    newVersionDataFormat(arrayBuffer) {
      const arrayObj = { packet: [] }
      const byteArray = new Uint8Array(arrayBuffer)
      const array = Array.from(byteArray)
      const arrayLn = array.length
      const packetNum = Math.ceil(arrayLn / this.upgradeForm.binSize)
      // 分包
      for (let i = 0; i < packetNum; i++) {
        // 分包
        const startIndex = i * this.upgradeForm.binSize
        const endIndex = (i + 1) * this.upgradeForm.binSize > arrayLn ? arrayLn : (i + 1) * this.upgradeForm.binSize
        const packet = array.slice(startIndex, endIndex)
        // 最后一个包末尾补 255
        const suffix_ff = this.$_.fill(Array(this.upgradeForm.binSize - packet.length), 255)
        packet.push(...suffix_ff)
        // 生成crc校验
        const crcValidationByte = $crc.ToModbusCRC16(packet)
        packet.push(parseInt(crcValidationByte.substring(0, 2), 16), parseInt(crcValidationByte.substring(2, 4), 16)) // 添加crc检验位
        arrayObj.packet.push(packet)
      }
      return arrayObj
    },
    /**
     * 升级事件_1：获取设备状态
     */
    onUpgrade_one_getSate() {
      this.$refs.upgradeForm.validate(async valid => {
        if (!valid) return
        // 获取设备的status
        this.nowStatus = this.statusString['one']
        this.isUpgrade = true
        const { Version, Level, fileName } = this.upgradeForm.newVersionObj
        this.$apis.deviceControl.getDeviceUpgradeState(this.upgradeForm.deviceNo, Version, {
          Level: Level,
          SoftwareName: fileName
        })
      })
    },
    // 升级事件_2：获取文件
    async onUpgrade_two_getFile() {
      const { newVersionObj } = this.upgradeForm
      try {
        this.nowStatus = this.statusString['two']
        this.progressIsVisible = true
        // 获取“升级文件”
        const arrayBuffer = await $ajax.getArrayBuffer(newVersionObj.Url, {
          // `onDownloadProgress` 允许为下载处理进度事件
          onDownloadProgress: function(p) {
            _this.percentage = Math.floor(100 * (p.loaded / p.total) * 100) / 100
            if (_this.percentage >= 100) {
              _this.status = 'success'
            }
          }
        })
        // 格式化“升级文件”
        const arrayObj = this.newVersionDataFormat(arrayBuffer)
        this.binArray = arrayObj.packet // 保存文件的 arrayBuffer
        // 分包发送“升级文件”
        this.progressIsVisible = true // 显示进度条
        this.status = '' // 重置进度条状态
        this.percentage = 0 // 重置进度条百分比
        this.onUpgrade_three_sendFile(0) // 发送第一个数据包
      } catch (error) {
        this.isUpgrade = false
        this.nowStatus = `${String(error)} ${this.statusString['two_error']}`
        console.error(error)
        this.$message.error(String(error))
      } finally {
        // this.isUpgrade = false
      }
    },
    /**
     * 升级事件_3：分包下发“升级文件”
     * @param {Number} index 升级文件 binArray 的索引
     */
    onUpgrade_three_sendFile(index) {
      // 下发是否完成
      if (this.percentage >= 100) {
        this.status = 'success'
        this.isSendFileAllComplate = true
        this.progressIsVisible = false
        this.nowStatus = this.statusString['four']
      } else {
        const packetNum = this.binArray.length
        this.nowStatus = `${this.statusString['three']}(${index + 1}/${packetNum})`

        let upgradeData = this.binArray[index]
        // 若设备支持16进制的数据
        if (this.upgradeForm.sysOfNum === '16') {
          upgradeData = Array.prototype.map.call(this.binArray[index], x => ('00' + x.toString(16)).slice(-2)).join('')
        }
        // 下发第 packetNum 个包
        this.$apis.deviceControl.sendUpgradeData(this.upgradeForm.deviceNo, {
          index: index + 1,
          count: packetNum,
          data: upgradeData
        })
        // 设备超时定时器，若在 DECIVE_UPGRADE_TIME 时间内设备没有返回 complete，则重新下发该数据包
        this.upgradeTimeOut = setTimeout(() => {
          this.onUpgrade_three_sendFile(index)
        }, DECIVE_UPGRADE_TIME)

        this.percentage = Math.floor(((index + 1) / packetNum) * 100 * 100) / 100
      }
    },
    destroyTopic() {
      for (const i in this.topicObj) {
        this.$apis.deviceControl.destroyedDevicePubMessageArrived(i, this.topicObj[i])
      }
      this.topicObj[this.upgradeForm.deviceNo] = [] // 清空主题索引
    },
    onClose() {
      this.$emit('input', this.isVisible)
    }
  }
}
</script>

<style type="text/css" lang="scss">
// @import '~@assets/scss/variables.scss';
.upgrade-form.el-form {
  .el-form-item {
    margin-bottom: 1rem;
  }
}
</style>
