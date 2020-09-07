/*
 * @Author: jiapeng.Zheng
 * @Date: 2019-09-16 15:44:25
 * @LastEditors  : jiapeng.Zheng
 * @LastEditTime : 2020-04-10 16:32:02
 * @Description:
 * 外部直接引用 externals: {exceljs: 'ExcelJS'}
 */
import ExcelJS from 'exceljs/dist/es5/exceljs.browser'
import Download from '@helper/download.js'
import _ from '@helper/lodash.js'

type TableSheet = {
  worksheetEle: HTMLTableElement
  worksheetName: string
}

export class TablesToExcel {
  private tableSheets: Array<TableSheet> = []
  private options: ExcelJS.Workbook

  private constructor(tables: Array<TableSheet> = [], options?: ExcelJS.Workbook) {
    this.tableSheets = tables
    this.options = Object.assign(
      {},
      {
        views: [
          {
            x: 0,
            y: 0,
            width: 10000,
            height: 20000,
            firstSheet: 0,
            activeTab: 1,
            visibility: 'visible'
          }
        ]
      },
      options
    )
  }

  private letter = (num: number) => {
    const a = 'A'.charCodeAt(0)
    return String.fromCharCode(a + num - 1)
  }

  private columnIndex = (num: number) => {
    let result
    num = num + 1

    if (num <= 26) {
      result = this.letter(num)
    } else {
      const mod = num % 26
      const quotient = Math.floor(num / 26)

      if (mod === 0) {
        result = this.letter(quotient - 1) + this.letter(26)
      } else {
        result = this.letter(quotient) + this.letter(mod)
      }
    }
    return result
  }

  private cellPosition = (x, y) => {
    return `${this.columnIndex(x)}${y + 1}`
  }

  /**
   * 合并单元格
   */
  private mergeCells = (sheet: ExcelJS.Worksheet, x1, y1, x2, y2) => {
    const fromCell = this.cellPosition(x1, y1)
    const toCell = this.cellPosition(x2, y2)
    sheet.mergeCells(fromCell, toCell)
    return sheet.getCell(fromCell)
  }

  private toSheet(table: HTMLTableElement, worksheet: ExcelJS.Worksheet) {
    // get total cols and rows
    const totalRows = table.rows.length
    let totalCols = 0

    if (table.rows.length > 0) {
      for (let i = 0; i < table.rows[0].cells.length; i++) {
        totalCols += table.rows[0].cells[i].colSpan
      }
    }

    const cells = []
    Array.from(table.rows).forEach(row => {
      Array.from(row.cells).forEach(cell => {
        cells.push({
          rowRange: {},
          colRange: {},
          el: cell
        })
      })
    })

    // create matrix
    const helperMatrix = []

    for (let r = 0; r < totalRows; r++) {
      const row = []
      for (let c = 0; c < totalCols; c++) {
        row.push({ cell: null })
      }
      helperMatrix.push(row)
    }

    // mark matrix
    let cursor = 0

    for (let r = 0; r < totalRows; r++) {
      for (let c = 0; c < totalCols; c++) {
        // skip if current matrix unit is already assigned
        if (helperMatrix[r][c].cell) {
          continue
        }

        // assign cell to current matrix unit
        const cell = cells[cursor++]
        const { rowSpan, colSpan } = cell.el

        cell.rowRange = { from: r, to: r }
        cell.colRange = { from: c, to: c }

        for (let y = r; y < r + rowSpan; y++) {
          for (let x = c; x < c + colSpan; x++) {
            helperMatrix[y][x].cell = cell
            cell.colRange.to = x
            cell.rowRange.to = y
          }
        }
      }
    }

    // read matrix to sheet
    cells.forEach(cell => {
      const { rowRange, colRange, el } = cell
      const { innerText } = el
      const workcell = this.mergeCells(worksheet, colRange.from, rowRange.from, colRange.to, rowRange.to)
      // const cellStyle = getComputedStyle(el)
      workcell.value = _.trim(innerText)
      // workcell.font = { color: { argb: 'A5A52C9E' } }

      //   // workcellCreated
      //   this._invokePlugin('workcellCreated', { workcell, cell: el, rowRange, colRange, cellStyle })
    })
  }
  private saveAsExcel(workbook: ExcelJS.Workbook, filename = 'table', ext = 'xlsx') {
    const MIME_TYPES = {
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }
    const type = MIME_TYPES[ext]
    if (!type) {
      console.error(`${ext} file extension is not supported`)
    }
    workbook.xlsx.writeBuffer().then(buffer => {
      Download.download(buffer, `${filename}.${ext}`, type)
    })
  }
  toExcel(fileName = 'table', ext = 'xlsx') {
    const { tableSheets, options } = this
    const workbook = new ExcelJS.Workbook() // create workbook
    Object.assign(workbook, options)
    tableSheets.forEach((tableSheet, index) => {
      const { worksheetEle, worksheetName } = tableSheet
      const worksheet = workbook.addWorksheet(worksheetName || `Sheet ${index + 1}`)
      this.toSheet(worksheetEle, worksheet)
    })
    this.saveAsExcel(workbook, fileName, ext)
  }
}
