export default {
  alert({ __this, type, time, content, timeOverContent, callback }) {
    const h = __this.$createElement
    __this.$message[type]({
      message: h('span', {
        domProps: {
          innerHTML: `${content}，${time}${timeOverContent}`
        },
        ref: 'messageEle'
      }),
      duration: time * 1000
    })

    let timer = setInterval(() => {
      time--
      __this.$refs.messageEle.innerHTML = `${content}，${time}${timeOverContent}`
      if (time === 0) {
        typeof callback === 'function' ? callback() : void 0
        clearInterval(timer)
        timer = null
      }
    }, 1000)
  }
}
