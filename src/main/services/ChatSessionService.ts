// 对话中会话管理服务

import {
  ChatSessionIndexType,
  ChatSessionItemType,
  getChatSessionIndexDefault,
  getChatSessionItemDefault
} from '@shared/chat/ChatSessionType'
import { getConfigPath } from '../utils/PathUtils'
import path from 'path'
import fs from 'fs/promises'
import { TinyResult, TinyResultBuilder } from '@shared/common/TinyResult'
import { StatusCode } from '@shared/common/StatusCode'

/** 获取保存的路径位置 */
const configDirPath = path.parse(getConfigPath()).dir
const cachePath = {
  dir: path.join(configDirPath, '/session'),
  index: path.join(configDirPath, '/session', 'index.json')
}

/** 缓存索引的Map */
let cacheIndexMap: Map<string, ChatSessionIndexType> = new Map()
const cacheDetailMap: Map<string, ChatSessionItemType> = new Map()
let initFlag = false

/** 获取索引Map */
export async function getIndexMap(): Promise<TinyResult<Map<string, ChatSessionIndexType>>> {
  if (!initFlag) {
    try {
      const data = await fs.readFile(cachePath.index)
      cacheIndexMap = new Map(
        Object.entries(
          JSON.parse(data.toString(), (k, v) => {
            if (k !== 'createTime' && k !== 'updateTime') return v
            return new Date(Date.parse(v))
          })
        )
      )
    } catch (e) {
      // 如果直接读取失败，就创建索引
      const syncRes = await syncStorage({ type: 'index' })
      cacheIndexMap = new Map()
      if (!syncRes.success)
        return TinyResultBuilder.buildDataWithException(StatusCode.E20008, cacheIndexMap)
    }
    initFlag = true
    return TinyResultBuilder.buildSuccess(cacheIndexMap)
  } else {
    return TinyResultBuilder.buildSuccess(cacheIndexMap)
  }
}

/** 创建或者更新一条索引记录,对生成对应的detail */
export async function saveIndexItem(detailItem?: ChatSessionItemType): Promise<string> {
  try {
    // 创建一个索引
    if (!detailItem) {
      const indexItem = getChatSessionIndexDefault()
      cacheIndexMap.set(indexItem.id, indexItem)
      await syncStorage({ type: 'index' })
      detailItem = getChatSessionItemDefault(indexItem)
      await syncStorage({ type: 'detail', item: detailItem, op: 'create' })
      cacheDetailMap.set(detailItem.id, detailItem)
      return detailItem.id
    } else {
      // 修改一个索引
      cacheIndexMap.set(detailItem.id, {
        ...detailItem,
        chatList: undefined
      } as ChatSessionIndexType)
      await syncStorage({ type: 'index' })
      // 如果chatList是undefine，则不更新详情
      if (detailItem.chatList !== undefined) {
        cacheDetailMap.set(detailItem.id, detailItem)
        await syncStorage({ type: 'detail', item: detailItem, op: 'update' })
      }
      return detailItem.id
    }
  } catch (e) {
    console.error(e)
    return '-1'
  }
}

/** 删除某个索引+会话记录 */
export async function dropChatSessionItem(id: string): Promise<boolean> {
  const dropItem = cacheDetailMap.get(id)
  const result = cacheIndexMap.delete(id)
  if (dropItem && result) {
    await syncStorage({ type: 'index' })
    await syncStorage({ type: 'detail', item: dropItem, op: 'delete' })
  }
  return result
}

/**
 * 从本地空间获取会话记录
 * @param index 可以为id或者对象本身
 */
export async function getChatSessionItem(id: string): Promise<ChatSessionItemType | undefined> {
  await loadDetailItem(id)
  return cacheDetailMap.get(id)
}

/**
 * 从本地磁盘加载DetailItem
 */
async function loadDetailItem(id: string): Promise<void> {
  if (cacheDetailMap.get(id)) return
  try {
    const res = await fs.readFile(path.join(cachePath.dir, `${id}.json`))
    cacheDetailMap.set(
      id,
      JSON.parse(res.toString(), (k, v) => {
        if (k !== 'createTime' && k !== 'updateTime') return v
        return new Date(Date.parse(v))
      })
    )
  } catch (e) {
    console.error('loadDetailItem Error:', e)
  }
}

/**
 * 与物理层同步
 * @param type 操作类型，同步索引还是详情
 * @param item 操作名称，对于详情，需要传详情信息
 * @param op 操作行为，创建还是更新还是删除
 */
async function syncStorage(options: {
  type: 'index' | 'detail'
  item?: ChatSessionItemType
  op?: 'create' | 'update' | 'delete'
}): Promise<TinyResult<undefined>> {
  // // 广播更新事件
  // WindowsManageUtils.getAll().forEach((window) =>
  //   window.content.webContents.send(EventNames.ChatSession_Brocast_SessionUpdate, {
  //     index: cacheIndexMap,
  //     detail: cacheDetailMap
  //   })
  // )

  // 文件夹不在则创建
  try {
    await fs.access(cachePath.dir)
  } catch {
    await fs.mkdir(cachePath.dir, { recursive: true })
  }
  try {
    // 刷新索引
    if (options.type === 'index') {
      await fs.writeFile(
        cachePath.index,
        JSON.stringify(Object.fromEntries(cacheIndexMap), (_key, value) => {
          if (value instanceof Date) return value.getTime()
          else return value
        })
      )
    }

    // 刷新详情
    else if (options.type === 'detail') {
      switch (options?.op) {
        case 'create':
        case 'update':
          await fs.writeFile(
            path.join(cachePath.dir, `${options?.item?.id ?? 'none'}.json`),
            JSON.stringify(options?.item, (_key, value) => {
              if (value instanceof Date) return value.getTime()
              else return value
            })
          )
          return TinyResultBuilder.buildSuccess()
        case 'delete':
          await fs.unlink(path.join(cachePath.dir, `${options?.item?.id ?? 'none'}.json`))
          return TinyResultBuilder.buildSuccess()
      }
    }
  } catch (e) {
    console.error('数据同步错误', e)
    return TinyResultBuilder.buildException(StatusCode.E20007, e)
  }
  return TinyResultBuilder.buildException(StatusCode.E20007)
}
