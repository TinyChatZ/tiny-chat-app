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
import { StatusCode } from '@shared/common/StatusCode'
import { unref } from 'vue'

/** 渲染层维护一个独立的ChatSessionStatus用来表示当前状态
 * 此状态是一个采用链表实现的堆栈，栈顶是表头，栈底是表尾
 */
export interface ChatSessionStatusType {
  /** 该条记录的状态
   * sync:已同步；unsync：未同步；unload：未加载；error：加载失败；
   */
  status: 'sync' | 'unsync' | 'unload' | 'error' | 'unknown'
  /**
   * 二级状态
   * generateTitle：标题生成中
   * generateChat:对话生成中
   */
  subStatus?: 'generateTitle' | 'generateChat'
  /** 加载时间 */
  loadTime: Date
  /** 此步状态原因 */
  reason?: string
  /** 链表结构 */
  next?: ChatSessionStatusType
}
export interface ChatSessionStateType {
  /**当前加载的session */
  sessions: Map<string, ChatSessionItemType>
  /** 当前从持久化索引中获取的会话信息 */
  indexMap: Map<string, ChatSessionIndexType>
  /** 当前Store中所有session Item和Index的状态 */
  statusMap: Map<string, ChatSessionStatusType>
  /** 当前选中的对话session */
  curChatSessionId: string
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
    curChatSessionId: '-1',
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
        await this.createNewSession()
      }
      this.statusMap = new Map()
      for (const item of this.indexMap.keys()) {
        // 所有默认值为未加载
        this.statusMap.set(item, { status: 'unload', loadTime: new Date() })
      }
      // 默认策略为选中第一个
      this.loadSession(this.indexArray[0])
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
        this.statusMap.set(chatSession.id, { status: 'unload', loadTime: new Date() })
        await this.loadSession(chatSession)
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
        this.sessionModifySuccess(chatSessionItem.id)
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
        session = this.sessions.get(item.id)
        if (session) {
          item.nameGenerate && (session.nameGenerate = item.nameGenerate)
          item.name && (session.name = item.name)
          item.fileName && (session.fileName = item.fileName)
          session.updateTime = new Date()
        }
      }
      // 如果获取到则刷新
      if (session) {
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
          this.sessionModifySuccess(result.id)
          return session
        } else {
          this.sessionModifyFail(session.id)
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
          await this.createNewSession()
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
        const result = TinyResultUtils.getDataUndefined(
          await window.api.modifyChatSessionItem(Object.assign({}, item), 'delete')
        )
        if (result) {
          this.sessions.delete(result.id)
          this.indexMap.delete(result.id)
          this.statusMap.delete(result.id)
          // 如果当前选中的是删除的id则修改位置
          if (this.curChatSessionId === item.id) {
            this.loadSession(this.indexArray[i - 1 >= 0 ? i - 1 : 0])
          }
        } else {
          this.statusMap.set(item.id, { status: 'error', loadTime: new Date() })
        }
      }
    },
    /**
     * 获取某个session的状态
     * @param session session对象，id也可以
     * @returns 空或者对应session的状态map
     */
    getStatusBySession(
      session?: string | ChatSessionIndexType | ChatSessionItemType
    ): ChatSessionStatusType | undefined {
      let id
      if (!session) id = this.curChatSessionId
      else if (typeof session === 'string') id = session
      else id = session.id
      return this.statusMap.get(id)
    },
    /**
     *准备修改会话的某些内容
     * @param session 需要处理的会话
     * @param subStatus 需要修改的子状态
     * @param interrupt 是否允许打断，默认
     */
    prepareSessionSyncStatus(
      session: string | ChatSessionIndexType | ChatSessionItemType,
      subStatus?: 'generateTitle' | 'generateChat',
      interrupt?: boolean
    ): void {
      let id
      if (!session) id = this.curChatSessionId
      else if (typeof session === 'string') id = session
      else id = session.id
      const status = this.statusMap.get(id)

      if (!status) throw 'can not find session status'

      if (status.subStatus && interrupt == undefined) {
        throw StatusCode.E20009
      }

      const newStatus = Object.assign({}, status)
      newStatus.status = 'unsync'
      newStatus.subStatus = subStatus
      newStatus.next = status
      this.statusMap.set(id, newStatus)
    },
    /** 同步会话成功调用
     * 执行成功则清楚原始状态结构，并保留成功的状态结构
     */
    sessionModifySuccess(session: string | ChatSessionIndexType | ChatSessionItemType): void {
      let id
      if (!session) id = this.curChatSessionId
      else if (typeof session === 'string') id = session
      else id = session.id
      this.statusMap.set(id, { status: 'sync', loadTime: new Date() })
    },
    /**
     * 同步会话失败
     * 再执行sync方法时出现问题，此时同步会话失败，修改会话状态
     * @param session
     */
    sessionModifyFail(session: string | ChatSessionIndexType | ChatSessionItemType): void {
      let id
      if (!session) id = this.curChatSessionId
      else if (typeof session === 'string') id = session
      else id = session.id
      const status = this.statusMap.get(id)
      if (status) {
        status.subStatus = undefined
        status.status = 'unsync'
      }
    }
  }
})

/**
 * ChatSession注册监听更新时间
 * todo 这里最好优化成增量
 */
// window.handler.updateChatSessionState((_e, value) => {
//   console.log(`接收到主进程的缓存刷新事件:${JSON.stringify(value)}`)
//   const chatSession = useChatSessionStore()
//   chatSession.indexMap = value.index
//   chatSession.sessions = value.detail
//   console.log(value.index)
//   chatSession.statusMap = new Map()
//   for (const item of chatSession.indexMap.keys()) {
//     chatSession.statusMap.set(item, { status: 'sync', loadTime: new Date() })
//   }
//   return value
// })
