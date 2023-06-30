import { BrowserWindow, app, ipcMain } from 'electron'
import { versions, env } from 'process'
import * as os from 'os'
import { SetWindow } from '../windows/SetWindow'
import { SettingType } from '@shared/config/SettingType'
import * as SetService from '../services/SetService'
import { WindowsManageUtils } from '../utils/WindowManageUtils'
import * as ChatSessionService from '../services/ChatSessionService'
import * as fontList from 'font-list'
import { ChatSessionIndexItemType, ChatSessionItemStorageType } from '@shared/chat/ChatSessionType'
export default function registerEvent(): void {
  // Public

  /**
   * 正常退出程序
   */
  ipcMain.on('exit-program', () => {
    app.exit(0)
  })

  /**
   * 加载主进程中的配置
   */
  ipcMain.handle('chatgpt:getSettingParams', SetService.getSettingParams)

  /**
   * 保存设置信息，并且广播更新内容
   *
   */
  ipcMain.handle('chatgpt:setSettingParams', async (_event: unknown, data: SettingType) => {
    // 钩子更新前执行操作
    await SetService.beforeSetSettingParams(data, SetService.getCacheSettingParams())
    const res = await SetService.setSettingParams(_event, data)
    // 修改设置后广播刷新
    SetService.broadcastSettingUpdate()
    return res
  })

  // ChatWindow

  /**
   * 修改窗口大小
   * 用于缩放主窗口大小
   */
  ipcMain.on('change-window-size', (event, flag) => {
    const webContents = event.sender
    const win = BrowserWindow.fromWebContents(webContents)
    if (flag) {
      const setParam = SetService.getCacheSettingParams()
      win?.setSize(setParam.general.windowSize.width, setParam.general.windowSize.height, true)
    } else win?.setSize(150, 64, true)
  })

  /**
   * 主窗口展示设置窗口
   */
  ipcMain.on('chatgpt:openSetWindow', () => {
    new SetWindow({ showImmediately: true })
  })

  // SetWindow
  /**
   * 创建某个界面的开发者tools
   */
  ipcMain.on('set:openDevTools', (_e, type: string) => {
    WindowsManageUtils.getByName(type)?.content.webContents.openDevTools()
  })

  /**获取系统信息 */
  ipcMain.handle('set:getSysInfo', () => {
    const res: Map<string, string> = new Map()
    res.set('version', app.getVersion())
    res.set('nodeVersion', versions.node)
    res.set('chromeVersion', versions.chrome)
    res.set('electronVersion', versions.electron)
    res.set('systemVersion', `${os.version} ${os.release()}`)
    if (env.ELECTRON_BUILD_TIME) res.set('buildDate', env.ELECTRON_BUILD_TIME)
    return res
  })

  /**
   * 获取系统中的字体信息
   */
  ipcMain.handle('set:getSysFontFamilies', async () => {
    return [...new Set(await fontList.getFonts())]
  })

  /**
   * 初始化chatSessionIndex
   *
   * renderer首次加载ChatSessionStore是调用此方法，获取索引
   */
  ipcMain.handle('chatsession:initChatSessionIndex', async () => {
    return await ChatSessionService.getIndexMap()
  })

  /**
   * 创建或者加载一个SessionIndex
   */
  ipcMain.handle('chatsession:getChatSessionItem', async (_event, id?: string) => {
    if (id) {
      return await ChatSessionService.getChatSessionItem(id)
    } else {
      const id = await ChatSessionService.saveIndexItem()
      return await ChatSessionService.getChatSessionItem(id)
    }
  })
  /** 修改/删除一个chatSession详情 */
  ipcMain.handle(
    'chatsession:modifyChatSessionItem',
    async (_event, item: ChatSessionIndexItemType, op: 'update' | 'delete') => {
      if (op === 'delete') ChatSessionService.dropChatSessionItem(item.id)
      else if (op === 'update') ChatSessionService.saveIndexItem(item as ChatSessionItemStorageType)
    }
  )
}
