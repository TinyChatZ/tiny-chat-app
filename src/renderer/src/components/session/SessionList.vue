<script lang="ts" setup>
import { useChatSessionStore } from '@renderer/stores/ChatSessionStore'
import { ChatSessionIndexItemType } from '@shared/chat/ChatSessionType'
import { NList, NListItem, NButton } from 'naive-ui'
const chatSessiontStore = useChatSessionStore()
// 只要在顶层初始化一次即可
chatSessiontStore.initChatSession()
// 创建新session
function createNewSession(): void {
  chatSessiontStore.createNewSession()
}
// 切换选中的session
function checkoutSession(item: ChatSessionIndexItemType): void {
  const sessionItem = chatSessiontStore.loadSession(item)
}
</script>
<template>
  <div>
    <n-list>
      <n-list-item v-for="item in chatSessiontStore.indexArray" :key="item.id">
        <n-button block quaternary @click="checkoutSession(item)">{{ item.name }}</n-button>
      </n-list-item>
    </n-list>
  </div>
  <div class="mt-5">
    <n-button block quaternary @click="createNewSession">Add One</n-button>
  </div>
</template>
<style lang="less" scoped></style>
