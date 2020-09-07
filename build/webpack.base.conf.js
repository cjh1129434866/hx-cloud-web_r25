/*
 * @Author: jiapeng.Zheng
 * @Date: 2018-08-13 13:55:10
 * @LastEditors: jiapeng.Zheng
 * @LastEditTime: 2019-10-30 16:29:05
 * @Description:
 */
var path = require('path')
var chalk = require('chalk')
// var webpack = require('webpack')
var utils = require('./utils')
var config = require('../config')
var libConfig = require('../config/lib.config.js')
var vueLoaderConfig = require('./vue-loader.conf')
var svgoConfig = require('../config/svgo-config.json')
var ProgressBarPlugin = require('progress-bar-webpack-plugin')
var HappyPack = require('happypack')
var os = require('os')
var happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length })
var ExtractTextPlugin = require('extract-text-webpack-plugin')

function resolve(dir) {
  return path.join(__dirname, '..', dir)
}

// var cssLoader = ExtractTextPlugin.extract({
//   use: ['happypack/loader?id=happy-css'],
//   fallback: 'vue-style-loader'
// })

var cssLoaderFn = function(options) {
  if (options.extract) {
    return ExtractTextPlugin.extract({
      use: ['happypack/loader?id=happy-css'],
      fallback: 'vue-style-loader'
    })
  } else {
    return ['vue-style-loader'].concat('happypack/loader?id=happy-css')
  }
}
// inject happypack accelerate packing for vue-loader @17-08-18
Object.assign(vueLoaderConfig.loaders, {
  // 以下配置会导致所有无 "lang" 特性的 <script> 标签加载 coffee-loader
  // js: 'coffee-loader',
  ts: 'ts-loader',
  tsx: 'babel-loader!ts-loader',
  js: 'happypack/loader?id=happy-babel-vue',
  css: cssLoaderFn({ extract: process.env.NODE_ENV === 'production' })
})

function createHappyPlugin(id, loaders) {
  return new HappyPack({
    id: id,
    loaders: loaders,
    threadPool: happyThreadPool,
    // make happy more verbose with HAPPY_VERBOSE=1
    verbose: process.env.HAPPY_VERBOSE === '1'
  })
}

module.exports = {
  entry: {
    app: './src/main.ts'
  },
  output: {
    path: config.build.assetsRoot,
    filename: '[name].js',
    publicPath: process.env.NODE_ENV === 'production' ? config.build.assetsPublicPath : config.dev.assetsPublicPath
  },
  resolve: {
    // 自动解析确定的扩展。默认值为： [".js", ".json"]，能够使用户在引入模块时不带扩展
    extensions: ['.js', '.vue', '.json', '.ts', '.tsx'],
    modules: [resolve('src'), resolve('node_modules')],
    alias: {
      // vue$: 'vue/dist/vue.common.js',
      // 必須使用 vue.runtime.esm.js ，因为 element-ui 对 vue 的引用也是使用 vue.runtime.esm.js
      // https://github.com/ElemeFE/element/issues/8242
      vue$: 'vue/dist/vue.runtime.esm.js',
      '@': resolve('src'),
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
  module: {
    noParse: /node_modules\/(element-ui\.js)/,
    rules: [
      {
        test: /\.(js|vue)$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        include: [resolve('src')],
        options: {
          formatter: require('eslint-friendly-formatter')
        }
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        enforce: 'pre',
        loader: 'tslint-loader'
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          'babel-loader',
          {
            loader: 'ts-loader',
            options: { appendTsxSuffixTo: [/\.vue$/] }
          }
        ]
      },
      {
        test: /\.svg$/,
        enforce: 'pre',
        loader: 'svgo-loader?' + JSON.stringify(svgoConfig),
        include: /assets\/icons/
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        include: [resolve('src')],
        options: vueLoaderConfig
      },
      {
        test: /\.js$/,
        loader: 'happypack/loader?id=happy-babel-js',
        // exclude: /node_modules/,
        include: [resolve('src')]
      },
      // {
      //   test: /\.worker\.js$/,
      //   loader: 'worker-loader',
      //   options: { inline: true }
      //   // use: [],
      //   // // options: { inline: true },
      //   // include: [resolve('src/webWorkers')]
      // },
      {
        test: /\.svg$/,
        loader: 'happypack/loader?id=happy-svg',
        include: [resolve('src/assets/icons')]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        include: [resolve('src/assets/images')],
        use: [
          {
            loader: 'url-loader',
            query: {
              limit: 8192,
              name: utils.assetsPath('img/[hash:7].[ext]')
            }
          },
          {
            // 压缩图片要在file-loader之后使用
            loader: 'image-webpack-loader',
            options: {
              bypassOnDebug: true
            }
          }
        ]
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        query: {
          limit: 8192,
          name: utils.assetsPath('fonts/[hash:7].[ext]')
        }
      }
    ]
  },
  // externals: {
  //   exceljs: 'ExcelJS',
  // },
  externals: (() => {
    let externals = {}
    libConfig.externals.forEach(ele => {
      externals[ele.key] = ele.webpackExternalsOption
    })
    return externals
  })(),
  // node: { fs: 'empty' },
  plugins: [
    new ProgressBarPlugin({
      format: '  build [:bar] ' + chalk.green.bold(':percent') + ' (:elapsed seconds)'
    }),
    ...utils.createDllReferencePlugins(),
    ...utils.createHtmlWebpackIncludeAssetsPlugins(),
    createHappyPlugin('happy-babel-js', ['babel-loader?cacheDirectory=true']),
    createHappyPlugin('happy-babel-vue', ['babel-loader?cacheDirectory=true']),
    createHappyPlugin('happy-css', ['css-loader']),
    createHappyPlugin('happy-svg', [
      // https://github.com/kisenka/svg-sprite-loader/blob/v0/README.md
      'svg-sprite-loader?' +
        JSON.stringify({
          name: process.env.NODE_ENV === 'production' ? '[hash:7]' : '[path][name]'
        })
    ]),
    // https://github.com/amireh/happypack/pull/131
    new HappyPack({
      loaders: [
        {
          path: 'vue-loader',
          query: {
            loaders: {
              scss: 'vue-style-loader!css-loader!sass-loader?indentedSyntax'
            }
          }
        }
      ]
    })
  ]
}
