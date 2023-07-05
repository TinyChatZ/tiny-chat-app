import { BrowserWindow, Point, screen } from 'electron'
import { AbstractWindow } from '../windows/AbstractWindow'

export class WindowMove {
  interval
  winPos: Array<number>
  mousePos: Point
  window: BrowserWindow
  timeout = 10
  static windowMoveMap = new Map<AbstractWindow, WindowMove>()

  constructor(absWindow: AbstractWindow, timeout?: number) {
    this.window = absWindow.content
    if (timeout) this.timeout = timeout
    clearInterval(this.interval)
    this.winPos = []
    this.mousePos = { x: 0, y: 0 }
    WindowMove.windowMoveMap.set(absWindow, this)
  }

  static getInstance(absWindow: AbstractWindow): WindowMove {
    const windowMove = this.windowMoveMap.get(absWindow)
    if (windowMove) return windowMove
    return new WindowMove(absWindow)
  }

  startMove(): void {
    this.winPos = this.window.getPosition()
    this.mousePos = screen.getCursorScreenPoint()
    clearInterval(this.interval)
    this.interval = setInterval(() => {
      const curPos = screen.getCursorScreenPoint()
      const x = this.winPos[0] + curPos.x - this.mousePos.x
      const y = this.winPos[1] + curPos.y - this.mousePos.y
      this.window.setPosition(x, y, true)
    }, this.timeout)
  }

  endMove(): void {
    clearInterval(this.interval)
  }
}
