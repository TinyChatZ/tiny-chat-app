import { ChatBotInterface } from './ChatBotInterface'
import { useChatItemStore } from '@renderer/stores/ChatItemStore'
import { useSettingStore } from '@renderer/stores/SettingStore'
import { getEventSource } from '@renderer/utils/EventSource'

/**
 * ChatGPT功能类
 */
export class ChatGPTService implements ChatBotInterface {
  public static readonly INSTANCE: ChatGPTService = new ChatGPTService()

  private constructor() {
    // 私有构造方法
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  getRequestOptions(chatItemId?: string) {
    const setting = useSettingStore().model.chatgpt
    const chatItemStore = useChatItemStore(chatItemId)

    // 如果拿不到token就配置
    if (!setting?.token) {
      throw new Error('token is not exists')
    }
    const url =
      ((setting.proxy.useProxy && setting.proxy?.address) || 'https://api.openai.com') +
      '/v1/chat/completions'
    const headers = {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + setting.token
    }
    if (setting.proxy?.param) {
      headers['token'] = setting.proxy.param
    }
    const options = {
      method: 'POST',
      headers: headers,
      body: {
        model: 'gpt-3.5-turbo',
        stream: true,
        messages: chatItemStore.getLimitsData.map((item) => ({
          role: item.role,
          content: item.content
        }))
      }
    }

    return { url, options }
  }

  /**
   * 发送ChatGPT查询
   */
  async getChatResultStream(
    chatItemId?: string,
    refreshHook?: (isQuestionCreate: boolean) => void
  ): Promise<void> {
    const chatItemStore = useChatItemStore(chatItemId)
    const { url, options } = this.getRequestOptions(chatItemId)
    // 创建item
    const position = chatItemStore.createChatListItem('assistant')
    refreshHook && refreshHook(true)
    // 发起EventSource调用
    try {
      await getEventSource(
        url,
        options,
        // 渲染结果
        (res) => {
          const item = this.parseResult(res)
          if (item?.choices[0].delta?.role) {
            chatItemStore.chatList[chatItemStore.getRealIndex(position)].role =
              item?.choices[0].delta?.role
          } else if (item?.choices[0].delta?.content) {
            chatItemStore.chatList[chatItemStore.getRealIndex(position)].content +=
              item?.choices[0].delta?.content
            refreshHook && refreshHook(false)
          }
        }
      )
    } catch (e) {
      chatItemStore.dropChatListItem(position)
      throw e
    }
  }
  /**
   * 获取某个Chat的标题信息
   */
  async getChatTitle(chatItemId: string | undefined, prompt: string): Promise<string> {
    // 发起请求
    const { url, options } = this.getRequestOptions(chatItemId)
    options.body.messages.map((item) => ({
      role: item.role,
      content: item.content
    }))
    options.body.messages.unshift({
      role: 'system',
      content: prompt
    })
    try {
      const res = await getEventSource(url, options)
      let title = ''
      for (const data of res.data) {
        const item = this.parseResult(data)
        if (item?.choices[0].delta?.content) {
          title += item?.choices[0].delta?.content
        }
      }
      if (title.length > 50) {
        console.warn(`发生标题缩减原始结果为：${title}`)
        title = title.substring(0, 50)
      }
      return title
    } catch {
      return ''
    }
  }
  parseResult(data: string): ChatGPTResult | undefined {
    if (data === 'data: [DONE]') return
    if (data.startsWith('data:')) data = data.substring(5)
    try {
      return JSON.parse(data)
    } catch {
      return
    }
  }
}

interface ChatGPTResult {
  id: string
  object: string
  created: number
  model: string
  choices: [
    {
      index: number
      delta: {
        content: string
        role: string
      }
    }
  ]
  finish_reason: string
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}
