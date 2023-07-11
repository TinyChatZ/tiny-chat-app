import {
  ChatSessionIndexType,
  ChatSessionItemType,
  getChatSessionIndexByItem
} from '@shared/chat/ChatSessionType'
import { ChatItem } from '@shared/chat/ChatType'
import { TinyResultUtils } from '@renderer/utils/TinyResultUtils'
import { defineStore } from 'pinia'
import { useChatgptStore } from './ChatgptStore'
import { useMessage } from 'naive-ui'

// 渲染层维护一个独立的ChatSessionStatus用来表示当前状态
export interface ChatSessionStatusType {
  /** 该条记录的状态 */
  status: 'sync' | 'unsync' | 'error' | 'generateTitle' | 'unknown'
  /** 加载时间 */
  loadTime: Date
}
export interface ChatSessionStateType {
  /**当前加载的session */
  sessions: Map<string, ChatSessionItemType>
  /** 当前从持久化索引中获取的会话信息 */
  indexMap: Map<string, ChatSessionIndexType>
  /** 当前Store中所有session Item和Index的状态 */
  statusMap: Map<string, ChatSessionStatusType>
  /** 当前选中的对话session */
  curChatSessionId?: string
  /** 同步状态，true为已同步，false为未同步 */
  sync: boolean
  /** 最近更新时间 */
  lastModify: Date
  /** 展示Session的编辑按钮 */
  showItemEditBar: boolean
}
/**
 * 创建多个ChatSessionStore
 * 这也许不是一个好主意，但是通过这种方法可以实现类型的自动推导
 */

