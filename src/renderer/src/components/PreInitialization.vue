<script setup lang="ts">
import { useChatSessionStore } from '@renderer/stores/ChatSessionStore'
import { TinyResultUiMessageHandler, TinyResultUtils } from '@renderer/utils/TinyResultUtils'
import { useMessage } from 'naive-ui'
import { onMounted } from 'vue'

onMounted(async () => {
  // 初始化默认的handler
  const message = useMessage()
  TinyResultUtils.defaultHandler = new TinyResultUiMessageHandler(message)

  // 初始化session
  const chatSession = useChatSessionStore()
  await chatSession.initChatSession()
})
</script>
<template>
  <slot></slot>
</template>

<style></style>
