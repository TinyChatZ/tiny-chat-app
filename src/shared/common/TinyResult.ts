import { StatusCode } from './StatusCode'

export interface TinyResult<T> {
  data?: T
  code: StatusCode
  message?: string
  error?: unknown
  success: boolean
}

export class TinyResultBuilder {
  static buildSuccess<T>(data?: T): TinyResult<T> {
    return {
      code: StatusCode.C200,
      data: data,
      success: true
    }
  }

  static buildException(code: StatusCode, error?: unknown): TinyResult<undefined> {
    return {
      code,
      error,
      success: false
    }
  }
}
