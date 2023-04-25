export interface RpcResult<T> {
  // 成功为true否则为false
  success: boolean
  // 返回的数据
  data?: T
  // 异常时的消息
  errMessage?: string
}
export const RpcUtils = {
  success<T>(data: T): RpcResult<T> {
    return { success: true, data: data }
  },
  error<T>(errMessage: string): RpcResult<T> {
    return { success: false, errMessage: errMessage }
  }
}
