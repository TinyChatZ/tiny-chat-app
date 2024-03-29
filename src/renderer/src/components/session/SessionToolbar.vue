<script lang="ts" setup>
import { useChatSessionStore } from '@renderer/stores/ChatSessionStore'
import { useSettingStore } from '@renderer/stores/SettingStore'
import {
  ChatSessionIndexType,
  getChatSessionIndexByItem,
  getChatSessionIndexDefault
} from '@shared/chat/ChatSessionType'
import { NButton, NPopover, NIcon } from 'naive-ui'
import ChatSessionAddIcon from '@renderer/components/icons/ChatSessionAddIcon.vue'
import ChatSessionInOutIcon from '../icons/ChatSessionInOutIcon.vue'
import ChatSessionEditIcon from '../icons/ChatSessionEditIcon.vue'
import ChatSessionSettingsIcon from '../icons/ChatSessionSettingsIcon.vue'

const chatSessiontStore = useChatSessionStore()
const settingStore = useSettingStore()

// props
const props = defineProps<{
  /**
   * 当创建session或者选中某个索引时的回调
   * @param item 选择的索引内容
   */
  selectItemHooks?: (item: ChatSessionIndexType) => void
}>()

// 唤起配置界面
const openSettingsWindow = async (): Promise<void> => {
  window.api.openSetWindow()
}

// 展示修改工具条
function changeEditState(): void {
  chatSessiontStore.showItemEditBar = !chatSessiontStore.showItemEditBar
}

// 创建新session
async function createNewSession(): Promise<void> {
  const session = await chatSessiontStore.createNewSession()
  if (session) {
    chatSessiontStore.curChatSessionId = session.id
    props.selectItemHooks?.(getChatSessionIndexByItem(session))
  }
}

// 退出程序
const eixtProgram = (): void => {
  window.api.exitProgram()
}

// 是否显示dialog
const showDialog = (): void => {
  props.selectItemHooks?.(chatSessiontStore.curChatSession || getChatSessionIndexDefault())
  settingStore.showDialogState = !settingStore.showDialogState
}
</script>
<template>
  <div class="text-center flex gap-x-2">
    <n-popover>
      <template #trigger>
        <n-button text @click="createNewSession">
          <n-icon>
            <chat-session-add-icon />
          </n-icon>
        </n-button>
      </template>
      <span>新建会话</span>
    </n-popover>

    <n-popover>
      <template #trigger>
        <n-button text @click="changeEditState">
          <n-icon>
            <chat-session-edit-icon />
          </n-icon>
        </n-button>
      </template>
      <span>修改会话</span>
    </n-popover>

    <n-popover>
      <template #trigger>
        <n-button text @click="openSettingsWindow">
          <n-icon>
            <chat-session-settings-icon />
          </n-icon>
        </n-button>
      </template>
      <span>配置</span>
    </n-popover>

    <n-popover>
      <template #trigger>
        <n-button text @click="showDialog">
          <n-icon>
            <chat-session-in-out-icon :status="settingStore.showDialogState ? 'in' : 'out'" />
          </n-icon>
        </n-button>
      </template>
      缩小/放大
    </n-popover>

    <n-button quaternary @click="eixtProgram">退出</n-button>
  </div>
</template>
<style lang="less" scoped></style>
