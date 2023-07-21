import { shell, BrowserWindow, screen } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '../../../resources/iconNew.ico?asset'
import url from 'node:url'
import { AbstractWindow } from './AbstractWindow'
import * as SetService from '../services/SetService'

export class ChatWindow extends AbstractWindow {
  createWindow(): BrowserWindow {
    const setParam = SetService.getCacheSettingParams()
    // Create the browser window.
    const mainWindow = new BrowserWindow({
      width: setParam?.general?.windowSize?.width ?? 400,
      height: setParam?.general?.windowSize?.height ?? 650,
      x:
        setParam?.general?.windowPosition?.width ??
        screen.getPrimaryDisplay().workAreaSize.width - 450,
      y: setParam?.general?.windowPosition?.height ?? 50,
      frame: false, // 无窗口
      transparent: true, // 设置为透明窗口
      backgroundColor: '#00000000', // 设置背景颜色为透明色
      fullscreenable: false, //禁止全屏
      resizable: true, // 禁止修改窗口大小
      alwaysOnTop: setParam?.general?.windowTop ?? false,
      show: false,
      autoHideMenuBar: true,
      ...(process.platform === 'linux' ? { icon } : {}),
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false,
        webSecurity: false,
        nodeIntegration: true
      }
    })

    mainWindow.on('ready-to-show', () => {
      mainWindow.show()
      if (process.env.NODE_ENV === 'development') {
        console.log('dev环境打开开发者工具')
        mainWindow.webContents.openDevTools()
      }
    })

    // 仅当配置中要求监听移动事件才保存
    if (setParam?.general?.saveWindowPosition) {
      mainWindow.on('move', () => {
        const bounds = mainWindow.getBounds()
        setParam.general.windowPosition.height = bounds.y
        setParam.general.windowPosition.width = bounds.x
        // 这样体验不好暂时先不修改这个
        // setParam.general.windowSize.width = bounds.width
        // setParam.general.windowSize.height = bounds.height
        SetService.setSettingParams(null, setParam)
      })
    }

    mainWindow.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })
    // dev和生产环境有些差异
    const suffix = '/chat'

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '#' + suffix)
    } else {
      mainWindow.loadURL(
        url.format({
          pathname: join(__dirname, '../renderer/index.html'),
          protocol: 'file:',
          slashes: true,
          hash: suffix
        })
      )
      // mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }

    return mainWindow
  }
}
