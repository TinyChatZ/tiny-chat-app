<script setup lang="ts">
import { ChatItem } from '@shared/chat/ChatType'
import MarkdownRender from '@renderer/components/markdown/MarkdownRender.vue'
import MainChatItemToolBar from './MainChatItemToolBar.vue'
import { useChatgptStore } from '@renderer/stores/ChatgptStore'
import { useChatSessionStore } from '@renderer/stores/ChatSessionStore'
import { NPopover, NButton, useMessage } from 'naive-ui'
import { ref } from 'vue'
import { getChatAssistantIcon, getChatUserIcon } from '@renderer/utils/IconUtils'

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
      // 每次删除都要计算当前激活的chatgptStore
      const chatgptStore = useChatgptStore(chatSession.curChatSessionId)
      chatgptStore.dropChatListItem(props.item.id)
    } catch (e) {
      console.log(e)
      message.error('没有删除成功')
    }
    toolbarPopover.value.setShow(false)
  }
})
</script>
<template>
  <div class="flex">
    <!-- 图标 -->
    <div class="mt-4" style="min-width: 2rem; min-height: 2rem">
      <n-popover ref="toolbarPopover" placement="top" :delay="300" :duration="300">
        <main-chat-item-tool-bar :action="action" />
        <template #trigger>
          <n-button text>
            <n-icon>
              <template v-if="props.item.role === 'user'">
                <img class="w-8 h-8" :src="getChatUserIcon()" />
              </template>
              <template v-if="props.item.role === 'assistant'">
                <!-- 该图像来源于OpenAI官网 -->
                <img class="w-8 h-8" :src="getChatAssistantIcon()" />
              </template>
            </n-icon>
          </n-button>
        </template>
      </n-popover>
    </div>
    <!-- markdown -->
    <div class="ml-3 mr-3 markdown-render">
      <markdown-render :source="props.item.content" />
    </div>
  </div>
</template>
<style scoped lang="less">
.markdown-render {
  width: calc(100vw - 6rem);
}
</style>
