<template>
  <ul class="icon-list">
    <li v-for="(index, iconName) in typeIcon" :key="index" :title="iconName" @click="iconClicks(iconName)">
      <span>
        <i>
          <icon class="icons" :name="iconName"></icon>
        </i>
      </span>
    </li>
  </ul>
</template>
<script lang="ts">
import { Component, Emit, Prop, Vue } from 'vue-property-decorator'
import Icons from '@assets/icons'

interface IaconsType {
  [propName: string]: any
}

@Component
export default class IconListx extends Vue {
  @Prop({ default: '' }) type: string

  Icons = Icons
  typeIcon: IaconsType = {}

  tet = 12

  created() {
    if (this.type) {
      const typeIcon = {}
      for (const icon in this.Icons) {
        if (icon.indexOf(this.type) > -1) {
          typeIcon[icon] = this.Icons[icon]
        }
      }
      this.typeIcon = typeIcon
    } else {
      this.typeIcon = this.Icons
    }
  }

  @Emit('iconClick')
  iconClicks(iconName: string) {
    return iconName
    // this.$emit('iconClick', iconName)
  }
}

// export default {
//   name: 'IconListd',

//   props: {
//     type: {
//       type: String,
//       default: ''
//     }
//   },

//   data() {
//     return {
//       Icons: Icons,
//       typeIcon: {}
//     }
//   },

//   computed: {},

//   created() {
//     if (this.type) {
//       let typeIcon = {}
//       for (let icon in this.Icons) {
//         if (icon.indexOf(this.type) > -1) {
//           typeIcon[icon] = this.Icons[icon]
//         }
//       }
//       this.typeIcon = typeIcon
//     } else {
//       this.typeIcon = this.Icons
//     }
//   },

//   mounted() {},

//   watch: {},

//   methods: {
//     iconClick(iconName) {
//       this.$emit('iconClick', iconName)
//     }
//   }
// }
</script>
<style type="text/css" lang="scss">
@import '~@assets/scss/variables.scss';
.icon-list {
  overflow: hidden;
  list-style: none;
  padding: 0;
  border: 1px solid $border-grey;
  border-radius: $radius-size;
}
.icon-list li {
  cursor: pointer;
  float: left;
  padding: 0 5px;
  text-align: center;
  height: 50px;
  line-height: 60px;
  transition: color 0.15s linear;
  border-right: 1px solid $border-grey;
  border-bottom: 1px solid $border-grey;
  margin-right: -1px;
  margin-bottom: -1px;
  &:hover {
    i {
      .icons {
        color: $white;
      }
    }
  }
}
.icon-list li i {
  display: block;
  font-size: $icon-large-size;
  margin-bottom: 15px;
  .icons {
    margin: 0;
  }
}
.icon-list li:after {
  content: '';
  height: 100%;
}
.icon-list li span {
  line-height: normal;
  font-family: Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, SimSun, sans-serif;
}
.icon-list li:after,
.icon-list li span {
  display: inline-block;
  vertical-align: middle;
}
</style>
