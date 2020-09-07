/*
 * @Author       : jiapeng.Zheng
 * @Date         : 2020-03-23 15:24:12
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-03-25 10:52:30
 * @Description  :
 */
const path = require('path')

module.exports = {
  resolve(dir) {
    return path.join(__dirname, '..', dir)
  }
}
