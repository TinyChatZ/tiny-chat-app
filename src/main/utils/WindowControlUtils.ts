import { BrowserWindow, Point, screen } from 'electron'
import { AbstractWindow } from '../windows/AbstractWindow'
/**
 * 窗口移动处理类
 */
export class WindowMove {
  interval
  winPos: Array<number>
  mousePos: Point
  window: BrowserWindow
  timeout = 10
  delay = 500
  curSize = [0, 0]
  private curTimestamp = new Date().getMilliseconds()
  static windowMoveMap = new Map<AbstractWindow, WindowMove>()

  constructor(absWindow: AbstractWindow, timeout?: number) {
    this.window = absWindow.content
    if (timeout) this.timeout = timeout
    clearInterval(this.interval)
    this.winPos = []
    this.mousePos = { x: 0, y: 0 }
    WindowMove.windowMoveMap.set(absWindow, this)
  }
  /**
   * 用于获取WindowMove实例
   * 同一个抽象窗口只会获得单例
   * @param absWindow 抽象窗口
   * @returns
   */
  static getInstance(absWindow: AbstractWindow): WindowMove {
    const windowMove = this.windowMoveMap.get(absWindow)
    if (windowMove) return windowMove
    return new WindowMove(absWindow)
  }
  /**
   * 开始移动，是的窗口跟随鼠标位置
   * 移动期间静止
   */
  startMove(): void {
    this.winPos = this.window.getPosition()
    this.mousePos = screen.getCursorScreenPoint()
    this.curSize = this.window.getSize()
    clearInterval(this.interval)
    this.interval = setInterval(() => {
      if (new Date().getMilliseconds() - this.curTimestamp >= this.delay) {
        clearInterval(this.interval)
        return
      }
      const curPos = screen.getCursorScreenPoint()
      const x = this.winPos[0] + curPos.x - this.mousePos.x
      const y = this.winPos[1] + curPos.y - this.mousePos.y
      this.window.setBounds({
        width: this.curSize[0],
        height: this.curSize[1],
        x: x,
        y: y
      })
    }, this.timeout)
  }
  /**
   * 结束移动
   */
  endMove(): void {
    clearInterval(this.interval)
    this.interval = undefined
  }
  /**
   * 发送心跳
   * 移动时需要至少在delay期间内调用一次heartBeat否则移动停止
   */
  heartBeat(): void {
    console.log('heartBeat')
    this.curTimestamp = new Date().getMilliseconds()
  }
}
