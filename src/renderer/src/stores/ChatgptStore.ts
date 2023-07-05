import { EventSourceOptions, getEventSource } from '@renderer/utils/EventSource'
import { defineStore } from 'pinia'
import { useSettingStore } from './SettingStore'
import { ChatItem } from '@shared/chat/ChatType'
import { TinyResult, TinyResultBuilder } from '@shared/common/TinyResult'
import { StatusCode } from '@shared/common/StatusCode'
import { useChatSessionStore } from './ChatSessionStore'
/**
 * ChatgptStoreState类型
 */
export interface ChatgptStoreState {
  id?: string
  chatList: Array<ChatItem>
  curQuestion: string
  innerPositionMap: Map<number, number>
  innerPositionCount: number
}
const settingStore = useSettingStore()

/**
 * 创建多个ChatSessionStore
 * 这也许不是一个好主意，但是通过这种方法可以实现类型的自动推导
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useChatgptStore = (id?: string) => chatgptStoreFactory(id)()
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const chatgptStoreFactory = (id?: string) =>
  defineStore(`chatgpt${id && '_' + id}`, {
    state: (): ChatgptStoreState => ({
      id,
      chatList: [],
      curQuestion: '',
      innerPositionMap: new Map(),
      innerPositionCount: 0
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
        if (i < 0) {
          limitData = this.chatList
        }
        // 如果策略是fail-fast
        else if (limitsBehavior === 'failFast') {
          throw '对话长度超出限制'
        }
        // 处理超过长度(此时i为首次超过的下标)
        else if (limitsBehavior === 'failSafe') {
          limitData = this.chatList.slice(i)
          if (calculateType === 'block' && limitData.length > 1) {
            limitData = limitData.slice(1)
          } else if (calculateType === 'character') {
            limitData[limitData.length - 1].content = limitData[limitData.length - 1].content.slice(
              limits - length + curLength
            )
          }
        }
        // 过滤掉系统消息（前面计算时已经忽略了系统消息但是没有过滤）
        return limitData.filter((item) => item.role !== 'system')
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
        const position = this.createPositionKey(index)
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
        const position = this.createPositionKey(index)
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
        const index = this.innerPositionMap.get(position)
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
      async dropChatListItem(position: number): Promise<void> {
        const index = this.innerPositionMap.get(position)
        if (!index && index != 0) throw new Error('invalid position')
        this.chatList.splice(index, 1)
        this.innerPositionMap.forEach((value, key) => {
          if (value > index) this.innerPositionMap.set(key, value - 1)
        })
        const chatSessionStore = useChatSessionStore()
        // 同步对话记录
        this.id && (await chatSessionStore.syncSessionInfo(this.id, this.chatList))
      },
      /**
       * 创建一个提问请求
       * @param question 需要请求的用户问题
       * @param refreshHook 刷新钩子，stream模式下，每次更新数据是回调
       */
      async sendChatGPTQuery(
        question: string,
        refreshHook?: () => void
      ): Promise<TinyResult<void>> {
        this.createUserInfo(question)
        const gptSetting = settingStore.chatgpt
        if (!gptSetting?.token) {
          return TinyResultBuilder.buildException(StatusCode.E20001)
        }
        const { url, options } = this.getRequestParam
        const position = this.createChatListItem('assistant')
        // 发起EventSource调用
        try {
          await getEventSource<{ choices: Array<{ delta: { role?: string; content?: string } }> }>(
            url,
            options,
            // 渲染结果
            (res) => {
              if (typeof res.data !== 'string') {
                if (res.data?.choices[0].delta?.role) {
                  this.chatList[this.getRealIndex(position)].role = res.data?.choices[0].delta?.role
                } else if (res.data?.choices[0].delta?.content) {
                  this.chatList[this.getRealIndex(position)].content +=
                    res.data?.choices[0].delta?.content
                  refreshHook && refreshHook()
                }
              }
            }
          )
        } catch (e) {
          this.dropChatListItem(position)
          return TinyResultBuilder.buildException(StatusCode.E20002)
        } finally {
          const chatSessionStore = useChatSessionStore()
          // 同步对话记录
          this.id && (await chatSessionStore.syncSessionInfo(this.id, this.chatList))
        }
        return TinyResultBuilder.buildSuccess()
      },
      /**
       * 获取真实的索引
       * @param position 传入的位置
       * @returns 真实的数组位置
       */
      getRealIndex(position: number): number {
        const index = this.innerPositionMap.get(position)
        if (!index) throw new Error('invalid position')
        return index
      },
      /**
       * 刷新内部维护的映射表
       * 首次加载，或者长时间改动index顺序时可能需要刷新一下维护的映射表
       * 注意调用此方法，原先映射关系将全部失效
       */
      refreshIndexMap(): void {
        this.innerPositionMap.clear()
        for (let i = 0; i < this.chatList.length; i++) {
          this.innerPositionMap.set(this.chatList[i].id, i)
        }
      },
      /**
       * 创建一个外部引用的绝对位置
       * @param index 内部数组的位置
       * @returns 外部可以引用的绝对位置
       */
      createPositionKey(index: number): number {
        const t = this.innerPositionCount++
        this.innerPositionMap.set(t, index)
        return t
      }
    }
  })
