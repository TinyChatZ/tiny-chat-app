<script setup lang="ts">
import ChatSessionStatusIcon from '../icons/ChatSessionStatusIcon.vue'
import ChatSessionLoadingIcon from '../icons/ChatSessionLoadingIcon.vue'
import { ChatSessionIndexType, ChatSessionItemType } from '@shared/chat/ChatSessionType'
import { useChatSessionStore } from '@renderer/stores/ChatSessionStore'
import { computed } from 'vue'
const props = defineProps<{
  session: ChatSessionIndexType | ChatSessionItemType | string
}>()
const chatSessionStore = useChatSessionStore()
const statusInfo = computed(() => chatSessionStore.getStatusBySession(props.session))
</script>
<template>
  <div style="min-width: 15px">
    <template v-if="statusInfo?.subStatus === 'generateTitle'">
      <chat-session-loading-icon />
    </template>
    <template v-else>
      <ChatSessionStatusIcon :status="statusInfo?.status ?? 'unknown'" />
    </template>
  </div>
</template>
