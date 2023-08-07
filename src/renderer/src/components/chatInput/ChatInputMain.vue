<script setup lang="ts">
import { useChatSessionStore } from '@renderer/stores/ChatSessionStore'
import { useChatgptStore } from '@renderer/stores/ChatgptStore'
import { NButton, NIcon, useMessage } from 'naive-ui'
import { ref, watch } from 'vue'
import ChatInputMilkdownWapper from './ChatInputMilkdownWapper.vue'
import { ChatInputmilkdownAction } from '@renderer/types/ChatInputMilkdownType'

// milkdown实例，通过此获取editor对象
const milkdown = ref<ChatInputmilkdownAction>()

const chatSessionStore = useChatSessionStore()

// 获取消息打印的实例
const message = useMessage()

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
  const res = await chatgptStore.sendChatGPTQuery(question, (isQuestionCreate: boolean) => {
    const element = window.document.getElementById('scrollbar')
    if (element) {
      if (isQuestionCreate && element.scrollTop + element.clientHeight >= element.scrollHeight - 5)
        setTimeout(() => element.scrollTo({ behavior: 'smooth', top: element.scrollHeight }), 30)
      else
        setTimeout(() => {
          // 如果垂直便宜量+可视区高度 大于 总高度减去50，代表快到底部了就开始往下滚动
          if (element.scrollTop + element.clientHeight >= element.scrollHeight - 50)
            element.scrollTo({ behavior: 'smooth', top: element.scrollHeight })
        }, 50)
    }
  })
  loading.value = false
  // 会话请求返回处理
  if (res.success) {
    // 是否生成标题
    if (chatSessionStore.curChatSession && !chatSessionStore.curChatSession.nameGenerate) {
      const title = await chatgptStore.getChatListRefining()
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
  chatgptStore.$reset()
  chatgptStore.createChatListItem('system', '重新开始是很好的……')
  loading.value = false
}
</script>

<template>
  <div class="flex gap-x-2 w-full p-2 items-end">
    <div class="grow w-full">
      <chat-input-milkdown-wapper ref="milkdown" @submit="sendData" />
    </div>
    <n-button text :loading="loading" @click="sendData">
      <n-icon :size="32">
        <!-- 临时图标 -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          viewBox="0 0 28 28"
        >
          <g fill="none">
            <path
              d="M3.79 2.773L24.86 12.85a1.25 1.25 0 0 1 0 2.256L3.79 25.183a1.25 1.25 0 0 1-1.746-1.456l2.66-9.749l-2.66-9.749A1.25 1.25 0 0 1 3.79 2.773zm-.155 1.589l2.423 8.887L17 13.25a.75.75 0 0 1 .743.649l.007.101a.75.75 0 0 1-.648.743L17 14.75H6.046l-2.41 8.844l20.106-9.616L3.635 4.362z"
              fill="currentColor"
            ></path>
          </g>
        </svg>
      </n-icon>
    </n-button>
  </div>
</template>

<style></style>
