import { defineStore } from 'pinia'
import { type SettingType, getDefaultSetting } from '@shared/config/SettingType'
import { useMessage } from 'naive-ui'

/** 一些运行时共享的状态，无需持久化 */
export interface RuntimeSettingParams {
  /** 是否展示完整对话界面 */
  showDialogState: boolean
  /** 系统信息 */
  systemInfo: Map<string, string>
}

function getDefaultRunTimeSettingParam(): RuntimeSettingParams {
  return {
    showDialogState: true,
    systemInfo: new Map()
  }
}

const useSettingStore = defineStore('setting', {
  state: (): SettingType & { runtime: RuntimeSettingParams } => ({
    ...getDefaultSetting(),
    runtime: getDefaultRunTimeSettingParam()
  }),
  getters: {
    getUrl(): string {
      return this.model.chatgpt?.proxy?.address || 'https://api.openai.com' + '/v1/chat/completions'
    },
    getHeaders(): { Authorization: string } {
      return {
        Authorization: this.model.chatgpt?.token || ''
      }
    },
    /**
     * 获取当前的显示模式，如果配置为system则是经过计算的
     * @returns light，dark
     */
    getDisplayMode(): 'light' | 'dark' {
      if (this.general.displayMode !== 'system') return this.general.displayMode

      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark'
      } else {
        return 'light'
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
      // 获取系统信息
      this.runtime.systemInfo = await window.api.getSysInfo()
      // 获取配置信息
      const res = await this.getSettingParams()
      initData = JSON.parse(JSON.stringify(this.cloneNewSetting()))
      return Promise.resolve(res)
    },
    /**
     *获取配置信息
     */
    async getSettingParams(): Promise<RpcResult<SettingType>> {
      const res = await window.api.getSettingParams()
      this.account = res.data.account
      this.general = res.data.general
      this.shortcuts = res.data.shortcuts
      this.other = res.data.other
      this.model = res.data.model
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
        account: this.account,
        general: this.general,
        shortcuts: this.shortcuts,
        session: this.session,
        other: this.other,
        model: this.model
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
