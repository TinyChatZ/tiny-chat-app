import { app, BrowserWindow, nativeTheme } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'

import { ChatWindow } from './windows/ChatWindow'
import registerEvent from './events'
import * as SetService from './services/SetService'

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // 加载本地设置到缓存中
  const setParam = await SetService.getSettingParams()
  console.log(`配置目录:${SetService.getConfigPath()}`)
  console.log('初始化后的配置：' + JSON.stringify(setParam))

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // 窗口注册
  new ChatWindow({ showImmediately: true })

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) new ChatWindow({ showImmediately: true })
  })

  // 主进程注册各种事件
  registerEvent()
  // 注册当前默认主题(如果无法查到设置，则浅色主题)
  nativeTheme.themeSource = setParam.data?.general.displayMode ?? 'light'
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
