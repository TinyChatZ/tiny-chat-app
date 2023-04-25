import { AbstractWindow } from '../windows/AbstractWindow'

const windowMap: Map<string, AbstractWindow> = new Map()

export const WindowsManageUtils = {
  addOne(window: AbstractWindow): void {
    windowMap.set(window.identity, window)
  },
  removeOne(key: string): void {
    windowMap.delete(key)
  },
  getByName(name: string): AbstractWindow | undefined {
    return windowMap.get(name)
  },
  getAll(): Array<AbstractWindow> {
    return Array.from(windowMap.values())
  }
}
