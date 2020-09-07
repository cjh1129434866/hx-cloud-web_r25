/*
 * @Author       : jiapeng.Zheng
 * @Date         : 2018-11-12 09:27:38
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-05-22 14:51:52
 * @Description  : 字段校验
 */
// import semver from 'semver';
const Validate = function(options) {
  const defaultOprions = { message: '', pattern: null }
  Object.assign(defaultOprions, options)
  const { message, pattern, validateFn } = defaultOprions
  const valid =
    validateFn ||
    function() {
      return false
    }
  return {
    validate(data) {
      return valid(data)
    },
    rule() {
      return {
        message,
        pattern
      }
    }
  }
}

export default {
  LettersAndNumber(min, max) {
    // /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{${min},${max}}$/
    const pattern = new RegExp(`^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{${min},${max}}$`)
    const message = `必须是由${min}-${max}个字母和数字组成`
    const validateFn = data => {
      return pattern.test(data)
    }
    return new Validate({ message, pattern, validateFn })
  },
  LettersOrNumber(min, max) {
    // /^[0-9A-Za-z]{${min},${max}}$/
    const pattern = new RegExp(`^[0-9A-Za-z]{${min},${max}}$`)
    const message = `必须是由${min}-${max}个字母或数字组成`
    const validateFn = data => {
      return pattern.test(data)
    }
    // Validate.prototype.min = minValue => {
    //   console.log(minValue)
    // }
    return new Validate({ message, pattern, validateFn })
  },

  checkNumber() {
    const pattern = RegExp('^\\d+(\\.\\d+)?$')
    const message = '请输入数字' // 且不能全为空格
    const validateFn = data => {
      return pattern.test(data)
    }
    return new Validate({ message, pattern, validateFn })
  },

  lengthLimt(min, max) {
    //  /^(?=.*?\S)[\s\S]{${min},${max}}$/g
    // let pattern = new RegExp(`^(?=.*?\\S)[\\s\\S]{${min},${max}}$`, 'g')
    const pattern = new RegExp(`^.{${min},${max}}$`, 'g')
    const message = `请输入${min}-${max}个字符` // 且不能全为空格
    const validateFn = data => {
      return pattern.test(data)
    }
    return new Validate({ message, pattern, validateFn })
  },
  // 手机号码验证规则
  mobile() {
    const pattern = new RegExp(`^[1][3,4,5,7,8][0-9]{9}$`)
    const message = `请输入正确的手机号`
    const validateFn = data => {
      return pattern.test(data)
    }
    return new Validate({ message, pattern, validateFn })
  },
  // 电话号码验证规则
  telephone() {
    const pattern = new RegExp(/^0\d{2,3}-\d{7,8}$/)
    const message = `请输入正确的电话`
    const validateFn = data => {
      return pattern.test(data)
    }
    return new Validate({ message, pattern, validateFn })
  },
  // 版本号验证，
  // version() {
  //   let message = `请输入正确的版本号，提示：v1.2.3`
  //   let validateFn = data => {
  //     // console.log('semver.valid(data)', !!semver.valid(data))
  //     return !!semver.valid(data)
  //   }
  //   return new Validate({ message, validateFn })
  // },
  //  物联网控制器升级文件版本号规则
  fileVersion() {
    const pattern = RegExp(/^(V|v)(\d+|x)\.(\d+|x)\.(\d+|x)$/)
    const message = `请输入正确的版本号，提示：V1.1.2 或 v1.1.2 或 V1.1.x 或 v1.1.x`
    const validateFn = data => {
      return pattern.test(data)
    }
    return new Validate({ message, pattern, validateFn })
  }
}
