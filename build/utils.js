/*
 * @Author: jiapeng.Zheng
 * @Date: 2019-06-26 14:29:24
 * @LastEditors: jiapeng.Zheng
 * @LastEditTime: 2019-09-19 12:26:48
 * @Description:
 */
var fs = require('fs')
var path = require('path')
var config = require('../config')
var libConfig = require('../config/lib.config')
var dllConfig = require('../config/dll.config')
var webpack = require('webpack')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var HtmlWebpackTagsPlugin = require('html-webpack-tags-plugin')

exports.assetsPath = function(_path) {
  var assetsSubDirectory = process.env.NODE_ENV === 'production' ? config.build.assetsSubDirectory : config.dev.assetsSubDirectory
  return path.posix.join(assetsSubDirectory, _path)
}

exports.cssLoaders = function(options) {
  options = options || {}

  var cssLoader = {
    loader: 'css-loader',
    options: {
      minimize: process.env.NODE_ENV === 'production',
      sourceMap: options.sourceMap
    }
  }

  // generate loader string to be used with extract text plugin
  function generateLoaders(loader, loaderOptions) {
    var loaders = [cssLoader]
    if (loader) {
      loaders.push({
        loader: loader + '-loader',
        options: Object.assign({}, loaderOptions, {
          sourceMap: options.sourceMap
        })
      })
    }

    // Extract CSS when that option is specified
    // (which is the case during production build)
    if (options.extract) {
      return ExtractTextPlugin.extract({
        use: loaders,
        fallback: 'vue-style-loader'
      })
    } else {
      return ['vue-style-loader'].concat(loaders)
    }
  }

  // http://vuejs.github.io/vue-loader/en/configurations/extract-css.html
  return {
    css: generateLoaders(),
    postcss: generateLoaders(),
    less: generateLoaders('less'),
    sass: generateLoaders('sass', { indentedSyntax: true }),
    scss: generateLoaders('sass'),
    stylus: generateLoaders('stylus'),
    styl: generateLoaders('stylus')
  }
}

// Generate loaders for standalone style files (outside of .vue)
exports.styleLoaders = function(options) {
  var output = []
  var loaders = exports.cssLoaders(options)
  for (var extension in loaders) {
    var loader = loaders[extension]
    output.push({
      test: new RegExp('\\.' + extension + '$'),
      use: loader
    })
  }
  return output
}
// https://webpack.js.org/plugins/dll-plugin/
exports.createDllReferencePlugins = function() {
  let dllRefOptions = []
  let { dllManifestDirectory } = dllConfig
  // 根据文件路径读取文件，返回文件列表
  let files = fs.readdirSync(dllManifestDirectory)
  files.forEach(filename => {
    // 获取当前文件的绝对路径
    var filedir = path.join(dllManifestDirectory, filename)
    dllRefOptions.push({
      context: path.resolve(__dirname, '..'),
      manifest: require(filedir)
    })
  })
  return dllRefOptions.map(options => new webpack.DllReferencePlugin(options))
}

// https://github.com/jharris4/html-webpack-tags-plugin
exports.createHtmlWebpackIncludeAssetsPlugins = () => {
  let libs = []
  let dlls = []
  let { libDirectory, libPublicPath, externals } = libConfig
  let { dllOutPutDirectory, dllPublicPath } = dllConfig
  let libFiles = fs.readdirSync(libDirectory)
  // 读取 static/js/lib 目录下的文件
  libFiles.forEach(filename => {
    libs.push(filename)
  })
  // 读取 static/js/dll 目录下的文件
  let dllFiles = fs.readdirSync(dllOutPutDirectory)
  dllFiles.forEach(filename => {
    dlls.push(filename)
  })
  return [
    // 往 index.html 中注入打包后的 dll 库（static/js/dll）
    new HtmlWebpackTagsPlugin({
      tags: dlls,
      append: false,
      publicPath: dllPublicPath
    }),
    // 往 index.html 中注入本地（static/js/lib）第三方库
    new HtmlWebpackTagsPlugin({
      tags: libs,
      append: false,
      publicPath: libPublicPath
    }),
    // 往 index.html 中注入外部（cdn）第三方库
    new HtmlWebpackTagsPlugin({
      tags: externals.map(ele => {
        return ele.htmlWebpackTagsPluginTag
      }),
      append: false,
      usePublicPath: false
    })
  ]
}
