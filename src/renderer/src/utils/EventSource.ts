export interface EventSourceOptions {
  method?: string
  headers?: HeadersInit
  body?: object
}
export interface EventSourceResultData<T> {
  type: string
  data: T | string
}
interface EventSourceResult<T> {
  data: Array<EventSourceResultData<T>>
  status: number
}

export async function getEventSource<T>(
  url: string,
  options: EventSourceOptions,
  onMessage: (data: EventSourceResultData<T>) => void
): Promise<EventSourceResult<T>> {
  const result: Array<EventSourceResultData<T>> = []
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(options.body ?? ''),
    headers: options.headers
  })
  //获取UTF8的解码
  const encode = new TextDecoder('utf-8')
  //获取body的reader
  const reader = response?.body?.getReader()
  if (response.status != 200) return Promise.reject(response)
  // 循环读取reponse中的内容
  let r: ReadableStreamReadResult<Uint8Array> | undefined
  do {
    r = await reader?.read()
    if (r && !r.done) {
      const sourceText = encode.decode(r.value)
      const sourceArray = sourceText.split(/[\n]+/).filter((v) => v != '')
      // 为什么这里用in不行，要用of才可以？
      for (const item of sourceArray) {
        const text = item.substring(6)
        try {
          const t = { type: 'object', data: JSON.parse(text) }
          result.push(t)
          onMessage && onMessage(t)
        } catch (e) {
          if (text == '[DONE]') {
            break
          }
          console.debug(e)
          console.debug(text)
          result.push({ type: 'string', data: text })
        }
      }
    }
  } while (!r?.done)
  return Promise.resolve({ data: result, status: 200 })
}
