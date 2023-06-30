import { ChatSessionIndexItemType, ChatSessionItemType } from '@shared/chat/ChatSessionType'
import { ChatItem } from '@shared/chat/ChatType'
import { StatusCode } from '@shared/common/StatusCode'
import { TinyResult, TinyResultBuilder } from '@shared/common/TinyResult'
import { defineStore } from 'pinia'
import { useChatgptStore } from './ChatgptStore'
export interface ChatSessionStateType {
  /**当前加载的session */
  sessions: Map<string, ChatSessionItemType>
  /** 当前从持久化索引中获取的会话信息 */
  indexMap: Map<string, ChatSessionIndexItemType>
  /** 当前对话的Id
   * 外部监听该值的改变并刷新对应的ChatGPTStore
   */
  curChatSessionId?: string
  /** 同步状态，true为已同步，false为未同步 */
  sync: boolean
  /** 最近更新时间 */
  lastModify: Date
}
/**
 * 创建多个ChatSessionStore
 * 这也许不是一个好主意，但是通过这种方法可以实现类型的自动推导
 */

export const useChatSessionStore = defineStore(`chatSessionStore`, {
  state: (): ChatSessionStateType => ({
    sessions: new Map(),
    indexMap: new Map(),
    sync: false,
    curChatSessionId: undefined,
    lastModify: new Date()
  }),
  getters: {
    /**
     * 渲染顺序
     * todo支持通过配置选择渲染顺序（创建时间、更新时间、正序|逆序）
     * 默认为
     */
    indexArray(): Array<ChatSessionIndexItemType> {
      return [...this.indexMap.values()]
    }
  },
  actions: {
    /**
     * 初始化聊天Session
     *
     */
    async initChatSession(): Promise<string | void> {
      this.indexMap = await window.api.initChatSessiontIndex()
      this.sync = true
      this.lastModify = new Date()
    },
    /**
     * 创建一个新的会话
     * @returns
     */
    async createNewSession(): Promise<ChatSessionItemType> {
      const chatSession = await window.api.getChatSessionItem()
      return chatSession
    },
    /**
     * 根据索引加载对应的session(通常为打开一个session)
     * @param index state中的索引项
     */
    async loadSession(index: ChatSessionIndexItemType): Promise<ChatSessionItemType | undefined> {
      let chatSessionItem: ChatSessionItemType | undefined
      // 优先找store的缓存
      if (this.sessions.get(index.id)) {
        chatSessionItem = this.sessions.get(index.id)
      } else {
        chatSessionItem = await window.api.getChatSessionItem(index.id)
        if (chatSessionItem) this.sessions.set(chatSessionItem.id, chatSessionItem)
      }
      // 创建ChatGPT Store并写入数据
      if (chatSessionItem) {
        const chatgptStore = useChatgptStore(chatSessionItem.id)
        chatgptStore.chatList = chatSessionItem.chatList ?? []
        chatgptStore.refreshIndexMap()
        this.curChatSessionId = chatSessionItem?.id
      } else {
        console.error('载入的chatgptStore为空')
      }

      return chatSessionItem
    },
    /**
     * 同步sessionInfo到持久化
     * @param id
     * @param chatList
     * @returns
     */
    async syncSessionInfo(
      id: string,
      chatList: Array<ChatItem>
    ): Promise<TinyResult<ChatSessionItemType | undefined>> {
      console.log(id)
      let session = this.sessions.get(id)
      if (session) {
        session.chatList = chatList
        session = Object.assign({}, session)
        session.chatList = session.chatList.map((item) => Object.assign({}, item))
        console.log(Object.assign({}, session))
        await window.api.modifyChatSessionItem(Object.assign({}, session), 'update')
        return TinyResultBuilder.buildSuccess(session)
      } else {
        return TinyResultBuilder.buildException(StatusCode.E20001)
      }
    }
  }
})

/**
 * ChatSession注册监听更新时间
 */
window.handler.updateChatSessionState((_e, value) => {
  const chatSession = useChatSessionStore()
  chatSession.indexMap = value.index
  chatSession.sessions = value.detail
  return value
})
