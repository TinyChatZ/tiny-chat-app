import { BrowserWindow } from 'electron'
import { WindowsManageUtils } from '../utils/WindowManageUtils'

export interface AbstractWindowsOptions {
  /**
   * 是否在创建时立即展示
   */
  showImmediately?: boolean

  /**
   * 指定某个id
   */
  identity?: string

  /**
   * 窗口路径，如果未指定则为/
   */
  suffix?: string
}

export abstract class AbstractWindow {
  /**
   * 封装的electron主体
   */
  content: BrowserWindow

  /**
   * 改窗口周期的参数
   */
  optionis: AbstractWindowsOptions

  /**
   * 全局唯一的id
   */
  identity: string

  /**
   * 初始化一个窗口
   * @param options 该窗口周期的封装参数
   */
  constructor(options?: AbstractWindowsOptions) {
    // 赋值
    this.optionis = options ?? {}
    this.content = this.createWindow()
    this.identity = options?.identity ?? this.constructor.name
    WindowsManageUtils.addOne(this)
  }

  /**
   * 用于子类实现创建窗口
   * @param options 该窗口周期的封装参数
   */
  abstract createWindow(options?: AbstractWindowsOptions): BrowserWindow

  showWindow(): void {
    this.content.show()
  }
}
