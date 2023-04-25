import { shell, BrowserWindow } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '../../../resources/iconNew.ico?asset'
import url from 'node:url'
import { AbstractWindow } from './AbstractWindow'

export class SetWindow extends AbstractWindow {
  createWindow(): BrowserWindow {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
      width: 800,
      height: 500,
      alwaysOnTop: false,
      show: false,
      title: '配置',
      icon: '',
      autoHideMenuBar: true,
      ...(process.platform === 'linux' ? { icon } : {}),
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false,
        webSecurity: false
      }
    })

    mainWindow.on('ready-to-show', () => {
      mainWindow.show()
      if (process.env.NODE_ENV === 'development') {
        console.log('dev环境打开开发者工具')
        mainWindow.webContents.openDevTools()
      }
    })

    mainWindow.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })
    // dev和生产环境有些差异
    const suffix = '/set'

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
