/*
 * @Author: jiapeng.Zheng
 * @Date: 2018-12-29 14:05:04
 * @LastEditors: jiapeng.Zheng
 * @LastEditTime: 2019-09-24 14:23:16
 * @Description: 生产环境构建
 */
var fs = require('fs')
var path = require('path')
var utils = require('./utils')
var webpack = require('webpack')
var config = require('../config')
var merge = require('webpack-merge')
var baseWebpackConfig = require('./webpack.base.conf')
// var CopyWebpackPlugin = require('copy-webpack-plugin')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
var SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin')
var LodashModuleReplacementPlugin = require('lodash-webpack-plugin')
var ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin')
const Jarvis = require('webpack-jarvis')

var env = process.env.NODE_ENV === 'testing' ? require('../config/test.env') : config.build.env

var webpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.build.productionSourceMap,
      extract: true
    })
  },
  devtool: config.build.productionSourceMap ? '#source-map' : false,
  output: {
    path: config.build.assetsRoot,
    filename: utils.assetsPath('js/[chunkhash].js'),
    chunkFilename: utils.assetsPath('js/[chunkhash].js')
  },
  plugins: [
    // new webpack.optimize.ModuleConcatenationPlugin(),
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    new webpack.DefinePlugin({
      'process.env': env
    }),
    // new webpack.optimize.UglifyJsPlugin({
    //   compress: {
    //     warnings: false
    //   },
    //   sourceMap: true
    // }),
    new ParallelUglifyPlugin({
      cacheDir: '.cache/',
      uglifyJS: {
        output: {
          comments: false,
          beautify: false
        },
        compress: {
          warnings: false,
          drop_console: true
        }
      }
    }),
    // extract css into its own file
    new ExtractTextPlugin({
      filename: utils.assetsPath('css/[contenthash].css')
    }),
    // Compress extracted CSS. We are using this plugin so that possible
    // duplicated CSS from different components can be deduped.
    new OptimizeCSSPlugin(),
    // generate dist index.html with correct asset hash for caching.
    // you can customize output by editing /index.html
    // see https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: process.env.NODE_ENV === 'testing' ? 'index.html' : config.build.index,
      template: 'index.ejs',
      inject: true,
      // https://github.com/kangax/html-minifier#options-quick-reference
      minify: {
        removeComments: true, // 移除html注释
        minifyCSS: true, // 压缩内联的css代码
        collapseWhitespace: true // 折叠html空白
        // removeAttributeQuotes: true // 移除html标签属性的引号
      },
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      chunksSortMode: 'dependency',
      serviceWorkerLoader: `<script>${fs.readFileSync(path.join(__dirname, './service-worker-prod.js'), 'utf-8')}</script>` // index.ejs <%=htmlWebpackPlugin.options.serviceWorkerLoader%>
    }),
    // split vendor js into its own file
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: function(module, count) {
        // any required modules inside node_modules are extracted to vendor
        return module.resource && /\.js$/.test(module.resource) && module.resource.indexOf(path.join(__dirname, '../node_modules')) === 0
      }
    }),
    // extract webpack runtime and module manifest to its own file in order to
    // prevent vendor hash from being updated whenever app bundle is updated
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      chunks: ['vendor']
    }),
    // copy custom static assets
    // new CopyWebpackPlugin([
    //   {
    //     from: path.resolve(__dirname, '../static'),
    //     to: config.build.assetsSubDirectory,
    //     ignore: ['.*']
    //   }
    // ]),
    // service worker caching
    new SWPrecacheWebpackPlugin({
      cacheId: 'my-vue-app',
      filename: 'service-worker.js',
      staticFileGlobs: ['dist/**/*.{js,html,css}'],
      minify: true,
      stripPrefix: 'dist/'
    }),
    new LodashModuleReplacementPlugin({
      // If you'd like to enable shorthands you can do so with the plugin options.
      // https://github.com/lodash/lodash-webpack-plugin/issues/150
      shorthands: true
    })
  ]
})

if (config.build.productionGzip) {
  var CompressionWebpackPlugin = require('compression-webpack-plugin')

  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: new RegExp('\\.(' + config.build.productionGzipExtensions.join('|') + ')$'),
      threshold: 10240,
      minRatio: 0.8
    })
  )
}
// webpack-bundle-analyzer 打包束分析
if (config.build.bundleAnalyzerReport) {
  var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}
// webpack-jarvis，JARVIS，全称为 Just A Rather Very Intelligent System ，是一个非常智能的基于 Webpack 仪表板的浏览器。它会将你在 Webpack 构建开发和生产过程中的所有相关信息都放到浏览器中
if (config.build.bundleIntelligentDashboard) {
  webpackConfig.plugins.push(new Jarvis({ port: 1337, watchOnly: false }))
}
module.exports = webpackConfig
