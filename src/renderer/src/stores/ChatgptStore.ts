import { EventSourceOptions } from '@renderer/utils/EventSource'
import { defineStore } from 'pinia'
import { useSettingStore } from './SettingStore'
/**
 * 对话Item
 */
export interface ChatItem {
  role: string
  content: string
  date: Date
  ticks?: number
  position: number
}
/**
 * ChatgptStoreState类型
 */
export interface ChatgptStoreState {
  chatList: Array<ChatItem>
  curQuestion: string
}
export const useChatgptStore = defineStore('chatgpt', {
  state: (): ChatgptStoreState => ({
    chatList: [],
    curQuestion: ''
  }),
  getters: {
    getRequestParam(): { url: string; options: EventSourceOptions } {
      // 不会重复创建 https://pinia.vuejs.org/zh/cookbook/composing-stores.html#shared-getters
      const setting = useSettingStore().chatgpt
      // 如果拿不到token就配置
      if (!setting?.token) {
        throw new Error('token is not exists')
      }
      const url = (setting.proxy?.address || 'https://api.openai.com') + '/v1/chat/completions'
      const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + setting.token
      }
      if (setting.proxy?.param) {
        headers['token'] = setting.proxy.param
      }
      const reqData = {
        model: 'gpt-3.5-turbo',
        stream: true,
        messages: this.chatList
          .filter((item) => item.role != 'system')
          .map((item) => ({ role: item.role, content: item.content }))
      }
      return { url, options: { method: 'POST', headers: headers, body: reqData } }
    }
  },
  actions: {
    /**
     * 添加用户会话
     * @param message 用户会话消息
     */
    createUserInfo(message: string): number {
      const index =
        this.chatList.push({ role: 'user', content: message, date: new Date(), position: -1 }) - 1
      const position = createPositionKey(index)
      this.chatList[index].position = position
      return position
    },
    /**
     * 在现有基础末尾添加聊天列表
     * @returns 创建的列表唯一id，后续append以及定位需通过此id
     */
    createChatListItem(role: string, content?: string, date?: Date, ticks?: number): number {
      const index =
        this.chatList.push({
          role: role,
          content: content ?? '',
          date: date ?? new Date(),
          ticks: ticks,
          position: -1
        }) - 1
      const position = createPositionKey(index)
      this.chatList[index].position = position
      return position
    },
    /**
     * 修改聊天记录
     * @param position create提供的位置信息
     * @param value 需要修改的值
     * @param appendMode 是否为添加模式
     */
    modifyChatListItem(
      position: number,
      value: { content: string; ticks?: number },
      appendMode: true
    ): void {
      const index = innerPositionMap.get(position)
      if (!index) throw new Error('invalid position: ' + position)
      if (appendMode) {
        this.chatList[index].content += value.content
        if (this.chatList[index].ticks ?? (this.chatList[index].ticks = value.ticks ?? 0))
          this.chatList[index].ticks && (this.chatList[index]['ticks'] = 1)
      } else {
        this.chatList[index].content = value.content
        this.chatList[index].ticks = value.ticks
      }
    },
    /**
     * 删除列表
     * @param position 需要删除的位置
     */
    dropChatListItem(position: number): void {
      const index = innerPositionMap.get(position)
      if (!index && index != 0) throw new Error('invalid position')
      this.chatList.splice(index, 1)
      innerPositionMap.forEach((value, key) => {
        if (value > index) innerPositionMap.set(key, value - 1)
      })
    },
    /**
     *
     * @param position 传入的位置
     * @returns 真实的数组位置
     */
    getRealIndex(position: number): number {
      const index = innerPositionMap.get(position)
      if (!index) throw new Error('invalid position')
      return index
    }
  }
})

/**
 * 内外部位置映射
 * 内部维护一个列表，他的position可能随意变化。外部提供一个唯一id，通过这个map来映射
 */
const innerPositionMap: Map<number, number> = new Map()
let count = 0
const createPositionKey = (index: number): number => {
  const t = count++
  innerPositionMap.set(t, index)
  return t
}
