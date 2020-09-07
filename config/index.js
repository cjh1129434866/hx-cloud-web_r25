/*
 * @Author: jiapeng.Zheng
 * @Date: 2018-12-04 09:43:05
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-27 17:42:39
 * @Description:
 */
// see http://vuejs-templates.github.io/webpack for documentation.
// var path = require('path')

const { resolve } = require('./utils')

const NODE_ENV = process.env.NODE_ENV // 当前构建模式
const PUBLIC_PATH = '/' // 静态资源的访问路径
const PUBLIC_DIR = '/public/' //  // 静态资源所在的目录

const EnvConfig = {
  // 生产环境
  build: {
    env: 'production',
    // 高德地图申请的key
    amapKey: '3dd036e852211fae367aab243157100e',
    mqtt: {
      hostname: 'www.hexucloud.com',
      port: '18820',
      clintId: 'example-zjp',
      username: 'admin',
      password: 'password'
    }
  },
  // 开发环境
  dev: {
    env: 'development',
    // 高德地图申请的key
    amapKey: '3dd036e852211fae367aab243157100e',
    mqtt: {
      hostname: 'www.hexucloud.com', // 192.168.100.1
      port: '18820', // 1882
      clintId: 'example-zjp',
      username: 'admin',
      password: 'password'
    }
  }
}

const CommonConfig = {
  Title: '村镇污水处理管理云平台',
  PublicPath: PUBLIC_PATH, // 静态资源的访问路径
  PublicDir: resolve(PUBLIC_DIR), // 静态资源所在的目录
  LibPath: `${PUBLIC_PATH}js/lib`, // 本地第三方文件访问路径
  LibDir: resolve(`${PUBLIC_DIR}js/lib`), // 本地第三方文件所在的目录
  EzuikitPath: `${PUBLIC_PATH}js/ezuikit26`, // 本地“萤石UIKit库”访问路径
  EzuikitDir: resolve(`${PUBLIC_DIR}js/ezuikit26`), // 本地“萤石UIKit库”所在的目录
  IsReport: process.env.analyz_report === 'true', // 是否启用“包分析”
  IsDev: NODE_ENV === 'development', // 是否处于“开发模式”（开发环境）
  IsPro: NODE_ENV === 'production', // 是否处于“生产模式”（正式环境）
  IsTest: NODE_ENV === 'test', // 是否处于“测试模式”（测试环境）
  // 与环境相关的配置
  EnvConfig: {
    ...EnvConfig[NODE_ENV === 'production' ? 'build' : 'dev']
  }
}

module.exports = { ...CommonConfig }
