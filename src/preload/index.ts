import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { RpcResult } from '../main/utils/RpcUtils'
import { type SettingType } from '@shared/config/SettingType'
import { ChatSessionIndexType, ChatSessionItemType } from '@shared/chat/ChatSessionType'
import { EventNames } from '@shared/common/EventNames'

// Custom APIs for renderer
const api = {
  resize: (flag: boolean): void => {
    ipcRenderer.send('change-window-size', flag)
  },
  getSettingParams: async (): Promise<RpcResult<SettingType>> =>
    await ipcRenderer.invoke('chatgpt:getSettingParams'),

  setSettingParams: async (data: string): Promise<RpcResult<SettingType>> =>
    await ipcRenderer.invoke('chatgpt:setSettingParams', JSON.parse(data)),

  exitProgram: (): void => ipcRenderer.send('exit-program'),

  openSetWindow: (): void => ipcRenderer.send('chatgpt:openSetWindow'),

  openDevTools: (type: string): void => ipcRenderer.send('set:openDevTools', type),

  getSysInfo: async (): Promise<Map<string, string>> =>
    (await ipcRenderer.invoke('set:getSysInfo')) as Map<string, string>,

  getSysFontFamilies: async (): Promise<Array<string>> =>
    ipcRenderer.invoke('set:getSysFontFamilies'),

  /** 初始化chatSession */
  initChatSessiontIndex: async (): Promise<Map<string, ChatSessionIndexType>> =>
    ipcRenderer.invoke('chatsession:initChatSessionIndex'),

  /** 获取一个chatSession详情 */
  getChatSessionItem: async (id?: string): Promise<ChatSessionItemType> =>
    await ipcRenderer.invoke('chatsession:getChatSessionItem', id),

  /** 修改/删除一个chatSession详情 */
  modifyChatSessionItem: (item: ChatSessionIndexType, op: 'update' | 'delete'): Promise<void> =>
    ipcRenderer.invoke('chatsession:modifyChatSessionItem', item, op)
}

// handlers for renderer
const handler = {
  updateSettingState: (callback: () => SettingType): unknown =>
    ipcRenderer.on('update-Setting-state', callback),
  updateChatSessionState: (
    callback: (
      e,
      value
    ) => {
      index: Map<string, ChatSessionIndexType>
      detail: Map<string, ChatSessionItemType>
    }
  ): unknown => ipcRenderer.on(EventNames.ChatSession_Brocast_SessionUpdate, callback)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('handler', handler)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
