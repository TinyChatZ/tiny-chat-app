<script lang="ts" setup>
import { useChatSessionStore } from '@renderer/stores/ChatSessionStore'
import { ChatSessionIndexType } from '@shared/chat/ChatSessionType'
import { NButton, NPopover, NIcon, NInput, NEllipsis } from 'naive-ui'
import ChatSessionRenameIcon from '../icons/ChatSessionRenameIcon.vue'
import ChatSessionOkIcon from '../icons/ChatSessionOkIcon.vue'
import ChatSessionDeleteIcon from '../icons/ChatSessionDeleteIcon.vue'
import { ref } from 'vue'
import { useSettingStore } from '@renderer/stores/SettingStore'
import ChatSessionGenerateTitleIcon from '../icons/ChatSessionGenerateTitleIcon.vue'
import SessionStatus from './SessionStatus.vue'
import { useChatgptStore } from '@renderer/stores/ChatgptStore'

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

/** session修改名称 */
const renameSessionId = ref<string | undefined>(undefined)
const renameSessionName = ref<string | undefined>()
const renameSessionItem = ref()
async function clickRenameSessionName(item: ChatSessionIndexType): Promise<void> {
  // 如果相等表示确认保存
  if (item.id === renameSessionId.value) {
    renameSessionItem.value.name = renameSessionName.value ?? 'Default'
    renameSessionItem.value.nameGenerate = true
    await chatSessiontStore.syncSessionInfo(renameSessionItem.value)
    renameSessionId.value = undefined
    renameSessionName.value = undefined
    renameSessionItem.value = undefined
    return
  }
  // 如果不想等，则保存并修改Id
  if (renameSessionId.value != item.id && renameSessionId.value) {
    renameSessionItem.value.name = renameSessionName.value ?? 'Default'
    renameSessionItem.value.nameGenerate = true
    await chatSessiontStore.syncSessionInfo(renameSessionItem.value)
    renameSessionId.value = item.id
    renameSessionName.value = item.name
    renameSessionItem.value = item
    return
  }
  // 如果为undefine,则不保存修改id
  if (!renameSessionId.value) {
    renameSessionId.value = item.id
    renameSessionName.value = item.name
    renameSessionItem.value = item
    return
  }
}

// 重新生成会话标题
async function clickGenerateTitle(item: ChatSessionIndexType): Promise<void> {
  const res = await useChatgptStore(item.id).getChatListRefining()
  if (res !== '') {
    item.name = res
    item.nameGenerate = true
    await chatSessiontStore.syncSessionInfo(item)
  }
}

// 删除session
async function clickDeleteSessionName(item: ChatSessionIndexType): Promise<void> {
  await chatSessiontStore.deleteSessionInfo(item)
}

// 切换选中的session
function checkoutSession(item: ChatSessionIndexType): void {
  chatSessiontStore.loadSession(item)
  settingStore.showDialogState = true
  props.selectItemHooks?.(item)
}
</script>
<template>
  <div class="flex flex-col gap-4">
    <div v-for="item in chatSessiontStore.indexArray" :key="item.id" class="flex items-center">
      <!-- 图标 -->
      <div class="flex-none" style="width: 15px; min-width: 15px">
        <session-status :session="item" />
      </div>

      <!-- session名称/编辑 -->
      <div class="truncate w-full">
        <template v-if="item.id === renameSessionId">
          <n-input
            ref="renameSessionInput"
            v-model:value="renameSessionName"
            autofocus
            size="medium"
            @keydown.enter="clickRenameSessionName(item)"
          />
        </template>
        <template v-else>
          <n-button
            class="text-left justify-normal"
            :block="true"
            :quaternary="!(item.id === chatSessiontStore.curChatSession?.id)"
            :secondary="item.id === chatSessiontStore.curChatSession?.id"
            :type="item.id === chatSessiontStore.curChatSession?.id ? 'primary' : undefined"
            @click="checkoutSession(item)"
          >
            <n-ellipsis>{{ item.name }}</n-ellipsis>
          </n-button>
        </template>
      </div>

      <!-- item工具条 -->
      <div
        v-show="chatSessiontStore.showItemEditBar"
        style="width: 78px"
        class="flex-none flex flex-wrap"
      >
        <n-popover>
          <template #trigger>
            <n-button size="tiny" quaternary @click="clickGenerateTitle(item)">
              <n-icon :size="14"><chat-session-generate-title-icon /></n-icon>
            </n-button>
          </template>
          <span>生成标题</span>
        </n-popover>
        <n-popover>
          <template #trigger>
            <n-button size="tiny" quaternary @click="clickRenameSessionName(item)">
              <n-icon :size="14">
                <chat-session-rename-icon v-if="item.id !== renameSessionId" />
                <chat-session-ok-icon v-else />
              </n-icon>
            </n-button>
          </template>
          <span>重命名</span>
        </n-popover>
        <n-popover>
          <template #trigger>
            <n-button size="tiny" quaternary @click="clickDeleteSessionName(item)">
              <template #icon>
                <n-icon :size="14"><chat-session-delete-icon /></n-icon>
              </template>
            </n-button>
          </template>
          <span>删除</span>
        </n-popover>
      </div>
    </div>
  </div>
</template>
<style  scoped></style>
