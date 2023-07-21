<script setup lang="ts">
import { NInput, NList, NListItem, NSpin, useMessage, NButton, NButtonGroup } from 'naive-ui'
import { ref, computed, watch } from 'vue'
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

// 发送事件
const sendData = async (): Promise<void> => {
  // 如果question为空直接返回不发送
  if (!question.value) return
  const tQuestion = question.value
  loading.value = true
  question.value = ''
  // 注册下拉处理器

  // 发送
  const res = await chatgptStore.sendChatGPTQuery(tQuestion, (isQuestionCreate: boolean) => {
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

// 刷新数据
const refresh = (): void => {
  chatgptStore.$reset()
  chatgptStore.createChatListItem('system', '重新开始是很好的……')
  loading.value = false
}
</script>

<template>
  <div class="flex flex-col w-auto h-full">
    <div id="scrollbar" class="h-4/5 overflow-x-hidden overflow-y-auto scrollbar">
      <n-list hoverable clickable>
        <!-- 聊天记录list -->
        <n-list-item v-for="item in data.chatList.get()" :key="item.date?.toString()">
          <MainChatItem :item="item" />
        </n-list-item>
      </n-list>
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

<style scoped lang="less">
// 滚动条相关代码
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
  // 滚动条相关代码
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
