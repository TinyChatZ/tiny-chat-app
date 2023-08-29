import { useSettingStore } from '@renderer/stores/SettingStore'
import { ChatGPTService } from './ChatGPTService'
import { WenXinService } from './WenXinService'

export interface ChatBotInterface {
  /** 根据当前上下文获取AI回复
   * @param chatItemId 当前chatItemStore的Id
   * @param refreshHook 刷新钩子
   */
  getChatResultStream(
    chatItemId?: string,
    refreshHook?: (isQuestionCreate: boolean) => void
  ): Promise<void>
  /** 获取某个对话标题 */
  getChatTitle(chatItemId: string | undefined, prompt: string): Promise<string>
}

export function getService(): ChatBotInterface {
  const setting = useSettingStore().model.common
  switch (setting.defaultModel) {
    case 'chatgpt':
      return ChatGPTService.INSTANCE
    case 'wenxin':
      return WenXinService.INSTANCE
  }
  return {
    /** 根据当前上下文获取AI回复
     * @param chatItemId 当前chatItemStore的Id
     * @param refreshHook 刷新钩子
     */
    getChatResultStream(): Promise<void> {
      throw 'not found'
    },
    /** 获取某个对话标题 */
    getChatTitle(): Promise<string> {
      throw 'not found'
    }
  }
}
