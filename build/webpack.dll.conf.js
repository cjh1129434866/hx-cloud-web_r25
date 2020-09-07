/*
 * @Author: jiapeng.Zheng
 * @Date: 2019-01-07 08:49:38
 * @LastEditors: jiapeng.Zheng
 * @LastEditTime: 2019-09-24 14:43:01
 * @Description:
 */

const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
let merge = require('webpack-merge')
let path = require('path')
let webpack = require('webpack')
let config = require('../config')
let dllConfig = require('../config/dll.config')
let env = process.env.NODE_ENV === 'production' ? config.build.env : config.dev.env

// 生成 dll 公用的 webpack 配置
let webpackDllConfig = {
  // entry: dllConfig.dllEntry,
  output: {
    path: dllConfig.dllOutPutDirectory, // resolve('static/js'), // path.resolve(__dirname, '../static/js'),
    filename: '[name].dll.js',
    library: '[name]_library'
  },
  // https://webpack.js.org/configuration/performance/
  performance: {
    maxAssetSize: 450000 // 构建输出时文件大于 maxAssetSize （默认值为: 250000, 单位: B）进行提示
  },
  resolve: {
    // 自动解析确定的扩展。默认值为： [".js", ".json"]，能够使用户在引入模块时不带扩展
    extensions: ['.js', '.vue', '.json']
  },
  module: {
    loaders: [
      {
        test: /\.vue$/,
        loader: ['vue-loader']
      }
      // {
      //   test: /\.js$/,
      //   loader: 'babel-loader',
      //   include: [resolve('node_modules/easyscroll'), resolve('node_modules/element-ui/src/utils/clickoutside')]
      // }
    ]
  },
  // node: { fs: 'empty' },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': env
    }),
    /*
    @desc: https://webpack.js.org/plugins/module-concatenation-plugin/
    "作用域提升(scope hoisting)",使代码体积更小[函数申明会产生大量代码](#webpack3)
    */
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /zh-cn|en-gb/),
    new webpack.DllPlugin({
      path: path.join(dllConfig.dllManifestDirectory, '/[name]-manifest.json'), // path.join(__dirname, './dll/', '[name]-manifest.json'),
      libraryTarget: 'commonjs2',
      name: '[name]_library'
    }),
    // // webpack.optimize.UglifyJsPlugin 无法压缩ES6代码
    // new webpack.optimize.UglifyJsPlugin({
    //   compress: {
    //     warnings: false
    //   }
    // })
    // uglifyjs-webpack-plugin@1.3.0 能够压缩ES6代码
    new UglifyJsPlugin({
      cache: true,
      parallel: true,
      sourceMap: false // set to true if you want JS source maps
    })
  ]
}

/**
 * 为拆分后的 webpack 配置添加非公用的 Plugin
 * @param { webpack.Configuration } webpackConfig
 */
function addPlugin(webpackConfig) {
  // 添加 webpack-bundle-analyzer 插件
  if (config.build.bundleAnalyzerReport) {
    var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
    webpackConfig.plugins.push(
      new BundleAnalyzerPlugin({
        analyzerPort: 'auto'
      })
    )
  }
  return webpackConfig
}

/**
 * 根据 refs 拆分生成 dll 所需的 webpack 配置
 * @param { webpack.Configuration } webpackConfig webpack 配置
 * @param { {libs:Array<string>,childRef?: []} } refs
 * @description 拆分dll https://www.jb51.net/article/148535.htm
 */
function splitEntry(webpackConfig, refs = {}) {
  let result = []
  let childRefs = {}
  let childWebpackConfig = webpackConfig || {}
  let entry = {}
  // 遍历 refs
  Object.keys(refs).forEach(key => {
    // 对 refs 中同层级的 dll 生成同一个配置
    entry[key] = refs[key].libs
    if (refs[key].childRef) {
      // 合并当前层级的子级配置
      Object.keys(refs[key].childRef).forEach(childKey => {
        childRefs[`${key}_${childKey}`] = refs[key].childRef[childKey]
      })
      // 子级的 dll 通过 DllReferencePlugin 引用父级打包出来的 dll；
      // 由于当前父级 dll 还未生成，当前无法通过 new webpack.DllReferencePlugin(options) 引用父级打包后的dll,
      // 故只保存引用父级dll所需的配置（即 DllReferencePlugin 的配置）
      childWebpackConfig = merge(childWebpackConfig, {
        DllReferencePluginOptions: [
          {
            name: 'DllReferencePlugin',
            options: {
              context: path.resolve(__dirname, '..'),
              manifestPath: path.join(dllConfig.dllManifestDirectory, `/${key}-manifest.json`)
            }
          }
        ]
      })
    }
  })
  // 保存当前层级的 dll 配置
  result.push(
    merge(addPlugin(webpackConfig), {
      entry: entry
    })
  )
  // 递归保存子级的 dll 配置
  if (Object.keys(childRefs).length) {
    result = result.concat(splitEntry(childWebpackConfig, childRefs))
  }

  return result
}

module.exports = splitEntry(webpackDllConfig, dllConfig.dllRef)
