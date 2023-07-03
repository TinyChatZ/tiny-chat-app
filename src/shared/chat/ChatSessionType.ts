import { randomUUID } from 'crypto'
import { ChatItem } from './ChatType'

/**
 * 会话管理索引持久化Item
 *
 */
export interface ChatSessionIndexType {
  /**
   * 全局唯一标识
   */
  id: string
  /**
   * 映射到物理文件名称
   */
  fileName: string
  /**
   * 列表展示名
   */
  name: string
  /**
   * 创建时间
   */
  createTime: Date
  /**
   * 更新时间
   */
  updateTime: Date
}

/**
 * ChatgptStore上下文对象
 * 保存了会话状态
 */
export interface ChatSessionItemType extends ChatSessionIndexType {
  /** 该会话下的对话记录 */
  chatList?: Array<ChatItem>
}

/**
 *
 * @returns 获取默认的IndexItem
 */
export const getChatSessionIndexDefault = (): ChatSessionIndexType => {
  const id = randomUUID().toString()
  const createTime = new Date()
  return {
    id,
    name: '新会话',
    fileName: id,
    createTime,
    updateTime: createTime
  }
}

/**
 * 获取运行时默认DetailItem
 * @param index
 * @param storage
 * @returns
 */
export const getChatSessionItemDefault = (base?: ChatSessionIndexType): ChatSessionItemType => ({
  ...(base ? base : getChatSessionIndexDefault()),
  chatList: []
})
