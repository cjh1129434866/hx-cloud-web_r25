<!--
 * @Author: jiapeng.Zheng
 * @Date: 2019-08-12 08:49:40
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-31 16:32:45
 * @Description:
 -->
<template>
  <div class="module-content full-content">
    <div class="map-wrap">
      <div id="areaMap" style="height:100%"></div>
      <el-card class="draw-overlayers-card">
        <el-radio-group v-model="areaType">
          <el-radio v-for="(value, key) in amap_overlays_type_dic" :label="key" :key="key">{{ value }}</el-radio>
        </el-radio-group>
        <el-button type="info" size="small" v-if="!isCanDraw" @click="startDraw(areaType)">开始绘制</el-button>
        <el-button type="danger" size="small" v-else @click="endDraw">结束绘制</el-button>
        <!-- 临时添加的关闭按钮 -->
        <el-button type="danger" size="small" @click="$vueRouterGenerator.goBackByHistoryPath($route.fullPath)">{{ $t('close') }}</el-button>
        <br />
        <br />
        <span class="info">操作说明：圆和矩形通过拖拽来绘制，其他覆盖物通过点击来绘制</span>
      </el-card>
    </div>

    <el-dialog :visible="isDialogVisible" width="30%" @close="isDialogVisible = false" class="edit-dialog area-set-edit" :show-close="false" :close-on-click-modal="false">
      <span slot="title" class="el-dialog__title">{{ isUpdate ? $t('edits') : $t('adds') }}{{ $t('area') }}</span>
      <el-form :model="fillForm" :rules="rules" ref="fillForm">
        <div class="form-group col-sm-11 area-form">
          <el-form-item label="区域名称" prop="AreaName">
            <el-input v-model="fillForm.AreaName"></el-input>
          </el-form-item>
          <el-form-item label="地域" prop="Regions" v-show="!isUpdate">
            <EasyScrollbar class="sidenav-scrollbar" :barOption="barOption">
              <div class="area-set-tree">
                <el-tree
                  :data="regions"
                  :props="{
                    label: 'name',
                    children: 'child'
                  }"
                  node-key="id"
                  @check-change="handleCheckChange"
                  show-checkbox
                  ref="regionsTree"
                ></el-tree>
              </div>
            </EasyScrollbar>
          </el-form-item>
        </div>
      </el-form>
      <span slot="footer">
        <el-button type="cancel" @click="cancelSavcData">{{ $t('cancel') }}</el-button>
        <el-button type="primary" @click="saveData">{{ $t('confirm') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { $utils } from '@helper'
import { DEFAULT_POSITION } from '@constants/index'
import { BAR_OPTION } from '@constants/easyScrollbarConfig/index.js'
import ThemeColor from '@constants/theme/color'
import { AMAP_OVERLAYS_TYPE_DIC, REGION_TOP_CODE } from '@constants/dictionaries'
import { OVERLAYS_TYPE_CONFIG, OVERLAYS_OPTION, OVERLAYS_HOVER_OPTION } from '@constants/amapConfig'

let __this

export default {
  name: 'area-set',

  props: {},

  data() {
    return {
      barOption: BAR_OPTION, // EasyScrollbar 滚动条配置
      initCode: REGION_TOP_CODE, // 顶级的区域编码
      codeLength: 3, // 每一级区域编码的长度
      isDialogVisible: false, // 编辑窗是否显示
      isUpdate: false, // 是新增还是编辑
      isEdit: false, // 是否处于编辑中
      isCanDraw: false, // 是否可以绘制
      areaType: 'circle', // 当前要绘制的覆盖物类型
      amap_overlays_type_dic: AMAP_OVERLAYS_TYPE_DIC, // 覆盖物类型字典
      overlays_type_config: OVERLAYS_TYPE_CONFIG, // 覆盖物类型配置
      overlays_option: OVERLAYS_OPTION, // 覆盖物属性配置
      overlays_hover_option: OVERLAYS_HOVER_OPTION, // 覆盖物hover的属性配置
      regions: [
        {
          code: '0',
          Name: '请选择地域'
        }
      ],
      parentNodeflag: { 0: true }, // 保存状态为indeterminate的节点的code
      // 当前选中的覆盖物
      selectOverlay: {
        index: 0,
        type: '',
        obj: null,
        data: {}
      },
      fillForm: {
        AreaName: '',
        AreaPathObj: {}
      },
      rules: {
        AreaName: [
          {
            required: true,
            message: '请输入区域名称',
            trigger: 'blur'
          },
          {
            min: 2,
            max: 10,
            message: '长度在 2 到 10 个字符',
            trigger: 'blur'
          }
        ]
      },
      parentOverlay: null, // 父级覆盖物
      editOverlay: null, // 处于编辑中的覆盖物对象
      contextMenu: null, // 右键菜单
      mapObj: null, // 地图对象
      mouseTool: null, // 鼠标工具对象
      zoom: 5, // 地图初始化层级
      zooms: [5, 18] // 地图层级范围
    }
  },
  computed: {},

  components: {},

  watch: {
    areaType(newVal) {
      if (this.isCanDraw) {
        this.drawArea(newVal)
      }
    },
    isEdit() {
      this.contextMenuInit()
    },
    async parentOverlay(newVal) {
      console.log(newVal)
      if (newVal) {
        const regionsList = await this.$apis.areaRegion.getListArea(newVal.data.Id, this.$store.state.userInfo.groupId)
        this.regions = regionsList.data
        console.log(this.regions)
      } else {
        const regionsList = await this.$apis.areaRegion.getListArea(101, this.$store.state.userInfo.groupId)
        this.regions = regionsList.data
      }
    },
    $theme(newVal) {
      const styleName = 'amap://styles/' + ThemeColor[newVal].amap
      this.mapObj.setMapStyle(styleName)
    }
  },

  async created() {
    __this = this
  },

  mounted() {
    this.mapInit()
  },

  filters: {},

  methods: {
    mapInit() {
      let _zoom
      // -------------- 地图 -----------------------
      this.mapObj = new AMap.Map('areaMap', {
        resizeEnable: true,
        zoom: this.zoom,
        zooms: this.zooms,
        center: DEFAULT_POSITION.split(',')
      })

      this.mapObj.setMapStyle(`amap://styles/${ThemeColor[this.$theme].amap}`)
      this.mapObj.on('moveend', () => {
        // console.log('moveend', this.mapObj.getBounds())
      })
      this.mapObj.on('zoomstart', () => {
        _zoom = this.mapObj.getZoom()
      })
      this.mapObj.on('zoomend', () => {
        // 若地图缩小且父级区域存在，则删除父级覆盖物
        if (_zoom > this.mapObj.getZoom() && this.parentOverlay) {
          this.mapObj.remove(this.parentOverlay.boundsArea)
          this.parentOverlay = null
        }
        // 缩放期间关闭绘制地图的功能
        this.endDraw()
        // 缩放后，重新加载区域，主要是隐藏不在同一级的区域
        __this.mapAreaInit(this.mapObj.getZoom())
      })
      // -------------- 鼠标工具插件 ------------------
      this.mapObj.plugin(['AMap.MouseTool'], function() {
        __this.mouseTool = new AMap.MouseTool(__this.mapObj)
        // 监听draw事件可获取画好的覆盖物
        __this.mouseTool.on('draw', function(e) {
          // MouseTool.Rectangle 绘制后生成的对象是个多边形(polygon)，不能通过 RectangleEditor 编辑
          // 必须把他(polygon)转换为矩形(rectangle)
          if (__this.areaType === 'rectangle') {
            __this.mapObj.remove(e.obj)
            e.obj = __this.overlays_type_config['rectangle'].init({ bounds: e.obj.getBounds() })
            __this.mapObj.add(e.obj)
          }
          // 为覆盖物对象添加 "名称" 和 "右键点击事件"
          console.log(e.obj)
          __this.addPostData(e.obj) // 新增
        })
      })
      // ----------------- 右键菜单 ---------------------------
      this.contextMenu = new AMap.ContextMenu() // 创建右键菜单
      this.contextMenuInit()
      // ------------------ 获取覆盖物数据 ------------------
      this.mapAreaInit(this.zoom) // 获取第一级区域，初始化
    },
    // 右键菜单初始化
    contextMenuInit() {
      if (this.isEdit) {
        this.contextMenu.removeItem('删除该区域', this.remove)
        this.contextMenu.removeItem('编辑该区域', this.edit)
        this.contextMenu.addItem('保存', this.save, 2)
      } else {
        this.contextMenu.addItem('删除该区域', this.remove, 0)
        this.contextMenu.addItem('编辑该区域', this.edit, 1)
        this.contextMenu.removeItem('保存', this.save)
      }
    },
    // 获取地域编码
    getRegionsCode() {
      const data = this.$refs.regionsTree.getCheckedNodes()
      const selectNode = []
      for (const i in this.parentNodeflag) {
        if (this.parentNodeflag[i]) {
          const treeData = $utils.treeDataFormat({ data, idName: 'Code', parentIdName: 'ParentCode', parentNodeflag: i })
          for (const j of treeData) {
            selectNode.push(j.Code)
          }
        }
      }
      return selectNode
    },
    // 保存最顶级的地域编码的Code
    handleCheckChange(data, checked, indeterminate) {
      if (indeterminate === true) {
        this.parentNodeflag[data.Code] = true // 保存子菜单选中单非全选的父节点Code的
      } else if (this.parentNodeflag[data.Code] === true) {
        this.parentNodeflag[data.Code] = false // 清除子菜单选中单非全选的父节点Code的
      }
    },
    // 异步加载子级地域
    /* async loadRegions(node, resolve) {
      console.log(node)
      let regionsList
      if (node.level === 0) {
        regionsList = await this.$apis.areaRegion.getListArea(0)
        if (this.parentOverlay) {
          regionsList = { Data: this.parentOverlay.data.regionsList }
        }
      } else {
        console.log(node)
        regionsList = await this.$apis.areaRegion.getListArea(node.data.id)
      }
      return resolve(regionsList.data)
    }, */
    // 初始化区域
    async mapAreaInit(zoom) {
      try {
        const data = await this.$apis.areaRegion.findListRegion(this.initCode, this.$store.state.userInfo.groupId)
        zoom = zoom - this.zoom + 2
        this.mapObj.clearMap() // 清除所有的覆盖物
        // 格式化覆盖物数据
        data.data.child.forEach((item, index) => {
          if (item.id !== this.initCode && item.radius) {
            item = {
              Id: item.id,
              AreaPathObj: JSON.parse(item.radius),
              AreaName: item.name,
              code: item.id,
              parentCode: item.parentId,
              regionsList: item.child,
              FullPath: item.fullPath,
              Point: item.point
            }
            // 生成覆盖物
            const thisOverlays = this.overlays_type_config[item.AreaPathObj.type].init(item.AreaPathObj)
            const textMark = this.drawAreaName(item)
            // 只显示对应层级的区域和选中区域的下一级区域，3（this.codeLength）代表每一级的code的长度是3（this.codeLength）的倍数
            if (item.code.length === zoom * this.codeLength || (this.parentOverlay ? item.parentCode === this.parentOverlay.code : false)) {
              // 为覆盖物绑定事件
              this.overlaysBindEvent(thisOverlays, textMark, item, index)
              this.mapObj.add(thisOverlays)
            } else {
              thisOverlays.hide()
              textMark.hide()
            }
          }
        })
        // 添加父级限制区域
        if (this.parentOverlay) {
          const boundsArea = this.overlays_type_config[this.parentOverlay.type].init(this.parentOverlay.data.AreaPathObj, true)
          this.parentOverlay.boundsArea = boundsArea
          this.mapObj.add(boundsArea)
        }
      } catch (error) {
        console.error(error)
        this.$message.error(String(error))
      }
    },
    // 新增、编辑提交时的附属信息
    addPostData(obj, isUpdate) {
      this.isUpdate = isUpdate
      console.log(obj.getOptions())
      const { path, center, radius } = obj.getOptions()
      // 判断区域是否符合规范（半径大于1，组成路径的所有点不在同一位置）
      const isCanSave =
        radius > 1 ||
        (!!path &&
          path.filter(item => {
            return !(item.O === path[0].O && item.P === path[0].P && item.lat === path[0].lat && item.lng === path[0].lng)
          }).length > 1)
      if (isCanSave) {
        // 如果修改后或新增的区域符合规范，则新增区域名称
        this.isDialogVisible = true
        this.fillForm = {
          AreaName: isUpdate ? this.selectOverlay.data.AreaName : '',
          AreaPathObj: {
            obj,
            path,
            center,
            radius,
            type: '',
            bounds: obj.getBounds()
          }
        }
      } else {
        // 若不符合规范，且是修改则重新加区域，主要是为了还原被修改了的区域
        // 若不符合规范，且是新增则删除该覆盖物
        !isUpdate ? this.mapObj.remove(obj) : this.mapAreaInit(this.mapObj.getZoom())
      }
    },
    // 绘制区域名称
    drawAreaName(data) {
      let position = [0, 0]
      const areaPathObj = data.AreaPathObj
      if (areaPathObj.path !== undefined) {
        areaPathObj.path.forEach(i => {
          position[0] += i.lng
          position[1] += i.lat
        })
        position[0] = position[0] / areaPathObj.path.length
        position[1] = position[1] / areaPathObj.path.length
      } else {
        position = [areaPathObj.center.lng, areaPathObj.center.lat]
      }
      const textMark = new AMap.Text({
        text: data.AreaName, // + '(' + data.code + ')',
        textAlign: 'center', // 'left' 'right', 'center',
        verticalAlign: 'middle', // middle 、bottom
        style: {
          background: 'none',
          border: 'none',
          padding: 0
        },
        position: position
      })
      this.mapObj.add(textMark)

      return textMark
    },
    // 用 mouseTool 插件绘制区域
    drawArea(type) {
      this.mouseTool[type]({
        ...this.overlays_option
        // 同Polygon的Option设置
      })
    },
    // 开始绘制，根据 areaType 绘制各种类型的覆盖物
    startDraw(type) {
      // 绘制前必须保证父级覆盖物的存在，或处于地图的最顶级
      if (!this.parentOverlay && this.zoom !== this.mapObj.getZoom()) {
        this.$message.error('请选择父级区域')
      } else {
        this.isCanDraw = true
        this.selectOverlay = {}
        this.drawArea(type)
      }
    },
    // 结束绘制，关闭 mouseTool 插件的绘制功能，并清空 selectOverlay
    endDraw() {
      this.isCanDraw = false
      this.selectOverlay = {}
      this.mouseTool.close()
    },
    // 为覆盖物绑定事件
    overlaysBindEvent(obj, textMark, data, index) {
      obj.on('rightclick', function(_e) {
        // 只有不处于编辑中 或者 编辑中的本身 才能显示右键菜单
        if (!__this.isCanDraw && (!__this.isEdit || obj === __this.selectOverlay.obj)) {
          __this.selectOverlay = { obj, textMark, index: index, data: data, type: data.AreaPathObj.type }
          __this.contextMenu.open(__this.mapObj, _e.lnglat)
        }
      })
      obj.on('mouseover', function() {
        obj.setOptions(__this.overlays_hover_option)
      })
      obj.on('mouseout', function() {
        obj.setOptions(__this.overlays_option)
      })
      obj.on('click', function() {
        const center = textMark.getPosition()
        const zoom = __this.mapObj.getZoom()
        __this.parentOverlay = { code: data.code, obj, textMark, index: index, data: data, type: data.AreaPathObj.type }
        __this.mapObj.setZoomAndCenter(zoom + 1, [center.lng, center.lat])
      })
    },
    // 保存区域数据
    saveData() {
      this.$refs.fillForm.validate(async valid => {
        if (!valid) return
        const data = this.fillForm
        const isUpdate = this.isUpdate
        data.RegionCode = this.initCode
        // data.parentCode = this.parentOverlay ? this.parentOverlay.code : null
        data.parentCode = this.parentOverlay ? this.parentOverlay.code : this.initCode
        data.FullPath = this.parentOverlay ? `${this.parentOverlay.data.FullPath}/${data.AreaName}` : data.AreaName
        data.AreaPathObj.obj = ''
        try {
          if (isUpdate) {
            // 编辑
            data.Id = this.selectOverlay.data.Id
            data.AreaPathObj.type = this.selectOverlay.type
            data.AreaPathObj = JSON.stringify(data.AreaPathObj)
            console.log(data)
            const result = await this.$apis.areaRegion.regionSave(data, this.$store.state.userInfo.groupId)
            this.$message.info(result.message)
          } else {
            // 新增
            data.AreaCode = this.getRegionsCode().toString()
            data.AreaPathObj.type = this.areaType
            data.AreaPathObj = JSON.stringify(data.AreaPathObj)
            console.log(data)
            const result = await this.$apis.areaRegion.regionAdd(data, this.$store.state.userInfo.groupId)
            this.$message.info(result.message)
          }
          this.isDialogVisible = false
          // 修改、新增区域后重新加载区域,为了给新增的区域绑定事件
          this.mapAreaInit(this.mapObj.getZoom())
        } catch (error) {
          data.AreaPathObj = JSON.parse(data.AreaPathObj)
          console.error(error)
          this.$message.error(String(error))
        }
      })
    },
    // 取消保存
    cancelSavcData() {
      if (this.isUpdate) {
        // 编辑过程中取消，重新加载区域，主要是为了还原被修改了的区域
        this.mapAreaInit(this.mapObj.getZoom())
      } else {
        // 新增过程中取消，删除该覆盖物
        this.mapObj.remove(this.fillForm.AreaPathObj.obj)
      }
      this.isDialogVisible = false
    },
    // 右键菜单中的保存事件
    save() {
      this.isEdit = false
      this.editOverlay.close()
    },
    // 右键菜单中的编辑事件
    edit() {
      const { type, obj, textMark } = this.selectOverlay
      const { editPlugin } = this.overlays_type_config[type]
      this.editOverlay = new AMap[editPlugin](this.mapObj, obj)
      this.isEdit = true
      // this.editOverlay.close() 会触发 end 事件
      this.editOverlay.on('end', function(e) {
        __this.addPostData(e.target, true) // 编辑
      })
      textMark.hide()
      this.editOverlay.open()
    },
    // 右键菜单中的删除事件
    async remove() {
      this.mapObj.remove(this.selectOverlay.obj)
      this.mapObj.remove(this.selectOverlay.textMark)
      try {
        const result = await this.$apis.areaRegion.regionRemove(this.selectOverlay.data.code, this.$store.state.userInfo.groupId)
        this.$message.info(result.message)
      } catch (error) {
        // 区域删除失败后后重新加载区域,为了还原删除的区域
        this.mapAreaInit(this.mapObj.getZoom())
        this.$message.error(String(error))
        console.error(error)
      }
    }
  }
}
</script>
<style lang="scss">
@import '~@assets/scss/variables.scss';
.area-set-edit {
  min-width: 500px;
  .area-set-tree {
    max-height: 300px;
  }
}
</style>
