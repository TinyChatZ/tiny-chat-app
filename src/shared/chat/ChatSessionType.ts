import { ChatItem } from './ChatType'
import { v4 } from 'uuid'

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
   * 是否生成过名称
   */
  nameGenerate: boolean
  /**
   * 创建时间
   */
  createTime: Date
  /**
   * 更新时间
   */
  updateTime: Date
}

/** 该会话下的配置信息 */
export interface ChatSessionConfigType {
  model?: {
    /** 通用配置 */
    common?: {
      /** 创建session时默认模型 */
      defaultModel?: 'wenxin' | 'chatgpt'
    }
  }
}

/**
 * ChatItemStore上下文对象
 * 保存了会话状态
 */
export interface ChatSessionItemType extends ChatSessionIndexType {
  /** 该会话下的对话记录 */
  chatList?: Array<ChatItem>
  /** 该会话下的配置信息 */
  sessionConfig?: ChatSessionConfigType
}

/**
 *
 * @returns 获取默认的IndexItem
 */
export const getChatSessionIndexDefault = (): ChatSessionIndexType => {
  const id = v4().toString()
  const createTime = new Date()
  return {
    id,
    name: '新会话',
    nameGenerate: false,
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

/**
 * 从item获取到index
 * @param base 需要转换的item
 * @returns Index
 */
export function getChatSessionIndexByItem(base: ChatSessionItemType): ChatSessionIndexType {
  const res = {
    ...base,
    chatList: undefined
  }
  return res
}
