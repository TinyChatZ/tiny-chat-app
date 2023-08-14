<script setup lang="ts">
import { ref, computed } from 'vue'
import { chatItemStoreFactory } from '@renderer/stores/ChatItemStore'
import { useSettingStore } from '@renderer/stores/SettingStore'
import { mapWritableState } from 'pinia'
import { useChatSessionStore } from '@renderer/stores/ChatSessionStore'
import MainChatItem from '@renderer/components/chat/MainChatItem.vue'
import ChatInputMain from '@renderer/components/chatInput/ChatInputMain.vue'

const chatSessionStore = useChatSessionStore()
const settingStore = useSettingStore()
settingStore.getSettingParams()

// 处理data绑定到视图中
const data = computed(() => ({
  ...mapWritableState(chatItemStoreFactory(chatSessionStore.curChatSessionId), ['chatList'])
}))

// 鼠标移入显示toolbar
const curMouseEnterId = ref(-1)
function mouseEnterItem(id: number): void {
  curMouseEnterId.value = id
}
</script>

<template>
  <div class="flex flex-col w-auto h-full justify-between">
    <div
      id="scrollbar"
      class="flex-1 h-11/12 flex-col h-auto overflow-x-hidden overflow-y-auto scrollbar divide-y divide-neutral-200 dark:divide-neutral-800"
    >
      <!-- 聊天记录list -->
      <div v-for="item in data.chatList.get()" :key="item.date?.toString()">
        <MainChatItem
          :item="item"
          :show-toolbar="item.id === curMouseEnterId"
          @mouseenter="mouseEnterItem(item.id)"
        />
      </div>
    </div>
    <div class="p-2 flex-none">
      <ChatInputMain />
    </div>
  </div>
</template>

<style scoped>
/* 滚动条相关代码 */
.scrollbar::-webkit-scrollbar {
  width: 8px;
  height: 8px;
  /**/
}

.scrollbar::-webkit-scrollbar-track {
  background: rgb(239, 239, 239);
  border-radius: 3px;
}

.scrollbar::-webkit-scrollbar-thumb {
  background: #bfbfbf;
  border-radius: 8px;
}

.scrollbar::-webkit-scrollbar-thumb:hover {
  background: #666;
}

.scrollbar::-webkit-scrollbar-corner {
  background: #179a16;
}

@media (prefers-color-scheme: dark) {
  /* 滚动条相关代码 */
  .scrollbar::-webkit-scrollbar {
    width: 8px;
    height: 8px;
    /**/
  }

  .scrollbar::-webkit-scrollbar-track {
    background: #222;
    border-radius: 3px;
  }

  .scrollbar::-webkit-scrollbar-thumb {
    background: #555;
    border-radius: 8px;
  }

  .scrollbar::-webkit-scrollbar-thumb:hover {
    background: #c0c0c0;
  }

  .scrollbar::-webkit-scrollbar-corner {
    background: #179a16;
  }
}
</style>
@renderer/stores/ChatItemStore
