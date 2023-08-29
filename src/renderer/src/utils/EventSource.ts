export interface EventSourceOptions {
  method?: string
  headers?: HeadersInit
  body?: object
}
interface EventSourceResult {
  data: Array<string>
  status: number
}

export async function getEventSource(
  url: string,
  options: EventSourceOptions,
  onMessage?: (data: string) => void
): Promise<EventSourceResult> {
  const result: Array<string> = []
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
        // console.log(item)
        result.push(item)
        onMessage && onMessage(item)
      }
    }
  } while (!r?.done)
  return Promise.resolve({ data: result, status: 200 })
}
