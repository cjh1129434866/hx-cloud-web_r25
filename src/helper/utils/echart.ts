/*
 * @Author       : jiapeng.Zheng
 * @Date         : 2020-04-10 15:31:54
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-04-10 16:00:11
 * @Description  :
 */

import ThemeColor from '@constants/theme/color'
/**
 * 根据主题切换颜色
 */
export function changeColorByTheme(echartsObj, themeName: string, echartOption = {}) {
  if (echartsObj) {
    echartsObj.setOption(
      Object.assign(
        {},
        {
          title: {
            textStyle: {
              color: ThemeColor[themeName].font
            }
          },
          legend: {
            textStyle: {
              color: ThemeColor[themeName].font
            }
          },
          xAxis: {
            axisLine: {
              lineStyle: { color: ThemeColor[themeName].border }
            },
            axisLabel: {
              color: ThemeColor[themeName].font
            }
          },
          yAxis: {
            splitLine: {
              lineStyle: { color: ThemeColor[themeName].border }
            },
            axisLine: {
              lineStyle: { color: ThemeColor[themeName].border }
            },
            axisLabel: {
              color: ThemeColor[themeName].font
            }
          }
        },
        echartOption
      )
    )
  }
}
/**
 * 返回数据为空时echart的配置信息
 * @param infoStr
 */
export function getNoDataMsgOption(infoStr = '暂无数据') {
  return {
    title: {
      show: true,
      textStyle: {
        color: 'grey',
        fontSize: 16
      },
      text: infoStr,
      left: 'center',
      top: 'center'
    },
    xAxis: {
      show: false
    },
    yAxis: {
      show: false
    },
    series: []
  }
}
