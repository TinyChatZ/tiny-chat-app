import { StatusCode } from './StatusCode'

export interface TinyResult<T> {
  data?: T
  code: StatusCode
  message: string
  error?: unknown
  success: boolean
}

export class TinyResultBuilder {
  static buildSuccess<T>(data?: T): TinyResult<T> {
    return {
      code: StatusCode.C200,
      message: StatusCode.C200,
      data: data,
      success: true
    }
  }

  static buildException(code: StatusCode, error?: unknown): TinyResult<undefined> {
    return {
      code,
      error,
      message: code,
      success: false
    }
  }

  /**
   * fail-safe，当出现错误时返回缺省数据的场景
   * @param code 错误提示吗
   * @param data 错误场景下返回的data
   * @returns 返回
   */
  static buildDataWithException<T>(code: StatusCode, data?: T): TinyResult<T> {
    return {
      code,
      data,
      message: code,
      success: true
    }
  }
}
