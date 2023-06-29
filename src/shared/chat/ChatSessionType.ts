import { randomUUID } from 'crypto'
import { ChatItem } from './ChatType'

/**
 * 会话管理索引持久化Item
 *
 */
export interface ChatSessionIndexItemType {
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
 * Chat会话持久化Item
 * 提供给main使用，保存会话中的持久化数据
 */
export interface ChatSessionItemStorageType extends ChatSessionIndexItemType {
  /** 该会话下的对话记录 */
  chatList: Array<ChatItem>
}

/**
 * ChatgptStore上下文对象
 * 提供给renderer使用，保存了会话状态
 */
export interface ChatSessionItemType extends ChatSessionItemStorageType {
  /** 加载时间 */
  loadTime: Date
  /** 同步状态 */
  syncState: 'sync' | 'unsync'
  /** 激活状态
   * 一个Item激活代表他有存活的ChatStore在内存中
   */
  activationStatus?: 'activtion' | 'inactive'
}

/**
 *
 * @returns 获取默认的IndexItem
 */
export const getChatSessionIndexItemDefault = (): ChatSessionIndexItemType => {
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
 * 获取默认的持久化Detail
 * @param index index，如果有值则继承index的内容
 * @returns 返回默认的Detail持久化信息
 */
export const getChatSessionItemStorageTypeDefault = (
  index?: ChatSessionIndexItemType
): ChatSessionItemStorageType => {
  return {
    ...(index ? index : getChatSessionIndexItemDefault()),
    chatList: []
  }
}
/**
 * 获取运行时默认DetailItem
 * @param index
 * @param storage
 * @returns
 */
export const getChatSessionItemTypeDefault = (
  base?: ChatSessionIndexItemType
): ChatSessionItemType => ({
  ...(base
    ? { ...getChatSessionItemStorageTypeDefault(base), ...base }
    : getChatSessionItemStorageTypeDefault()),
  loadTime: new Date(),
  syncState: 'unsync'
})
