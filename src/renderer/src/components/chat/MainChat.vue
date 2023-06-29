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
import { ref, VNodeRef, computed,watch } from 'vue'
import { getEventSource } from '@renderer/utils/EventSource'
import { chatgptStoreFactory, useChatgptStore } from '@renderer/stores/ChatgptStore'
import { useSettingStore } from '@renderer/stores/SettingStore'
import MainChatItem from './MainChatItem.vue'
import { mapWritableState } from 'pinia'
import { useChatSessionStore } from '@renderer/stores/ChatSessionStore'

// 获取消息打印的实例
const message = useMessage()

const chatSessionStore=useChatSessionStore()
const settingStore = useSettingStore()
settingStore.getSettingParams()

// 对话框问题
const question = ref('')

// 对话框是否展示加载
const loading = ref(false)

// 聊天记录数据（监听session是否有变化）
watch(()=>chatSessionStore.curChatSessionId,(newValue,oldValue)=>{
  const data = computed(() => ({ ...mapWritableState(chatgptStoreFactory(''), ['chatList']) }))
const chatgptStore = useChatgptStore()
})


// 聊天记录scrollbar
const scrollbar = ref<VNodeRef>('')

// 发送事件
const sendData = async (): Promise<void> => {
  // 如果question为空直接返回不发送
  if (!question.value) return
  // 添加用户输入的内容
  chatgptStore.createUserInfo(question.value)
  setTimeout(() => scrollbar.value.scrollBy({ top: 1000 }), 100)

  question.value = ''
  loading.value = true
  // 发送请求
  const setting = settingStore.chatgpt
  // 如果拿不到token就配置
  if (!setting?.token) {
    message.error('请在设置中配置token')
    loading.value = false
    return
  }
  try {
    const { url, options } = chatgptStore.getRequestParam
    // 设置返回值
    const position = chatgptStore.createChatListItem('assistant')
    // 发起EventSource调用
    await getEventSource<{ choices: Array<{ delta: { role?: string; content?: string } }> }>(
      url,
      options,
      // 渲染结果
      (res) => {
        if (typeof res.data !== 'string') {
          if (res.data?.choices[0].delta?.role) {
            chatgptStore.chatList[chatgptStore.getRealIndex(position)].role =
              res.data?.choices[0].delta?.role
          } else if (res.data?.choices[0].delta?.content) {
            chatgptStore.chatList[chatgptStore.getRealIndex(position)].content +=
              res.data?.choices[0].delta?.content
            // @ts-ignore 暂时忽略
            setTimeout(() => scrollbar.value.scrollBy({ top: 300 }), 100)
          }
        }
      }
    )
      .then(() => {
        loading.value = false
        // console.log(chatgptStore.chatList[chatgptStore.getRealIndex(position)])
      })
      .catch(() => {
        chatgptStore.dropChatListItem(position)
        message.error('调用失败，请检查网络或token')
        loading.value = false
      })
  } catch (e) {
    message.error(e as string)
  } finally {
    loading.value = false
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
