import { app } from 'electron'
import * as os from 'node:os'
import path from 'path'
import * as fs from 'fs/promises'

/**
 * 获取本地资源路径
 */
export const getAssestDirPath = async (): Promise<string> => {
  const dir = path.join(getConfigDir(), '/asserts')
  console.log(dir)
  try {
    await fs.access(dir)
  } catch (e) {
    console.log('没有找到资源目录，创建资源目录...')
    await fs.mkdir(dir)
  }
  return dir
}
/**
 * 根据不同平台获取配置文件夹路径
 * @returns
 */
export const getConfigDir = (): string => {
  const exeSourcePath = path.dirname(app.getPath('exe'))
  const dirPath = '/tiny-chat'

  if (process.platform === 'win32' && process.env.APPDATA) {
    return path.join(process.env.APPDATA, dirPath)
  } else if (process.platform === 'darwin') {
    return path.join(os.homedir(), dirPath)
  } else if (process.platform === 'linux') {
    return path.join(process.env.XDG_CONFIG_HOME ?? process.env.HOME ?? exeSourcePath, dirPath)
  } else {
    return path.join(exeSourcePath, dirPath)
  }
}

/**
 * 依据不同平台获取配置setting.json路径
 */
export const getConfigPath = (): string => {
  const fileName = 'setting.json'
  return path.join(getConfigDir(), fileName)
}
