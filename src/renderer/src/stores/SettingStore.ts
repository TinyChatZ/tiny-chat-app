import { defineStore } from 'pinia'
import { type SettingType, getDefaultSetting } from '@shared/config/SettingType'
import { useMessage } from 'naive-ui'

const useSettingStore = defineStore('setting', {
  state: (): SettingType => getDefaultSetting(),
  getters: {
    getUrl(): string {
      return this.chatgpt?.proxy?.address || 'https://api.openai.com' + '/v1/chat/completions'
    },
    getHeaders(): { Authorization: string } {
      return {
        Authorization: this.chatgpt?.token || ''
      }
    }
  },
  actions: {
    /**
     * 首次调用从主进程获取设置时使用
     *
     * 区别在于会把从持久化中拿到的值存放在initData中
     *
     */
    async initSettingParams(): Promise<RpcResult<SettingType>> {
      const res = await this.getSettingParams()
      initData = JSON.parse(JSON.stringify(this.cloneNewSetting()))
      return Promise.resolve(res)
    },
    /**
     *获取配置信息
     */
    async getSettingParams(): Promise<RpcResult<SettingType>> {
      const res = await window.api.getSettingParams()
      this.chatgpt = res.data.chatgpt
      this.general = res.data.general
      this.shortcuts = res.data.shortcuts
      this.other = res.data.other
      return res
    },
    /** 全量更新配置信息 */
    async setSettingParams(data: SettingType): Promise<RpcResult<SettingType>> {
      const res = await window.api.setSettingParams(JSON.stringify(data))
      if (res.success) {
        await this.getSettingParams()
      } else {
        useMessage().error(`写入配置失败:${res?.errMessage}`)
      }

      return res
    },
    /**
     * 手动创建新对象，建议用这个方式clone
     *
     */
    cloneNewSetting(): SettingType {
      return {
        chatgpt: this.chatgpt,
        general: this.general,
        shortcuts: this.shortcuts,
        other: this.other
      }
    },
    getValueByStr(str: string): unknown {
      const properties = str.split('.')
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      let value = this
      for (const prop of properties) {
        if (value === undefined) {
          return undefined
        }
        value = value[prop]
      }
      return value
    },
    /**
     * 重置成首次从磁盘中获取的值
     */
    resetInitSetting(): void {
      if (initData) {
        this.$patch(initData)
      } else {
        this.$reset()
      }
    }
  }
})

export { useSettingStore }
/**
 * 在setting初始化的时候将第一次的值存入到初始值内，如果该值为undefined则使用初始值
 */
let initData: undefined | SettingType

/**
 * 注册自动刷新设置
 */
window.handler.updateSettingState((_e, value) => {
  useSettingStore().$patch(value)
  return value
})