export const useChatSessionStore = defineStore(`chatSessionStore`, {
  state: (): ChatSessionStateType => ({
    sessions: new Map(),
    indexMap: new Map(),
    statusMap: new Map(),
    curChatSessionId: undefined,
    sync: false,
    lastModify: new Date(),
    showItemEditBar: false
  }),
  getters: {
    /**
     * 渲染顺序
     * todo支持通过配置选择渲染顺序（创建时间、更新时间、正序|逆序）
     * 默认为
     */
    indexArray(): Array<ChatSessionIndexType & ChatSessionStatusType> {
      const res = new Array<ChatSessionIndexType & ChatSessionStatusType>()
      for (const value of this.indexMap.values()) {
        res.push({
          ...value,
          ...(this.statusMap.get(value.id) || { status: 'unknown', loadTime: new Date() })
        })
      }
      return res
    },
    /**
     *
     * @returns 当前选中的sessionItem
     */
    curChatSession(): ChatSessionItemType | undefined {
      if (this.curChatSessionId) return this.sessions.get(this.curChatSessionId)
      else return undefined
    }
  },
  actions: {
    /**
     * 初始化聊天Session
     *
     */
    async initChatSession(): Promise<string | void> {
      this.indexMap = TinyResultUtils.getData(
        await window.api.initChatSessiontIndex(),
        () => new Map()
      )
      // 如果没有会话则创建一个
      if (this.indexMap.size <= 0) {
        const newSession = await this.createNewSession()
        newSession && (await this.loadSession(newSession))
      }
      this.statusMap = new Map()
      for (const item of this.indexMap.keys()) {
        this.statusMap.set(item, { status: 'sync', loadTime: new Date() })
      }
      // 默认策略为选中第一个
      this.loadSession(this.indexArray[0])
      this.sync = true
      this.lastModify = new Date()
    },
    /**
     * 创建一个新的会话
     * @returns
     */
    async createNewSession(): Promise<ChatSessionItemType | undefined> {
      const chatSession = TinyResultUtils.getDataUndefined(await window.api.getChatSessionItem())
      if (chatSession) {
        this.sessions.set(chatSession.id, chatSession)
        this.indexMap.set(chatSession.id, getChatSessionIndexByItem(chatSession))
      }
      return chatSession
    },
    /**
     * 根据索引加载对应的session(通常为打开一个session)
     * @param index state中的索引项
     */
    async loadSession(index: ChatSessionIndexType): Promise<ChatSessionItemType | undefined> {
      let chatSessionItem: ChatSessionItemType | undefined
      // 优先找store的缓存
      if (this.sessions.get(index.id)) {
        chatSessionItem = this.sessions.get(index.id)
      } else {
        const result = TinyResultUtils.getDataUndefined(
          await window.api.getChatSessionItem(index.id)
        )
        if (result) {
          chatSessionItem = result
          this.sessions.set(chatSessionItem.id, chatSessionItem)
        }
      }
      // 创建ChatGPT Store并写入数据
      if (chatSessionItem) {
        const chatgptStore = useChatgptStore(chatSessionItem.id)
        chatgptStore.chatList = chatSessionItem.chatList ?? []
        chatgptStore.refreshIndexMap()
        this.curChatSessionId = chatSessionItem.id
      } else {
        console.error('载入的chatgptStore为空')
      }

      return chatSessionItem
    },
    /**
     * 同步sessionInfo到持久化
     * 如果id传了ChatSessionItemType就会刷新索引
     * @param item
     * @param chatList
     * @returns
     */
    async syncSessionInfo(
      item: string | ChatSessionIndexType | ChatSessionItemType,
      chatList?: Array<ChatItem>
    ): Promise<ChatSessionItemType | undefined> {
      // 三种方式获取session
      let session: ChatSessionItemType | undefined
      if (typeof item === 'string') {
        session = this.sessions.get(item)
      } else {
        session = { ...this.sessions.get(item.id), ...item }
      }
      // 如果获取到则刷新
      if (session) {
        const status = this.statusMap.get(session.id)
        status && (status.status = 'unsync')
        // 如果chatList不存在则表示更新索引
        if (chatList) {
          session.chatList = chatList
        }
        session = Object.assign({}, session)
        session.chatList = session.chatList?.map((item) => Object.assign({}, item))
        const result = TinyResultUtils.getDataUndefined(
          await window.api.modifyChatSessionItem(Object.assign({}, session), 'update')
        )
        if (result) {
          this.sessions.set(result.id, session)
          this.indexMap.set(result.id, getChatSessionIndexByItem(session))
          return session
        }
      }
      return undefined
    },
    /**
     * 删除一条记录
     * @param item 待删除的item
     */
    async deleteSessionInfo(item: ChatSessionIndexType) {
      /** 只有一个的时候直接删除并新建一个 */
      if (this.indexArray.length === 1) {
        const r = Object.assign({}, this.indexArray[0])
        const result = TinyResultUtils.getDataUndefined(
          await window.api.modifyChatSessionItem(r, 'delete')
        )
        if (result) {
          this.sessions.set(result.id, result)
          this.indexMap.set(result.id, getChatSessionIndexByItem(result))
          const newSession = await this.createNewSession()
          newSession && (await this.loadSession(newSession))
        }
      }
      // 其余情况定位到删除位置，然后处理
      else {
        let i = 0
        for (; i < this.indexArray.length; i++) {
          if (this.indexArray[i].id === item.id) break
        }
        // todo 这里要报错
        if (i >= this.indexArray.length) {
          useMessage().error('下标越界了……')
        }
        this.loadSession(this.indexArray[i - 1 >= 0 ? i - 1 : 0])
        const result = await window.api.modifyChatSessionItem(Object.assign({}, item), 'delete')
        if (!result.success) {
          useMessage().error(result.code)
        } else {
          this.curChatSessionId = this.indexArray[i - 1 >= 0 ? i - 1 : 0].id
        }
      }
    }
  }
})

/**
 * ChatSession注册监听更新时间
 * todo 这里最好优化成增量
 */
window.handler.updateChatSessionState((_e, value) => {
  console.log(`接收到主进程的缓存刷新事件:${JSON.stringify(value)}`)
  const chatSession = useChatSessionStore()
  chatSession.indexMap = value.index
  chatSession.sessions = value.detail
  console.log(value.index)
  chatSession.statusMap = new Map()
  for (const item of chatSession.indexMap.keys()) {
    chatSession.statusMap.set(item, { status: 'sync', loadTime: new Date() })
  }
  return value
})
