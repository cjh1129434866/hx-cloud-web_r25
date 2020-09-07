/*
 * @Author: jiapeng.Zheng
 * @Date: 2019-09-18 10:13:28
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-31 17:32:37
 * @Description: 第三方静态库的配置
 */

const fs = require('fs')
const { EnvConfig, LibDir, LibPath, EzuikitPath } = require('./index')

const genHtmlWebpackTagsPluginOptions = () => {
  const _result = []
  const libTags = []
  fs.readdirSync(LibDir).forEach(filename => {
    libTags.push(filename)
  })

  // 往 index.html 中注入本地（'public/js/lib'）第三方文件
  _result.push({ tags: libTags, append: false, publicPath: LibPath })
  // 往 index.html 中注入本地萤石开发库 ezuikit26
  _result.push({ tags: ['/ezuikit.js', '/js/timeLine.js'], append: false, publicPath: EzuikitPath })
  // 往 index.html 中注入外部（cdn）第三方库
  _result.push({
    tags: [
      {
        path: `https://webapi.amap.com/maps?v=1.4.4&key=${EnvConfig.amapKey}&plugin=AMap.CircleEditor,AMap.RectangleEditor,AMap.PolyEditor,AMap.MarkerClusterer`,
        type: 'js'
      }
      // 'https://cdn.bootcss.com/exceljs/2.0.1/exceljs.min.js'
    ],
    append: false,
    usePublicPath: false
  })
  return _result
}

module.exports = {
  genHtmlWebpackTagsPluginOptions
}

// module.exports = {
//   // 在 public/index.html 中手动引用本地第三方库所在的文件夹
//   libDirectory: resolve('public/js/lib/'),
//   // 在 public/index.html 中手动引用本地第三方库的路径
//   // libPublicPath: path.posix.join(envConfig.assetsPublicPath, envConfig.assetsSubDirectory, libPath),
//   externals: [
//     // `import ${webpackExternalsOption} from '${key}'`
//     // import AMap from 'amap'
//     {
//       key: 'amap',
//       // https://webpack.js.org/configuration/externals/#externals
//       webpackExternalsOption: 'AMap',
//       // https://github.com/jharris4/html-webpack-tags-plugin#options
//       htmlWebpackTagsPluginTag: {
//         path: `https://webapi.amap.com/maps?v=1.4.4&key=${EnvConfig.amapKey}&plugin=AMap.CircleEditor,AMap.RectangleEditor,AMap.PolyEditor,AMap.MarkerClusterer`,
//         type: 'js'
//       }
//     },
//     // import EZUIKit from 'ezuikit'
//     {
//       key: 'ezuikit',
//       webpackExternalsOption: 'EZUIKit',
//       htmlWebpackTagsPluginTag: {
//         // path: 'https://open.ys7.com/sdk/js/1.3/ezuikit.js',
//         path: '/public/js/ezuikit26/ezuikit.js',
//         type: 'js'
//       }
//     },
//     {
//       key: 'timeLine',
//       webpackExternalsOption: 'TimeLine',
//       htmlWebpackTagsPluginTag: {
//         path: '/public/js/ezuikit26/js/timeLine.js',
//         type: 'js'
//       }
//     },
//     // import ExcelJS from 'exceljs'
//     {
//       key: 'exceljs',
//       webpackExternalsOption: 'ExcelJS',
//       htmlWebpackTagsPluginTag: {
//         path: 'https://cdn.bootcss.com/exceljs/2.0.1/exceljs.min.js',
//         type: 'js'
//       }
//     }
//   ]
// }
