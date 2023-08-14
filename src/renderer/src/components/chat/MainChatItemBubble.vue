<script setup lang="ts">
import { ChatItem } from '@shared/chat/ChatType'
import { useChatItemStore } from '@renderer/stores/ChatItemStore'
import MarkdownRender from '@renderer/components/markdown/MarkdownRender.vue'
import MainChatItemToolBar from './MainChatItemToolBar.vue'
import { useChatSessionStore } from '@renderer/stores/ChatSessionStore'
import { NPopover, useMessage } from 'naive-ui'
import { ref } from 'vue'
import MainChatItemStatusIcon from '../icons/MainChatItemStatusIcon.vue'
// 用于管理MainChatList
const chatSession = useChatSessionStore()

// 用于发送消息
const message = useMessage()
// 外部传递props
const props = defineProps<{
  item: ChatItem
}>()
// popover展示
const toolbarPopover = ref()
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
      // 每次删除都要计算当前激活的useChatItemStore
      const chatItemStore = useChatItemStore(chatSession.curChatSession?.id)
      chatItemStore.dropChatListItem(props.item.id)
    } catch (e) {
      console.log(e)
      message.error('没有删除成功')
    }
    toolbarPopover.value.setShow(false)
  }
})
</script>

<template>
  <div
    :class="{
      'bg-white': props.item.role === 'user',
      'dark:bg-neutral-800': props.item.role === 'user',
      'bg-neutral-100': props.item.role === 'assistant',
      'dark:bg-neutral-900': props.item.role === 'assistant',
      'font-medium': props.item.role === 'user',
      'p-3': true
    }"
  >
    <div class="flex flex-row-reverse items-center">
      <n-popover placement="left">
        <template #trigger>
          <div class="w-3 h-3 opacity-90">
            <MainChatItemStatusIcon :role="props.item.role" />
          </div>
        </template>
        <main-chat-item-tool-bar :action="action" />
      </n-popover>
    </div>
    <markdown-render :source="props.item.content" />
  </div>
</template>
<style scoped></style>
@renderer/stores/ChatItemStore
