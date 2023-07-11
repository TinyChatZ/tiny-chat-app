<script setup lang="ts">
import {
  NInput,
  NList,
  NListItem,
  NScrollbar,
  NSpin,
  useMessage,
  NButton,
  NButtonGroup
} from 'naive-ui'
import { ref, VNodeRef, computed, watch } from 'vue'
import { chatgptStoreFactory, useChatgptStore } from '@renderer/stores/ChatgptStore'
import { useSettingStore } from '@renderer/stores/SettingStore'
import MainChatItem from './MainChatItem.vue'
import { mapWritableState } from 'pinia'
import { useChatSessionStore } from '@renderer/stores/ChatSessionStore'

// 获取消息打印的实例
const message = useMessage()

const chatSessionStore = useChatSessionStore()
const settingStore = useSettingStore()
settingStore.getSettingParams()

// 对话框问题
const question = ref('')

// 对话框是否展示加载
const loading = ref(false)

// 定一个默认的store，即使main出现问题，也可以正常展示一个临时的store
let chatgptStore = useChatgptStore()
// 聊天记录数据（监听session是否有变化），变化则切换session
watch(
  () => chatSessionStore.curChatSessionId,
  (newValue, oldValue) => {
    console.log(`changed session from ${oldValue} to ${newValue}`)
    loading.value = false
    chatgptStore = useChatgptStore(newValue)
  },
  { immediate: true }
)

// 处理data绑定到视图中
const data = computed(() => ({
  ...mapWritableState(chatgptStoreFactory(chatSessionStore.curChatSessionId), ['chatList'])
}))
// 聊天记录scrollbar
const scrollbar = ref<VNodeRef>('')

// 发送事件
const sendData = async (): Promise<void> => {
  // 如果question为空直接返回不发送
  if (!question.value) return
  const tQuestion = question.value
  loading.value = true
  question.value = ''
  const res = await chatgptStore.sendChatGPTQuery(tQuestion, () => {
    setTimeout(() => scrollbar.value.scrollBy({ top: 300 }), 100)
  })
  loading.value = false
  if (res.success) {
    if (chatSessionStore.curChatSession && !chatSessionStore.curChatSession.nameGenerate) {
      // 刷新对话标题
      chatSessionStore.curChatSession.name = await chatgptStore.getChatListRefining()
      chatSessionStore.curChatSession.nameGenerate = true
      const res = await chatSessionStore.syncSessionInfo(chatSessionStore.curChatSession)
      if (!res.success) message.error(res.message ?? '数据保存异常')
    }
  } else {
    message.error(res.message || '调用未知异常')
  }
}

// 刷新数据
const refresh = (): void => {
  chatgptStore.$reset()
  chatgptStore.createChatListItem('system', '重新开始是很好的……')
  loading.value = false
}
</script>

<template>
  <div class="flex flex-col w-auto h-full">
    <div class="h-4/5">
      <n-scrollbar ref="scrollbar">
        <n-list hoverable clickable>
          <!-- 聊天记录list -->
          <n-list-item v-for="item in data.chatList.get()" :key="item.date?.toString()">
            <MainChatItem :item="item" />
          </n-list-item>
        </n-list>
      </n-scrollbar>
    </div>
    <div class="h-1/5 p-2 flex space-x-2 items-center">
      <n-spin :show="loading" class="w-full">
        <n-input
          ref="inpuArea"
          v-model:value="question"
          round
          type="textarea"
          placeholder="Ctrl+Enter发送"
          class="h-15"
          @keyup.ctrl.enter="sendData"
        />
      </n-spin>
      <div class="">
        <n-button-group vertical>
          <n-button type="info" @click="refresh">刷新</n-button>
          <n-button type="success" @click="sendData">发送</n-button>
        </n-button-group>
      </div>
    </div>
  </div>
</template>

<style></style>
