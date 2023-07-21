import { MessageApiInjection } from 'naive-ui/es/message/src/MessageProvider'
import { useMessage } from 'naive-ui'
import { StatusCode } from '@shared/common/StatusCode'
import { TinyResult } from '@shared/common/TinyResult'

/**
 * 处理异常等情况
 */
export interface TinyResultHandler {
  handlerSuccess: <T>(result: TinyResult<T>) => void
  handlerError: <T>(result: TinyResult<T>) => void
  handlerWarn: <T>(result: TinyResult<T>) => void
}

export class TinyResultUiMessageHandler implements TinyResultHandler {
  private message: MessageApiInjection
  public constructor(message: MessageApiInjection) {
    this.message = message
  }
  handlerSuccess(): void {
    /** do nothing */
  }
  handlerError<T>(result: TinyResult<T>): void {
    this.message.error(result.message)
  }
  handlerWarn<T>(result: TinyResult<T>): void {
    this.message.warning(result.message)
  }
}

export class TinyResultUtils {
  public static defaultHandler: TinyResultHandler
  static getDataUndefined<T>(result: TinyResult<T>, handler?: TinyResultHandler): T | undefined {
    return this.getData(result, () => undefined, handler)
  }
  /** 通用方法，默认使用naive-ui的message打印错误信息 */
  static getData<T>(
    result: TinyResult<T>,
    defaultData: (result: TinyResult<T>) => T,
    handler?: TinyResultHandler
  ): T {
    if (result.success && result.code === StatusCode.C200) {
      handler ? handler.handlerSuccess(result) : this.defaultHandler.handlerSuccess(result)
      return result.data ?? defaultData(result)
    } else if (result.success) {
      handler ? handler.handlerWarn(result) : this.defaultHandler.handlerWarn(result)
      return result.data ?? defaultData(result)
    } else {
      handler ? handler.handlerError(result) : this.defaultHandler.handlerError(result)
      return defaultData(result)
    }
  }
  static getDataProcessError<T>(result: TinyResult<T>): T | undefined {
    const message = useMessage()
    if (result.success) {
      return result.data
    } else {
      message.error(result.message)
      return undefined
    }
  }
  static getDataIgnoreError<T>(result: TinyResult<T>): T | undefined {
    return result.data
  }
  static getDataProcessWarn<T>(result: TinyResult<T>): T | undefined {
    const message = useMessage()
    if (result.success && result.code !== StatusCode.C200) {
      return result.data
    } else {
      message.warning(result.message)
      return result.data
    }
  }
}
