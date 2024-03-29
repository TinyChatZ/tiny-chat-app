/**
 * ChatGPT配置
 */
interface SettingChatgptType {
  /**
   * OpenAi token
   */
  token: string
  /** ChatGPT额外选项 */
  options: {
    /** 请求对话长度限制 */
    limitsLength: number
    /**
     * 触发限制的行为
     * failSafe：自动丢弃限制之前的内容
     * failFast：直接请求报错，用户可以刷新
     */
    limitsBehavior: 'failSafe' | 'failFast'
    /**
     * 限制的统计方式
     * character: 字符达到限制是触发行为（可能造成某个回答断章取义）
     * block：按照每次回答为单位，保留触发行为的前一个回答（单个回答过长时容易触发）
     */
    limitsCalculate: 'character' | 'block'
  }
  /** 代理服务配置 */
  proxy: {
    /** 代理服务地址 */
    address: string
    /** 代理服务token */
    param: string
    /** 是否在请求是使用代理 */
    useProxy: boolean
  }
  /** 会话管理 */
  session: {
    /** 保存路径 */
    savePath: string
    /** 保存文件前缀 */
    savePrefix: string
  }
  /** 系统内置的指令 */
  prompts: {
    /** 生成标题的指令 */
    generateTitle: string
  }
}
/** 通用设置 */
interface SettingGeneralType {
  /** 显示模式 */
  displayMode: 'system' | 'dark' | 'light'
  /** 窗口置顶 */
  windowTop: boolean
  /** 保存窗口位置 */
  saveWindowPosition: boolean
  /** 缩略模式单击唤醒session;默认为false，即鼠标悬停就打开 */
  sessionWakeUp: {
    /** 缩略图模式触发 */
    thumbnall: 'click' | 'hover'
    /** session中触发方式 */
    mainWindow: 'click' | 'hover'
  }
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
    options: {
      limitsLength: 5000,
      limitsBehavior: 'failFast',
      limitsCalculate: 'block'
    },
    proxy: {
      address: '',
      param: '',
      useProxy: false
    },
    session: {
      savePath: '',
      savePrefix: ''
    },
    prompts: {
      generateTitle:
        'I need you to play a dialogue title generation role, you should distill the meaning of the dialogue as simple as possible and generate a reasonable title, the length of the title is less than 20 words,you just tell me the result without other thing,also you should use chinese answer me'
    }
  },
  general: {
    displayMode: 'system',
    windowTop: false,
    saveWindowPosition: false,
    sessionWakeUp: {
      thumbnall: 'hover',
      mainWindow: 'click'
    },
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

export { type SettingType, type SettingChatgptType, getDefaultSetting }
