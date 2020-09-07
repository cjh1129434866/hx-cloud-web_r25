/*
 * @Author       : jiapeng.Zheng
 * @Date         : 2020-03-17 15:56:38
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-30 16:42:38
 * @Description  : 项目 CLI 配置 https://cli.vuejs.org/zh/config/#vue-config-js
 */

const { resolve } = require('./config/utils.js')
const { IsReport, IsPro, Title } = require('./config/index.js')
const { genHtmlWebpackTagsPluginOptions } = require('./config/lib.config.js')

module.exports = {
  productionSourceMap: !IsPro,
  // https://cli.vuejs.org/zh/guide/css.html#css-modules
  css: {
    requireModuleExtension: true,
    extract: false, // 将组件中的 CSS 动态注入到 JavaScript 中的 inline 代码
    loaderOptions: {
      css: {
        modules: {
          localIdentName: IsPro ? '[hash:base64:7]' : '[path][name]__[local]' // '[name]-[hash]'
        }
      }
    }
  },
  configureWebpack: {
    resolve: {
      alias: {
        '@assets': resolve('src/assets'),
        '@constants': resolve('src/constants'),
        '@router': resolve('src/router'),
        '@prototype': resolve('src/prototype'),
        '@views': resolve('src/views'),
        '@pages': resolve('src/views/pages'),
        '@comp': resolve('src/components'),
        '@store': resolve('src/store'),
        '@helper': resolve('src/helper'),
        '@services': resolve('src/services'),
        '@mixins': resolve('src/mixins'),
        '@img': resolve('src/assets/images')
      }
    },
    externals: {
      exceljs: 'ExcelJS'
    }
  },
  chainWebpack: config => {
    /** 去除生产环境下的 console 和 debugger */
    config.when(IsPro, config =>
      config.optimization.minimizer('terser').tap(args => {
        args[0].terserOptions.compress.warnings = false
        args[0].terserOptions.compress.drop_console = true
        args[0].terserOptions.compress.drop_debugger = true
        args[0].terserOptions.compress.pure_funcs = ['console.log']
        return args
      })
    )

    // /** 包拆分 */
    // const splitOptions = config.optimization.get('splitChunks')
    // config.optimization.splitChunks({
    //   ...splitOptions,
    //   cacheGroups: {
    //     ...splitOptions.cacheGroups,
    //     element: {
    //       name: 'element',
    //       test: /[\\/]node_modules[\\/]element-ui[\\/]/,
    //       chunks: 'initial',
    //       // 默认组的优先级为负数，以允许任何自定义缓存组具有更高的优先级（默认值为0）
    //       priority: 0
    //     }
    //   }
    // })

    /** 修改 vue-cli 中关于 svg 文件处理的配置 */
    config.module.rule('svg').include.add(resolve('src/assets/images')) // 只处理 images 目录下的svg文件

    /** 添加 svg-sprite-loader 处理 src/assets/icons 目录下的 svg */
    config.module
      .rule('svg-sprite')
      .test(/\.svg$/)
      .include.add(resolve('src/assets/icons')) // icons 目录下的svg文件由 svg-sprite-loader 处理
      .end()
      .use('svg-sprite')
      .loader('svg-sprite-loader')
      .options({
        symbolId: '[name]-[hash:7]',
        runtimeCompat: true
      })

    /** 包分析 */
    config.when(IsReport, config => {
      config.plugin('webpack-bundle-analyzer').use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin)
    })

    /** 引入外部第三方库（非 node 模块） */
    const webpackTagsOptions = genHtmlWebpackTagsPluginOptions()
    webpackTagsOptions.forEach((option, i) => {
      config.plugin(`html-webpack-tags-plugin-${i}`).use(require('html-webpack-tags-plugin'), [option])
    })

    /** lodash 按需加载 */
    config.plugin('lodash-webpack-plugin').use(require('lodash-webpack-plugin'), [
      {
        // If you'd like to enable shorthands you can do so with the plugin options.
        // https://github.com/lodash/lodash-webpack-plugin/issues/150
        shorthands: true
      }
    ])
  },

  pages: {
    app: {
      // page 的入口
      entry: resolve('src/main.ts'),
      // 模板来源
      template: resolve('public/index.html'),
      // 在 dist/index.html 的输出
      filename: 'index.html',
      //  template 中的 title 标签需要是 <title><%= htmlWebpackPlugin.options.title %></title>
      title: Title
    }
  },

  devServer: {
    proxy: {
      '/test': { target: 'http://192.168.100.3:8082' },
      '/Images': { target: 'http://www.hexucloud.com:18003' }, // 'http://192.168.40.206:8003',
      '/Files': { target: 'http://www.hexucloud.com:18003' }, // 'http://192.168.40.206:8003',
      '/api': { target: 'http://www.hexucloud.com:18003' }, // 'http://192.168.40.206:8003',
      '/videoapi': {
        target: 'https://open.ys7.com', // target host
        pathRewrite: {
          '^/videoapi': '/api' // rewrite path
        },
        headers: {
          host: 'open.ys7.com'
        }
      }
    }
  }
}
