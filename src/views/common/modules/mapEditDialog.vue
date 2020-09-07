<!--
 * @Author: jiapeng.Zheng
 * @Date: 2019-08-12 08:49:40
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-31 16:51:47
 * @Description:
 -->
<!-- 设备地址编辑 -->
<template>
  <el-dialog :visible="isVisible" @close="onClose" class="edit-dialog" :close-on-click-modal="false" :show-close="false">
    <span slot="title" class="el-dialog__title">{{ option.title }}</span>

    <div id="containerx" class="device-edit-map-wrap"></div>
    <div class="amap-sug-tip">
      <el-form :rules="rules" label-width="0" onsubmit="return false;">
        <div class="form-group col-sm-12">
          <el-form-item label prop="PositionName">
            <el-input :id="elInputId" :placeholder="$t('pleaseEnter') + $t('address')"></el-input>
          </el-form-item>
        </div>
      </el-form>
    </div>

    <span slot="footer">
      <el-button type="cancel" @click="isVisible = false">{{ $t('cancel') }}</el-button>
      <el-button type="primary" @click="onSureClick">{{ $t('confirm') }}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { DEFAULT_POSITION } from '@constants/index'
import ThemeColor from '@constants/theme/color'
import { $document } from '@helper'

let self

export default {
  name: 'map-edit-dialog',

  props: {
    value: {
      type: Boolean,
      required: true
    },
    option: {
      type: Object,
      default() {
        return { title: '编辑' }
      }
    },
    mapInfo: {
      type: Object,
      default() {
        return {}
      }
    }
  },

  data() {
    return {
      isVisible: false,
      elInputId: 'keyword',
      inputId: 'keywordInput',
      fillForm: {
        PositionName: '',
        Position: ''
      },
      rules: {},
      infoWindow: null,
      geocoder: null,
      markers: [],
      mapData: [{ Position: DEFAULT_POSITION }],
      mapObj: null
    }
  },

  computed: {},
  watch: {
    value(newVal) {
      this.isVisible = newVal
      this.$nextTick(function() {
        if (newVal === true) {
          // 为el-input下的input设置id
          const elInput = document.getElementById(this.elInputId)
          const input = $document.getChildren(elInput, 'input')[0]
          $document.setAttr(input, 'id', this.inputId)
          // 设置地址
          const Position = this.mapInfo.Position || DEFAULT_POSITION
          this.mapData = [{ Position }]
          // 更新地图
          this.handRefresh()
        }
      })
    },
    // mapInfo() {
    //   // let Position = newVal.Position || DEFAULT_POSITION
    //   // this.mapData = [{ Position }]
    //   // // 更新地图
    //   // this.handRefresh()
    // },
    $theme(newVal) {
      const styleName = 'amap://styles/' + ThemeColor[newVal].amap
      // 弹窗第一次打开之前，mapObj 是不存在的，必须做为空的判断
      if (this.mapObj) {
        this.mapObj.setMapStyle(styleName)
      }
    }
  },

  created() {
    self = this
  },

  methods: {
    handRefresh() {
      // console.log(self.mapData)
      // --------------地图-----------------------
      self.mapObj = new AMap.Map('containerx', {
        resizeEnable: true,
        zoom: 15,
        center: self.mapData[0].Position.split(',')
      })
      self.mapObj.setMapStyle(`amap://styles/${ThemeColor[this.$theme].amap}`)
      AMap.service('AMap.Geocoder', function() {
        // 回调函数 : 实例化Geocoder
        self.geocoder = new AMap.Geocoder()
        const lnglatXys = self.mapData // 地图上所标点的坐标
        self.markers = []
        lnglatXys.forEach(lnglatXY => {
          self.fillForm.Position = lnglatXY.Position
          lnglatXY = lnglatXY.Position.split(',')
          // 根据坐标获取地址
          self.setMarker(lnglatXY)
        })
      })
      AMap.plugin('AMap.Autocomplete', function() {
        // 实例化Autocomplete
        const autoOptions = {
          city: '', // 城市，默认全国
          input: self.inputId // 使用联想输入的input的id
        }
        const autocomplete = new AMap.Autocomplete(autoOptions)
        // TODO: 使用autocomplete对象调用相关功能
        AMap.event.addListener(autocomplete, 'select', function(e) {
          // TODO 针对选中的poi实现自己的功能
          const { location, name } = e.poi
          const lnglatXY = [`${location.lng}`, `${location.lat}`]
          self.refreshMarker(lnglatXY, name)
        })
      })
    },

    // 设置点标志
    setMarker(lnglatXY) {
      self.geocoder.getAddress(lnglatXY, function(status, result) {
        if (status === 'complete' && result.info === 'OK') {
          const address = result.regeocode.formattedAddress
          self.fillForm.PositionName = address

          // 生成“点标注”
          const marker = new AMap.Marker({
            position: lnglatXY,
            title: address,
            // 允许点拖拽
            draggable: true,
            cursor: 'move',
            raiseOnDrag: true
          })
          marker.setMap(self.mapObj)
          // 为“点标注”添加点击事件
          AMap.event.addListener(marker, 'click', () => {
            self.openInfo(address, lnglatXY)
          })
          // 为“点标注”添加拖拽结束事件
          AMap.event.addListener(marker, 'dragend', eventObj => {
            const lnglat = eventObj.lnglat
            const lnglatXY = [`${lnglat.lng}`, `${lnglat.lat}`]
            // 通过新的坐标查找地址
            self.geocoder.getAddress(lnglatXY, function(status, result) {
              if (status === 'complete' && result.info === 'OK') {
                const address = result.regeocode.formattedAddress
                self.fillForm.Position = `${lnglat.lng},${lnglat.lat}`
                self.fillForm.PositionName = address
                self.openInfo(address, lnglatXY)
                // 覆盖“点标注”的点击事件
                AMap.event.addListener(marker, 'click', () => {
                  self.openInfo(address, lnglatXY)
                })
              }
            })
          })
          // 打开信息窗体
          self.openInfo(address, lnglatXY)
          self.markers.push(marker)
        } else {
          self.$message.error('地理坐标有误，获取不了地理位置')
        }
      })
    },

    // 更新点标志
    refreshMarker(lnglatXY, name) {
      // 重新设置缩放等级和中心点
      self.mapObj.setZoomAndCenter(15, lnglatXY)
      self.fillForm = {
        PositionName: name,
        Position: `${lnglatXY[0]},${lnglatXY[1]}`
      }
      // 移除点标志
      self.mapObj.remove(self.markers)
      self.markers = []
      // 关闭信息窗体
      self.infoWindow.close()
      // 重新设置点标志
      self.setMarker(lnglatXY)
    },

    openInfo: (address, lnglatXY) => {
      // 构建信息窗体中显示的内容
      const info = `<div style="padding:0px 4px;">地址 : ${address}</div>`
      self.infoWindow = new AMap.InfoWindow({
        content: info, // 使用默认信息窗体框样式，显示信息内容
        offset: new AMap.Pixel(0, -15)
      })
      self.infoWindow.open(self.mapObj, lnglatXY)
    },

    onClose() {
      this.isVisible = false
      this.$emit('input', this.isVisible)
    },

    // 必须存在，因为其父组件panelAddType提交时会调用该方法
    onSureClick() {
      console.log(this.fillForm)
      this.$emit('dispatch-data', this.fillForm)
      // this.$apis.device
      //   .updateDevicePosition(this.deviceSn, this.fillForm.Position)
      //   .then(result => {
      //     this.$message.success(result.Message)
      //     this.$emit('dispatch-data', this.fillForm)
      //     this.isVisible = false
      //   })
      //   .catch(errMsg => {
      //     this.$message.error(errMsg)
      //   })
    }
  }
}
</script>
<style type="text/css" lang="scss">
@import '~@assets/scss/variables.scss';
.device-edit-map-wrap {
  width: 100%;
  height: 435px;
}
.amap-sug-tip {
  top: 80px;
  left: 20px;
}
</style>
