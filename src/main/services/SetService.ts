import { app, nativeTheme } from 'electron'
import path from 'path'
import fs from 'fs/promises'
import 'highlight.js'
import { RpcUtils, RpcResult } from '../utils/RpcUtils'
import { WindowsManageUtils } from '../utils/WindowManageUtils'
import { SetWindow } from '../windows/SetWindow'
import * as _ from 'loadsh'
import * as os from 'node:os'
import { type SettingType, getDefaultSetting } from '@shared/config/SettingType'
/**
 * 缓存
 */
let settingCache: SettingType | undefined
/**
 * 获取设置信息
 * @returns 设置信息
 */
export const getSettingParams = async (): Promise<RpcResult<SettingType>> => {
  // 如果Cache不存在则从本地磁盘载入到Cache中
  if (!settingCache) {
    try {
      await loadSettingFileToCache()
    } catch (e) {
      // 写入失败时，给出错误
      return fs
        .writeFile(getConfigPath(), JSON.stringify(getDefaultSetting()))
        .then(() => RpcUtils.success(getDefaultSetting()))
        .catch(() => RpcUtils.error('can not write file'))
    }
  }
  return Promise.resolve(RpcUtils.success(settingCache ?? getDefaultSetting()))
}

/**
 * 永远获取缓存的设置信息
 * @returns 设置信息
 */
export const getCacheSettingParams = (): SettingType => settingCache ?? getDefaultSetting()

/**
 * 更新设置信息
 * @param _event _
 * @param data 需要更新的全量数据
 * @returns 更新的结果
 */
export const setSettingParams = async (
  _event: unknown,
  data: SettingType
): Promise<RpcResult<SettingType>> => {
  // 如果data存在则表示要set值,写入失败刷新缓存并返回
  if (data) {
    try {
      await fs.writeFile(getConfigPath(), JSON.stringify(data))
    } catch (e) {
      console.warn('写入失败，可能数据是不可写的')
      return Promise.resolve(RpcUtils.error('write error can not access write'))
    }
    settingCache = data
    return Promise.resolve(RpcUtils.success(data))
  } else {
    settingCache = getDefaultSetting()
    return Promise.resolve(RpcUtils.error(''))
  }
}
/**
 * 更新设置信息钩子，触发更新时进行一些操作
 * @param _event
 * @param data
 * @returns
 */
export const beforeSetSettingParams = async (
  newData: SettingType,
  oldData: SettingType
): Promise<void> => {
  // 修改了主题需要通知所有渲染器
  if (oldData.general.displayMode !== newData.general.displayMode) {
    nativeTheme.themeSource = newData.general.displayMode
  }
}

/**
 * 向系统中所有的窗口广播配置更新时间
 */
export const broadcastSettingUpdate = (): void => {
  const windows = WindowsManageUtils.getAll().filter((v) => v.identity !== SetWindow.name)
  windows.forEach((window) => window.content.webContents.send('update-Setting-state', settingCache))
}

/**
 * 依据不同平台获取配置路径
 */
export const getConfigPath = (): string => {
  const exeSourcePath = path.dirname(app.getPath('exe'))
  const dirPath = '/tiny-chat'
  const fileName = 'setting.json'

  if (process.platform === 'win32' && process.env.APPDATA) {
    return path.join(process.env.APPDATA, dirPath, fileName)
  } else if (process.platform === 'darwin') {
    return path.join(os.homedir(), dirPath, fileName)
  } else if (process.platform === 'linux') {
    return path.join(
      process.env.XDG_CONFIG_HOME ?? process.env.HOME ?? exeSourcePath,
      dirPath,
      fileName
    )
  } else {
    return path.join(exeSourcePath, dirPath, fileName)
  }
}

/**
 * 加载配置文件到缓存中
 */
const loadSettingFileToCache = async (): Promise<void> => {
  const data = await fs.readFile(getConfigPath())
  // 原数数据
  const originalData = JSON.parse(data.toString())
  settingCache = _.merge(getDefaultSetting(), originalData)
}
