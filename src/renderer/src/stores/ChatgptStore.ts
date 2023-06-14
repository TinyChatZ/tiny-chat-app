import { EventSourceOptions } from '@renderer/utils/EventSource'
import { defineStore } from 'pinia'
import { useSettingStore } from './SettingStore'
/**
 * 对话Item
 */
export interface ChatItem {
  /** 角色 */
  role: string
  /** 文本内容 */
  content: string
  /** 创建日期 */
  date: Date
  /** chatGPT返回的ticks */
  ticks?: number
  /** 元素唯一主键 */
  id: number
}
/**
 * ChatgptStoreState类型
 */
export interface ChatgptStoreState {
  chatList: Array<ChatItem>
  curQuestion: string
}
const settingStore = useSettingStore()
export const useChatgptStore = defineStore('chatgpt', {
  state: (): ChatgptStoreState => ({
    chatList: [],
    curQuestion: ''
  }),
  getters: {
    getRequestParam(): { url: string; options: EventSourceOptions } {
      // 不会重复创建 https://pinia.vuejs.org/zh/cookbook/composing-stores.html#shared-getters
      const setting = settingStore.chatgpt
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
        messages: this.getLimitsData.map((item) => ({ role: item.role, content: item.content }))
      }
      return { url, options: { method: 'POST', headers: headers, body: reqData } }
    },
    /**
     * 计算请求限制策略执行后的数据
     */
    getLimitsData(): Array<ChatItem> {
      const calculateType = settingStore.chatgpt.options.limitsCalculate
      const limitsBehavior = settingStore.chatgpt.options.limitsBehavior
      const limits = settingStore.chatgpt.options.limitsLength
      let limitData = new Array<ChatItem>()
      let length = 0
      let curLength = 0
      // 找到超过的起始位置
      let i
      for (i = this.chatList.length - 1; i >= 0; i--) {
        const item = this.chatList[i]
        curLength = item.content.length
        length += curLength
        if (item.role === 'system') continue
        if (length > limits) {
          // 代表超过了
          break
        }
      }
      // 如果i<0表示没有超出直接返回
      console.log(i)
      if (i < 0) {
        return this.chatList
      }
      // 如果策略是fail-fast
      if (limitsBehavior === 'failFast') {
        throw '对话长度超出限制'
      } else if (limitsBehavior === 'failSafe') {
        // 处理超过长度(此时i为首次超过的下标)
        limitData = this.chatList.slice(i)
        if (calculateType === 'block' && limitData.length > 1) {
          limitData = limitData.slice(1)
        } else if (calculateType === 'character') {
          limitData[limitData.length - 1].content = limitData[limitData.length - 1].content.slice(
            limits - length + curLength
          )
        }
      }
      return limitData
    }
  },
  actions: {
    /**
     * 添加用户会话
     * @param message 用户会话消息
     */
    createUserInfo(message: string): number {
      const index =
        this.chatList.push({ role: 'user', content: message, date: new Date(), id: -1 }) - 1
      const position = createPositionKey(index)
      this.chatList[index].id = position
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
          id: -1
        }) - 1
      const position = createPositionKey(index)
      this.chatList[index].id = position
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
     * 获取真实的索引
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
