<script setup lang="ts">
import { useChatSessionStore } from '@renderer/stores/ChatSessionStore'
import { useChatItemStore } from '@renderer/stores/ChatItemStore'
import { useMessage } from 'naive-ui'
import { ref, watch } from 'vue'
import ChatInputMilkdownWapper from './ChatInputMilkdownWapper.vue'
import { ChatInputmilkdownAction } from '@renderer/types/ChatInputMilkdownType'
import MainChatSendIcon from '../icons/MainChatSendIcon.vue'

// milkdown实例，通过此获取editor对象
const milkdown = ref<ChatInputmilkdownAction>()

const chatSessionStore = useChatSessionStore()

// 获取消息打印的实例
const message = useMessage()

// 对话框是否展示加载
const loading = ref(false)

// 定一个默认的store，即使main出现问题，也可以正常展示一个临时的store
let chatItemStore = useChatItemStore()
// 聊天记录数据（监听session是否有变化），变化则切换session
watch(
  () => chatSessionStore.curChatSessionId,
  (newValue, oldValue) => {
    console.log(`changed session from ${oldValue} to ${newValue}`)
    loading.value = false
    chatItemStore = useChatItemStore(newValue)
  },
  { immediate: true }
)

// 发送事件
const sendData = async (): Promise<void> => {
  // 如果question为空直接返回不发送
  const question = milkdown.value?.getMakrdownText()
  if (!question || loading.value) return
  loading.value = true
  // 清除markdown中文本
  milkdown.value?.setMakrdownText('')
  // 注册下拉处理器

  // 发送
  let scrollbarTimeout
  const res = await chatItemStore.sendChatGPTQuery(question, (isQuestionCreate: boolean) => {
    const element = window.document.getElementById('scrollbar')
    if (element) {
      clearTimeout(scrollbarTimeout)
      if (isQuestionCreate && element.scrollTop + element.clientHeight >= element.scrollHeight - 10)
        scrollbarTimeout = setTimeout(
          () => element.scrollTo({ behavior: 'smooth', top: element.scrollHeight }),
          50
        )
      else
        scrollbarTimeout = setTimeout(() => {
          // 如果垂直便宜量+可视区高度 大于 总高度减去50，代表快到底部了就开始往下滚动
          if (element.scrollTop + element.clientHeight >= element.scrollHeight - 60)
            element.scrollTo({ behavior: 'smooth', top: element.scrollHeight })
        }, 50)
    }
  })
  loading.value = false
  // 会话请求返回处理
  if (res.success) {
    // 是否生成标题
    if (chatSessionStore.curChatSession && !chatSessionStore.curChatSession.nameGenerate) {
      const title = await chatItemStore.getChatListRefining()
      // 持久化结果
      if (title !== '' && chatSessionStore.curChatSession) {
        chatSessionStore.curChatSession.nameGenerate = true
        chatSessionStore.curChatSession.name = title
        await chatSessionStore.syncSessionInfo(chatSessionStore.curChatSession)
      } else {
        message.error('调用未知异常')
        chatSessionStore.sessionModifyFail(chatSessionStore.curChatSession)
      }
    }
  } else {
    message.error(res.message || '调用未知异常')
  }
}

// @ts-ignore 刷新数据
const refresh = (): void => {
  chatItemStore.$reset()
  chatItemStore.createChatListItem('system', '重新开始是很好的……')
  loading.value = false
}
</script>

<template>
  <div class="flex gap-x-2 w-full p-2 items-end">
    <div class="flex-auto w-full">
      <chat-input-milkdown-wapper ref="milkdown" @submit="sendData" />
    </div>
    <main-chat-send-icon class="flex-none" :loading="loading" @click="sendData" />
  </div>
</template>

<style></style>
@renderer/stores/ChatItemStore
