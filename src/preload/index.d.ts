import { ElectronAPI } from '@electron-toolkit/preload'
import { type SettingType } from '../main/types/SettingType'
import { ChatSessionIndexType, ChatSessionItemType } from '@shared/chat/ChatSessionType'
import { IgnoreMouseEventsOptions } from 'electron'
import { TinyResult } from '@shared/common/TinyResult'

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

      /**获取系统可用字体 */
      getSysFontFamilies: () => Promise<Array<string>>

      /** 修改窗口是否忽略鼠标事件，但是不忽略移动事件 */
      setIgnoreMouseEvent: (ignore: boolean) => void

      /** 是否让窗口跟着鼠标走；这是网上大佬教的鼠标拖拽方式😂 */
      windowMove: (move: 'move' | 'end' | 'heartBeat', windowName: string) => void

      /** 初始化chatSession */
      initChatSessiontIndex: () => Promise<TinyResult<Map<string, ChatSessionIndexType>>>

      /** 获取/创建一个chatSession详情 */
      getChatSessionItem: (id?: string) => Promise<TinyResult<ChatSessionItemType>>

      /** 修改/删除一个chatSession详情 */
      modifyChatSessionItem: (
        item: ChatSessionItemType,
        op: 'update' | 'delete'
      ) => Promise<TinyResult<ChatSessionItemType>>
    }
    handler: {
      /**
       * 在渲染进程中注册设置修改后回调
       * @param callback 配置回调
       * @returns
       */
      updateSettingState: (callback: (e, value) => SettingType) => unknown
      /**
       * 在渲染进程中监听ChatSession修改回调
       * @param callback 新数据的回调，由main发送
       * @returns void
       */
      updateChatSessionState: (
        callback: (
          e,
          value
        ) => {
          index: Map<string, ChatSessionIndexType>
          detail: Map<string, ChatSessionItemStorageType>
        }
      ) => unknown
    }
  }
}
