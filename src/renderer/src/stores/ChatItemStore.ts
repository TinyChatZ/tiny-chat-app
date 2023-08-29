import { defineStore } from 'pinia'
import { useSettingStore } from './SettingStore'
import { ChatItem } from '@shared/chat/ChatType'
import { TinyResult, TinyResultBuilder } from '@shared/common/TinyResult'
import { StatusCode } from '@shared/common/StatusCode'
import { useChatSessionStore } from './ChatSessionStore'
import { getService } from '@renderer/service/chat/ChatBotInterface'
/**
 * ChatItemStoreState类型
 */
export interface ChatItemStoreState {
  id?: string
  chatList: Array<ChatItem>
  curQuestion: string
  innerPositionMap: Map<number, number>
  innerPositionCount: number
}

/**
 * 创建多个ChatSessionStore
 * 这也许不是一个好主意，但是通过这种方法可以实现类型的自动推导
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useChatItemStore = (id?: string) => chatItemStoreFactory(id)()
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const chatItemStoreFactory = (id?: string) =>
  defineStore(`chatgpt${id && '_' + id}`, {
    state: (): ChatItemStoreState => ({
      id,
      chatList: [],
      curQuestion: '',
      innerPositionMap: new Map(),
      innerPositionCount: 0
    }),
    getters: {
      /**
       * 计算请求限制策略执行后的数据
       */
      getLimitsData(): Array<ChatItem> {
        const settingStore = useSettingStore()
        const calculateType = settingStore.model.common.options.limitsCalculate
        const limitsBehavior = settingStore.model.common.options.limitsBehavior
        const limits = settingStore.model.common.options.limitsLength
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
        if (this.chatList.length <= 0) return
        for (let i = 0; i < this.chatList.length; i++) {
          this.chatList[i].id = i
          this.innerPositionMap.set(this.chatList[i].id, i)
        }
        this.innerPositionCount = this.chatList[this.chatList.length - 1]?.id + 1
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
      },
      /**
       * 创建一个提问请求
       * @param question 需要请求的用户问题
       * @param refreshHook 刷新钩子，stream模式下，每次更新数据是回调
       */
      async sendChatGPTQuery(
        question: string,
        refreshHook?: (isQuestionCreate: boolean) => void
      ): Promise<TinyResult<void>> {
        // 修改session状态
        const chatSessionStore = useChatSessionStore()
        this.id && chatSessionStore.prepareSessionSyncStatus(this.id, 'generateChat')
        // 开始发送gpt请求
        this.createUserInfo(question)
        try {
          await getService().getChatResultStream(this.id, refreshHook)
        } catch (e) {
          return TinyResultBuilder.buildException(StatusCode.E20002)
        } finally {
          const chatSessionStore = useChatSessionStore()
          // 同步对话记录
          this.id && (await chatSessionStore.syncSessionInfo(this.id, this.chatList))
        }
        return TinyResultBuilder.buildSuccess()
      },

      /** 获取当前ChatList的总结信息
       * 用于自动标题生成 */
      async getChatListRefining(): Promise<string> {
        // 获取sessionStore
        const chatSessionStore = useChatSessionStore()
        try {
          this.id && chatSessionStore.prepareSessionSyncStatus(this.id, 'generateTitle')
        } catch (e) {
          console.log(e)
          if (e === StatusCode.E20009) {
            window.$message.error('内容生成中，暂不支持创建标题')
            return ''
          }
        }
        // 获取配置
        const settingStore = useSettingStore()
        if (!settingStore.model.common.prompts.generateTitle) {
          window.$message.error('需配置标题生成的prompts')
          this.id && chatSessionStore.sessionModifySuccess(this.id)
          return ''
        }
        // 发起请求
        try {
          return await getService().getChatTitle(
            this.id,
            settingStore.model.common.prompts.generateTitle
          )
        } catch {
          window.$message.error('请求失败，请检查网络')
          this.id && chatSessionStore.sessionModifySuccess(this.id)
          return ''
        }
      }
    }
  })
