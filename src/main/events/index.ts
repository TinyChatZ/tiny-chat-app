import { BrowserWindow, app, dialog, ipcMain } from 'electron'
import { versions, env } from 'process'
import * as os from 'os'
import { SetWindow } from '../windows/SetWindow'
import { SettingType } from '@shared/config/SettingType'
import * as SetService from '../services/SetService'
import { WindowsManageUtils } from '../utils/WindowManageUtils'
import * as ChatSessionService from '../services/ChatSessionService'
import * as fontList from 'font-list'
import { ChatSessionItemType } from '@shared/chat/ChatSessionType'
import { WindowMove } from '../utils/WindowControlUtils'
import { TinyResultBuilder } from '@shared/common/TinyResult'
import { StatusCode } from '@shared/common/StatusCode'
import { copyFile } from 'fs/promises'
import { getAssestDirPath } from '../utils/PathUtils'
import path from 'path'
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
      // const setParam = SetService.getCacheSettingParams()
      // win?.setSize(setParam.general.windowSize.width, setParam.general.windowSize.height, true)
      // fix windows平台图标消失
      win?.setAlwaysOnTop(true, 'status')
      win?.setSkipTaskbar(true)
    } else {
      win?.setAlwaysOnTop(SetService.getCacheSettingParams().general.windowTop)
      win?.setSkipTaskbar(false)
    }
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
   * 配置是否允许捕获鼠标时间
   *
   * 用于处理窗口隐藏是忽略鼠标事件行为
   */
  ipcMain.on('chat:setIgnoreMouseEvent', (event, ignore) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    win?.setIgnoreMouseEvents(ignore, { forward: true })
  })

  ipcMain.on(
    'common:windowMove',
    (_event, move: 'move' | 'end' | 'heartBeat', windowId: string) => {
      const window = WindowsManageUtils.getByName(windowId)
      if (window) {
        const windowMove = WindowMove.getInstance(window)
        if (move === 'move') windowMove.startMove()
        else if (move === 'end') windowMove.endMove()
        else if (move === 'heartBeat') windowMove.heartBeat()
      }
    }
  )

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
    if (!id) {
      id = await ChatSessionService.saveIndexItem()
    }
    const result = await ChatSessionService.getChatSessionItem(id)
    if (result) return TinyResultBuilder.buildSuccess(result)
    else return TinyResultBuilder.buildException(StatusCode.E20006)
  })
  /** 修改/删除一个chatSession详情 */
  ipcMain.handle(
    'chatsession:modifyChatSessionItem',
    async (_event, item: ChatSessionItemType, op: 'update' | 'delete') => {
      if (op === 'delete') {
        const result = await ChatSessionService.dropChatSessionItem(item.id)
        if (result) {
          return TinyResultBuilder.buildSuccess(item)
        } else return TinyResultBuilder.buildException(StatusCode.E20004)
      } else if (op === 'update') {
        const result = await ChatSessionService.saveIndexItem(item)
        if (result === '-1') return TinyResultBuilder.buildException(StatusCode.E20004)
      } else {
        return TinyResultBuilder.buildException(StatusCode.E20005)
      }
      return TinyResultBuilder.buildSuccess(item)
    }
  )

  /**
   * 选择图片并复制到指定位置
   */
  ipcMain.handle('set:getAccountImagePath', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: '选择图片',
      properties: ['openFile']
    })
    console.log(filePaths)
    if (canceled) return ''
    const accountImageTargetPath = path.join(await getAssestDirPath(), 'accountImage.png')
    try {
      await copyFile(filePaths[0], accountImageTargetPath)
      return accountImageTargetPath
    } catch (e) {
      console.log(e)
      return ''
    }
  })
}
