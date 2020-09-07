/*
 * @Author: jiapeng.Zheng
 * @Date: 2019-09-19 09:40:58
 * @LastEditors: jiapeng.Zheng
 * @LastEditTime: 2019-09-25 13:38:17
 * @Description: dll 构建命令
 */
// https://github.com/shelljs/shelljs
require('./check-versions')()

// process.env.NODE_ENV = 'production'

let ora = require('ora')
let chalk = require('chalk')
let shell = require('shelljs')
let webpack = require('webpack')
let merge = require('webpack-merge')
let dllConfig = require('../config/dll.config')
let spinner = ora('building DLL ...')

shell.rm('-rf', dllConfig.dllOutPutDirectory)
shell.rm('-rf', dllConfig.dllManifestDirectory)
shell.mkdir('-p', dllConfig.dllOutPutDirectory)
shell.mkdir('-p', dllConfig.dllManifestDirectory)
// 必须先删除上次生成的 dll，再引用 ./webpack.dll.conf ，否则 ./webpack.dll.conf 会 require 上次生成的  [name]-manifest.json
let webpackDllConfig = require('./webpack.dll.conf')

/**
 * 根据 config 打包生成 dll
 * @param {webpack.Configuration}   config  webpack打包是的配置
 */
const runWebpack = function(config) {
  return new Promise(function(resolve, reject) {
    webpack(config, function(err, stats) {
      if (err) {
        reject(err)
      } else {
        process.stdout.write(
          stats.toString({
            colors: true,
            modules: false,
            children: false,
            chunks: false,
            chunkModules: false
          }) + '\n\n'
        )
        resolve()
        console.log(chalk.cyan('  Build complete.\n'))
      }
    })
  }).catch(error => {
    throw error
  })
}
// 由于 webpackDllConfig 中可能需要通过 DllReferencePlugin ，require 上一级打包后的文件
// 故无法使用multicompiler(https://webpack.js.org/api/node/#multicompiler)方式构建
;(async function() {
  for (let i = 0; i < webpackDllConfig.length; ++i) {
    let config = webpackDllConfig[i]
    try {
      // 手动引用父级打包后的文件
      if (config.DllReferencePluginOptions) {
        config.DllReferencePluginOptions.forEach(element => {
          config = merge(config, {
            plugins: [
              new webpack.DllReferencePlugin({
                context: element.options.context,
                manifest: require(element.options.manifestPath)
              })
            ]
          })
        })
        // 删除掉 webpack 中不存在的 DllReferencePluginOptions ，防止构建时报错
        delete config.DllReferencePluginOptions
      }
      spinner.start()
      // 同步打包
      await runWebpack(config)
    } catch (error) {
      console.error(error)
    } finally {
      spinner.stop()
    }
  }
})()

// runWebpack(dllConfig.getConfig()).then(() => runWebpack(dllConfig.getRefConfig()))

// webpack(webpackDllConfig, function(err, stats) {
//   spinner.stop()
//   if (err) throw err
//   process.stdout.write(
//     stats.toString({
//       colors: true,
//       modules: false,
//       children: false,
//       chunks: false,
//       chunkModules: false
//     }) + '\n\n'
//   )

//   console.log(chalk.cyan('  Build complete.\n'))
// })
