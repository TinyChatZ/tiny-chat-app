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
