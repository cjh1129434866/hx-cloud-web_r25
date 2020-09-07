/*
 * @Author: jiapeng.Zheng
 * @Date: 2019-09-17 17:29:58
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-24 16:57:22
 * @Description: DllReferencePlugin 和 DllPlugin 配置
 */
let path = require('path')
let config = require('../config')
let envConfig = process.env.NODE_ENV === 'production' ? config.build : config.dev
module.exports = {
  // DllPlugin 生成的 dll 文件所在的目录
  dllOutPutDirectory: path.resolve(__dirname, '../public/js/dll'),
  // index.html 引用 dll 的路径
  dllPublicPath: path.posix.join(envConfig.assetsPublicPath, 'public/js/dll/'),
  // DllReferencePlugin 引用 manifest 所在的目录
  dllManifestDirectory: path.resolve(__dirname, '../build/dll'),
  // build-dll 拆分第三方包
  dllRef: {
    // vue 相关的
    vendor: {
      libs: [
        // 必須使用 vue.runtime.esm.js ，因为 element-ui 对 vue 的引用也是使用 vue.runtime.esm.js
        // https://github.com/ElemeFE/element/issues/8242
        'vue/dist/vue.runtime.esm.js',
        // 'vue-class-component',
        // 'vue-property-decorator',
        'vue-i18n',
        'vue-router',
        'vuex',
        'vue-grid-layout',
        'gridmanager-vue',
        'easyscroll',
        'vue-cropper'
      ],
      // 源码中依赖了 vue 的库，通过 build-dll 构建时会引用 vendor 打包后的 dll
      childRef: {
        ui: {
          libs: ['element-ui', 'element-ui/src/utils/clickoutside', 'element-ui/src/mixins/emitter', 'element-ui/src/utils/merge']
        }
      }
    },
    // 与 vue 无关的工具类包
    plugins: {
      libs: ['babel-polyfill', 'js-cookie', 'moment', 'q', 'axios', 'md5', 'lodash']
    }
  }
}

/**
 *  还未提取到 dll 的第三方库
 *  animate.css
 */
