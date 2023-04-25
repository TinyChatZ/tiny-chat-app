import { ElectronAPI } from '@electron-toolkit/preload'
import { type SettingType } from '../main/types/SettingType'

declare global {
  interface RpcResult<T> {
    // 成功为true否则为false
    success: boolean
    // 返回的数据
    data: T
    // 异常时的消息
    errMessage?: string
  }
  interface Window {
    electron: ElectronAPI
    api: {
      /**
       * 修改chat界面的尺寸
       * @param flag 展开还是关闭标识
       * @returns void
       */
      resize: (flag: boolean) => void
      /**
       * 获取设置参数
       * @returns 获取到的设置参数
       */
      getSettingParams: () => Promise<RpcResult<SettingType>>
      /**
       * 设置设置信息
       * @param data 需要设置的配置参数
       * @returns 是否设置成功
       */
      setSettingParams: (data: string) => Promise<RpcResult<SettingType>>
      /**
       * 退出主程序
       * @returns 退出主程序
       */
      exitProgram: () => void
      /**
       * 唤醒设置界面
       * @returns void
       */
      openSetWindow: () => void
      /**
       * 唤醒某个界面的开发者工具
       * @param type 类型
       *
       */
      openDevTools: (type: string) => void

      /**获取系统信息 */
      getSysInfo: () => Promise<Map<string, string>>
    }
    handler: {
      /**
       * 在渲染进程中注册设置修改后回调
       * @param callback 配置回调
       * @returns
       */
      updateSettingState: (callback: (e, value) => SettingType) => unknown
    }
  }
}
