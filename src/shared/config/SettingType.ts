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
  /** 显示模式 */
  dispalyMode: 'auto' | 'dark' | 'light'
  /** 窗口置顶 */
  windowTop: boolean
  /** 保存窗口位置 */
  saveWindowPosition: boolean
  /** 窗口尺寸 */
  windowSize: {
    width: number
    height: number
  }
  /**窗口位置；由系统自己记录 */
  windowPosition: {
    width?: number
    height?: number
  }
  /** 字体 */
  fontFamily: string
  /** 字体大小 */
  fontSize: number
}

/** 快捷键配置 */
interface SettingShortcutsType {
  send: string
  refresh: string
  minimize: string
  windowTop: string
  doFixedWindowPosition: string
  undoFixedWindowPosition: string
}

/** 其他特殊配置 */
interface SettingOtherType {
  devMode: boolean
}

interface SettingType {
  /** ChatGPT配置 */
  chatgpt: SettingChatgptType
  /** 通用设置 */
  general: SettingGeneralType
  /** 快捷键配置 */
  shortcuts: SettingShortcutsType
  /** 其他特殊配置 */
  other: SettingOtherType
}

/**
 * 初始的配置信息
 * 注意这个应该是不可变的所以变成了一个方法
 */
const getDefaultSetting = (): SettingType => ({
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
})

export { type SettingType, getDefaultSetting }
