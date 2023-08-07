<script setup lang="ts">
import { ChatItem } from '@shared/chat/ChatType'
import MarkdownRender from '@renderer/components/markdown/MarkdownRender.vue'
import MainChatItemToolBar from './MainChatItemToolBar.vue'
import { useChatgptStore } from '@renderer/stores/ChatgptStore'
import { useChatSessionStore } from '@renderer/stores/ChatSessionStore'
import { useMessage } from 'naive-ui'
import { ref } from 'vue'
import MainChatItemStatusIcon from '../icons/MainChatItemStatusIcon.vue'

// 用于管理MainChatList
const chatSession = useChatSessionStore()

// 用于发送消息
const message = useMessage()
// 外部传递props
const props = defineProps<{
  item: ChatItem
  showToolbar: boolean
}>()

// 行为用于toolbar
const action = ref({
  copy() {
    navigator.clipboard.writeText(props.item.content)
  },
  edit() {
    message.warning('暂未支持')
  },
  drop() {
    try {
      // 每次删除都要计算当前激活的chatgptStore
      const chatgptStore = useChatgptStore(chatSession.curChatSession?.id)
      chatgptStore.dropChatListItem(props.item.id)
    } catch (e) {
      console.log(e)
      message.error('没有删除成功')
    }
  }
})
</script>
<template>
  <div v-if="props.item.role === 'system'">
    <div class="text-center p-3 text-neutral-400 dark:text-neutral-600 select-none">
      {{ props.item.content }}
    </div>
  </div>
  <div
    v-else
    :class="{
      flex: true,
      'flex-col': true,
      'p-3': true,
      'bg-neutral-50': props.item.role === 'user',
      'bg-neutral-100': props.item.role === 'assistant',
      'dark:bg-neutral-950': props.item.role === 'user',
      'dark:bg-neutral-900': props.item.role === 'assistant'
    }"
    style="min-height: 3rem"
  >
    <div class="flex">
      <!-- 图标 -->
      <div class="w-6 h-6 mr-3">
        <main-chat-item-status-icon :role="props.item.role" />
      </div>

      <!-- markdown -->
      <div class="mr-1 markdown-render">
        <markdown-render :source="props.item.content" />
      </div>
    </div>

    <div class="flex flex-row-reverse">
      <div class="h-6 w-1"></div>
      <main-chat-item-tool-bar v-show="props.showToolbar" :action="action" />
    </div>
  </div>
</template>
<style scoped>
.markdown-render {
  width: calc(100vw - 5rem);
}
</style>
