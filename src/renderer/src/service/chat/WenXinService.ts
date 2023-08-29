import { useSettingStore } from '@renderer/stores/SettingStore'
import { ChatBotInterface } from './ChatBotInterface'
import { useChatItemStore } from '@renderer/stores/ChatItemStore'
import { getEventSource } from '@renderer/utils/EventSource'

export class WenXinService implements ChatBotInterface {
  public static readonly INSTANCE: WenXinService = new WenXinService()

  private constructor() {
    // 私有构造方法
  }

  async getChatResultStream(
    chatItemId?: string | undefined,
    refreshHook?: ((isQuestionCreate: boolean) => void) | undefined
  ): Promise<void> {
    const chatItemStore = useChatItemStore(chatItemId)
    try {
      console.log(this.getRequestOptions(chatItemId))
    } catch (e) {
      console.error(e)
    }
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
          if (item.error_code === undefined && item.result) {
            chatItemStore.chatList[chatItemStore.getRealIndex(position)].content += item.result
            refreshHook && refreshHook(false)
          }
        }
      )
    } catch (e) {
      chatItemStore.dropChatListItem(position)
      throw e
    }
  }

  async getChatTitle(chatItemId: string | undefined, prompt: string): Promise<string> {
    // 发起请求
    const { url, options } = this.getRequestOptions(chatItemId)
    // options.body.messages.map((item) => ({
    //   role: item.role,
    //   content: item.content
    // }))
    let req = ''
    options.body.messages.forEach((item) => (req += `${item.role}: ${item.content}\n\n`))
    options.body.messages = [
      {
        role: 'user',
        content: prompt + '\n' + req
      }
    ]
    try {
      const res = await getEventSource(url, options)
      let title = ''
      for (const item of res.data) {
        const res = this.parseResult(item)
        if (res.error_code === undefined && res.result) {
          title += res.result
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

  /**
   * 获取请求参数
   */
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  getRequestOptions(chatItemId?: string) {
    const setting = useSettingStore().model.wenxin
    const chatItemStore = useChatItemStore(chatItemId)

    // 如果拿不到token就配置
    if (!setting?.accessToken) {
      throw new Error('token is not exists')
    }
    const url = `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/eb-instant?access_token=${setting.accessToken}`

    const headers = {
      'Content-Type': 'application/json'
    }
    // 文心一言要求role：user、assistant必须交替出现，且第一个为用户
    const messages = new Array<{ role: string; content: string }>()
    for (let i = 0; i < chatItemStore.chatList.length; i++) {
      if (i === 0 && chatItemStore.chatList[i].role !== 'user')
        messages.push({ role: 'user', content: '忽略' })
      else if (i !== 0 && chatItemStore.chatList[i].role === messages[messages.length - 1].role)
        messages.push({
          role: messages[messages.length - 1].role === 'user' ? 'assistant' : 'user',
          content: '忽略'
        })

      messages.push({
        role: chatItemStore.chatList[i].role,
        content: chatItemStore.chatList[i].content
      })
    }
    const options = {
      method: 'POST',
      headers: headers,
      body: {
        stream: true,
        messages
      }
    }

    return { url, options }
  }

  /**
   * 处理EventSource结果
   */
  parseResult(data: string): WenXinResult {
    if (data.startsWith('data')) data = data.substring(5)
    const res = JSON.parse(data)
    if (res.error_code !== undefined) {
      console.error(res)
      throw 'get result failure'
    }
    return JSON.parse(data)
  }
}

interface WenXinResult {
  id: string
  object: string
  created: number
  sentence_id: number
  is_end: boolean
  is_truncated: boolean
  result: string
  need_clear_history: boolean
  ban_round: number
  usage: {
    prompt_tokens: number
    completion_tokens: number
  }
  error_code: number
  error_msg: string
}
