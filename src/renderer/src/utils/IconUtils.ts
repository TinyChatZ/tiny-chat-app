/**
 * 注意需要在vue组件下使用
 */
// icon todo 为什么另一种方式不可以
import user from '@renderer/assets/icons/chat-user-icon.svg'
import userDark from '@renderer/assets/icons/chat-user-icon-dark.svg'

import assiatant from '@renderer/assets/icons/chat-assistant-icon.svg'
import assiatantDark from '@renderer/assets/icons/chat-assistant-icon-dark.svg'

import settingIconDark from '@renderer/assets/icons/settings-icon-dark.svg'
import settingIcon from '@renderer/assets/icons/settings-icon.svg'

import chatSessionAddIcon from '@renderer/assets/icons/chat-session-add-icon.svg'
import chatSessionAddIconDark from '@renderer/assets/icons/chat-session-add-icon-dark.svg'

import { useSettingStore } from '@renderer/stores/SettingStore'

const setting = useSettingStore()

/**
 *用户头像
 * @returns
 */
export function getChatUserIcon(): string {
  return setting.getDisplayMode === 'dark' ? userDark : user
}

/**
 *助手icon
 * @returns
 */
export function getChatAssistantIcon(): string {
  return setting.getDisplayMode === 'dark' ? assiatantDark : assiatant
}

/**
 * 主界面设置按钮
 * @returns
 */
export function getSettingIcon(): string {
  return setting.getDisplayMode === 'dark' ? settingIconDark : settingIcon
}

export function getChatSessionAddIcon(): string {
  return setting.getDisplayMode === 'dark' ? chatSessionAddIconDark : chatSessionAddIcon
}
