<script lang="ts" setup>
import { useChatSessionStore } from '@renderer/stores/ChatSessionStore'
import { ChatSessionIndexType } from '@shared/chat/ChatSessionType'
import { NList, NListItem, NButton, NPopover, NIcon, NInput } from 'naive-ui'
import ChatSessionRenameIcon from '../icons/ChatSessionRenameIcon.vue'
import ChatSessionDeleteIcon from '../icons/ChatSessionDeleteIcon.vue'
import { ref } from 'vue'
import ChatSessionStatusIcon from '../icons/ChatSessionStatusIcon.vue'
import { useSettingStore } from '@renderer/stores/SettingStore'

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
    await chatSessiontStore.syncSessionInfo(renameSessionItem.value)
    renameSessionId.value = undefined
    renameSessionName.value = undefined
    renameSessionItem.value = undefined
    return
  }
  // 如果不想等，则保存并修改Id
  if (renameSessionId.value != item.id && renameSessionId.value) {
    renameSessionItem.value.name = renameSessionName.value ?? 'Default'
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
  }
}

// 删除session
async function clickDeleteSessionName(item: ChatSessionIndexType): Promise<void> {
  await chatSessiontStore.deleteSessionInfo(item)
}
// 切换选中的session
function checkoutSession(item: ChatSessionIndexType): void {
  console.log('click', item)
  chatSessiontStore.loadSession(item)
  settingStore.showDialogState = true
  props.selectItemHooks?.(item)
}
</script>
<template>
  <div>
    <n-list>
      <n-list-item v-for="item in chatSessiontStore.indexArray" :key="item.id">
        <div class="ml-4 mr-4 flex gap-x-2 items-center">
          <div>
            <n-icon>
              <chat-session-status-icon status="sync" />
            </n-icon>
          </div>
          <div>
            <template v-if="item.id === renameSessionId">
              <n-input
                ref="renameSessionInput"
                v-model:value="renameSessionName"
                size="medium"
                :on-blur="(_e) => clickRenameSessionName(item)"
              />
            </template>
            <template v-else>
              <n-popover>
                <template #trigger>
                  <n-button
                    :quaternary="!(item.id === chatSessiontStore.curChatSession?.id)"
                    :secondary="item.id === chatSessiontStore.curChatSession?.id"
                    :type="item.id === chatSessiontStore.curChatSession?.id ? 'primary' : undefined"
                    @click="checkoutSession(item)"
                  >
                    <!-- TODO 这里要做一个媒体查询 -->
                    <span style="width: 150px" class="truncate text-left">{{ item.name }}</span>
                  </n-button>
                </template>
                {{ item.name }}
              </n-popover>
            </template>
          </div>
          <!-- item工具条 -->
          <div v-show="chatSessiontStore.showItemEditBar" class="flex gap-x-1">
            <n-popover>
              <template #trigger>
                <n-button size="tiny" quaternary @click="clickRenameSessionName(item)">
                  <n-icon :size="14"><chat-session-rename-icon /></n-icon>
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
      </n-list-item>
    </n-list>
  </div>
</template>
<style lang="less" scoped></style>
