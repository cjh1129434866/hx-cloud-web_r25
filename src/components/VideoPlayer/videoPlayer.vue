<!--
 * @Author       : jiapeng.Zheng
 * @Date         : 2020-03-04 11:14:15
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-27 10:29:46
 * @Description  : 播放器
 -->
<template>
  <div class="video-wrap" ref="videoWrapDom">
    <!-- 摄像头列表 -->
    <div class="video-list" :class="{ fixed: videoCompStat.isVideoListFixed }" v-if="isVideoListShow" @mouseenter="isVideoListHover = true" @mouseleave="isVideoListHover = false">
      <!-- 删除、编辑按钮(列表hover时才可见) -->
      <!-- 列表 -->
      <EasyScrollbar class="scroll-list-wrap" ref="ScrollListWrap">
        <div class="scroll-list">
          <span v-if="!videoList.length" class="no-data">暂无数据</span>
          <span
            v-for="video in videoList"
            :key="video.Id"
            @click="onVideoItemClick(video)"
            class="scroll-item hover"
            :class="{ actived: !!activedVideo && activedVideo.Id === video.Id }"
          >
            <span class="item-name" :title="video.VideoName">{{ video.VideoName }}</span>
            <span class="edit-btns">
              <span class="btn edit-btn el-icon-edit" :title="$t('edits')" @click.stop="onEditClick(video)"></span>
              <span class="btn del-btn el-icon-delete" :title="$t('deletes')" @click.stop="onDelClick(video)"></span>
            </span>
          </span>
        </div>
      </EasyScrollbar>
      <!-- 列表底部操作区域(新增按钮) -->
      <div class="list-footer">
        <span class="add-btn hover el-icon-plus" @click="onAddClick"></span>
      </div>
    </div>
    <div class="video-split-line" :class="{ 'is-list-hidden': !isVideoListShow }" @mouseenter="isVideoListHover = true" @mouseleave="isVideoListHover = false">
      <span v-if="videoCompStat.isVideoListFixed" class="list-show-btn" @click="videoCompStat.isVideoListFixed = false">
        <icon name="video/fixed"></icon>
      </span>
      <span
        v-else
        class="list-show-btn"
        :class="{ 'el-icon-caret-left': isVideoListShow, 'el-icon-caret-right': !isVideoListShow }"
        @click="videoCompStat.isVideoListFixed = true"
      ></span>
    </div>
    <!-- 通用播放器组件 -->
    <player-view class="video-player" :playerParam="activedVideo"></player-view>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Emit, Watch, Provide } from 'vue-property-decorator'
import PlayerView from './layout/playerView.vue'
import $document from '@helper/document'

@Component({ components: { PlayerView } })
export default class VideoPlayer extends Vue {
  @Provide() videoCompStat: VideoCompStat = { isVideoListFixed: false, OSDTime: null, isFull: false }
  @Prop({
    default() {
      return []
    }
  })
  videoList: Array<VideoParam> // 摄像头列表

  isVideoListHover = false // 列表是否hover
  activedVideo: VideoParam = null

  @Watch('videoList')
  onVideoListChange() {
    this.activedVideo = null // 当列表数据发生变化时
  }

  @Watch('videoCompStat.isFull')
  onIsFullChange(isFull) {
    const videoWrapDom = this.$refs.videoWrapDom
    if (isFull) {
      $document.fullScreen(videoWrapDom)
    } else {
      $document.exitFullScreen()
    }
  }

  get isVideoListShow() {
    // 当列表固定时，列表一直显示
    // 当列表不固定时，列表的显示与否由 isVideoListHover 决定
    return this.videoCompStat.isVideoListFixed || this.isVideoListHover
  }

  created() {
    console.log('created')
  }

  onVideoItemClick(item: VideoParam) {
    this.activedVideo = item
    this.isVideoListHover = false
  }

  // @Emit('onAddClick')
  onAddClick() {
    this.$emit('onAddClick')
  }
  // 删除
  onDelClick(item: VideoParam) {
    this.$confirm(`是否删除“${item.VideoName}”摄像头？`, '提示', {
      cancelButtonClass: 'el-button--cancel',
      closeOnClickModal: false
    })
      .then(() => {
        this.$emit('onDelClick', item.Id)
      })
      .catch(() => {
        // this.$message.warning('取消删除')
      })
  }

  @Emit('onEditClick')
  onEditClick(item: VideoParam) {
    return item
  }

  // mounted() {}

  // destroyed() {}
}
</script>
<style lang="scss" scoped>
@import '~@assets/scss/mixins.scss';

$list-width: 20%;

.video-wrap {
  display: flex;
  width: 100%;
  height: 100%;
  .video-list,
  .video-split-line {
    position: absolute;
    z-index: 1;
    height: 100%;
  }
  .video-list {
    width: $list-width;
    // overflow-y: auto;
    display: flex;
    flex-direction: column;
    justify-items: stretch;
    &.fixed {
      position: relative;
    }
    .scroll-list-wrap {
      margin: 5px;
      flex-grow: 1;
      height: 100%;
      .scroll-list {
        display: flex;
        flex-direction: column;
        .scroll-item {
          padding: 5px;
          position: relative;
          .item-name {
            display: block;
            @include text-overflow();
          }
          .edit-btns {
            display: none;
            position: absolute;
            top: 5px;
            right: 5px;
            .btn:not(:last-child) {
              padding-right: 0.5em;
            }
          }
          &:hover {
            .edit-btns {
              display: block;
            }
          }
        }
      }
    }

    .list-footer {
      text-align: center;
      padding: 10px;
      .add-btn {
        cursor: pointer;
        width: 100%;
        height: 100%;
      }
    }
  }
  .video-split-line {
    width: 10px;
    left: $list-width;
    &.is-list-hidden {
      left: 0;
    }
    .list-show-btn {
      cursor: pointer;
      // position: absolute;
      // top: 50%;
      @include absolute-center();
      border-radius: 0px 5px 5px 0;
      height: 20px;
      line-height: 20px;
    }
  }
  .video-player {
    flex-grow: 1;
  }
}
</style>
