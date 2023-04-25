import { defineStore } from 'pinia'

/**
 * ChatGPT配置
 */
interface SettingChatgptType {
  /**
   * OpenAi token
   */
  token: string
  /** 代理服务配置 */
  proxy: {
    /** 代理服务地址 */
    address: string
    /** 代理服务token */
    param: string
  }
}
/** 通用设置 */
interface SettingGeneralType {
  dispalyMode: 'auto' | 'dark' | 'light'
  windowTop: boolean
  saveWindowPosition: boolean
  windowSize: {
    width: number
    height: number
  }
  windowPosition: {
    width?: number
    height?: number
  }
  fontFamily: string
  fontSize: number
}

/** 快捷键配置 */
interface SettingShortcuts {
  send: string
  refresh: string
  minimize: string
  windowTop: string
  doFixedWindowPosition: string
  undoFixedWindowPosition: string
}
/** 其他特殊配置 */
interface SettingOther {
  devMode: boolean
}

interface SettingStoreState {
  /** ChatGPT配置 */
  chatgpt: SettingChatgptType
  /** 通用设置 */
  general: SettingGeneralType
  /** 快捷键配置 */
  shortcuts: SettingShortcuts
  /** 其他特殊配置 */
  other: SettingOther
}

const useSettingStore = defineStore('setting', {
  state: (): SettingStoreState => ({
    chatgpt: {
      token: '',
      proxy: {
        address: '',
        param: ''
      }
    },
    general: {
      dispalyMode: 'light',
      windowTop: false,
      saveWindowPosition: false,
      windowSize: {
        width: 400,
        height: 650
      },
      windowPosition: {},
      fontFamily: '',
      fontSize: 18
    },
    shortcuts: {
      send: '',
      refresh: '',
      minimize: '',
      windowTop: '',
      doFixedWindowPosition: '',
      undoFixedWindowPosition: ''
    },
    other: {
      devMode: false
    }
  }),
  getters: {
    getChatgpt(): SettingChatgptType {
      return this.chatgpt ?? {}
    },
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
    async initSettingParams(): Promise<RpcResult<SettingStoreState>> {
      const res = await this.getSettingParams()
      initData = JSON.parse(JSON.stringify(this.cloneNewSetting()))
      return Promise.resolve(res)
    },
    /**
     *获取配置信息
     */
    async getSettingParams(): Promise<RpcResult<SettingStoreState>> {
      const res = await window.api.getSettingParams()
      this.chatgpt = res.data.chatgpt
      this.general = res.data.general
      this.shortcuts = res.data.shortcuts
      this.other = res.data.other
      return res
    },
    /** 全量更新配置信息 */
    async setSettingParams(data: SettingStoreState): Promise<RpcResult<SettingStoreState>> {
      const res = await window.api.setSettingParams(JSON.stringify(data))
      if (res.success) {
        this.getSettingParams()
      }
      return res
    },
    /**
     * 更新chatgpt配置
     * @param data chatgpt相关配置
     * @returns 返回
     */
    async updateChatgptParams(data: SettingChatgptType): Promise<RpcResult<SettingStoreState>> {
      this.chatgpt = data
      return this.setSettingParams(this.$state)
    },
    /**
     * 手动创建新对象，建议用这个方式clone
     *
     */
    cloneNewSetting(): SettingStoreState {
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

export {
  useSettingStore,
  type SettingChatgptType,
  type SettingGeneralType,
  type SettingShortcuts,
  type SettingStoreState
}
/**
 * 在setting初始化的时候将第一次的值存入到初始值内，如果该值为undefined则使用初始值
 */
let initData: undefined | SettingStoreState

/**
 * 注册自动刷新设置
 */
window.handler.updateSettingState((_e, value) => {
  useSettingStore().$patch(value)
  return value
})
