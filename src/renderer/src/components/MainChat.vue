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
import VueMarkdown from 'vue-markdown-render'
import { ref, VNodeRef, computed } from 'vue'
import { getEventSource } from '../utils/EventSource'
import { useChatgptStore } from '@renderer/stores/ChatgptStore'
import { useSettingStore } from '@renderer/stores/SettingStore'
import MarkdownRender from '@renderer/components/MarkdownRender.vue'
import { mapWritableState } from 'pinia'

// 获取消息打印的实例
const message = useMessage()

const chatgptStore = useChatgptStore()
const settingStore = useSettingStore()
settingStore.getSettingParams()

// 对话框问题
const question = ref('')

// 对话框是否展示加载
const loading = ref(false)

// 聊天记录数据
// const data: Ref<Array<{ role?: string; content?: string; date?: Date }>> = ref([])
const data = computed(() => ({ ...mapWritableState(useChatgptStore, ['chatList']) }))
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
  const { url, options } = chatgptStore.getRequestParam
  // 设置返回值
  const position = chatgptStore.createChatListItem('')
  // 发起EventSource调用
  getEventSource<{ choices: Array<{ delta: { role?: string; content?: string } }> }>(
    url,
    options,
    // 渲染结果
    (res) => {
      // console.log(chatgptStore.chatList[chatgptStore.getRealIndex(position)].content)
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
    .then(() => (loading.value = false))
    .catch(() => {
      message.error('调用失败，请检查网络或token')
      chatgptStore.dropChatListItem(position)
      loading.value = false
    })
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
            <div class="grid grid-cols-12">
              <template v-if="item.role == 'user'">
                <div class="col-span-2"></div>
                <div class="col-span-8 break-all">
                  <markdown-render :source="item.content" />
                  <!-- <vue-markdown :source="item.content" :options="markdownConfig" /> -->
                </div>
                <div class="col-span-2">
                  <div>
                    <img src="@renderer/assets/icons/chat-user-icon.svg" />
                  </div>
                </div>
              </template>

              <template v-if="item.role == 'system'">
                <div class="col-span-2"></div>
                <div class="col-span-8 break-all text-center" style="color: grey">
                  {{ item.content }}
                </div>
                <div class="col-span-2"></div>
              </template>

              <template v-if="item.role == 'assistant'">
                <div class="col-span-2">
                  <!-- 该图像来源于OpenAI官网 -->
                  <img src="@renderer/assets/icons/chat-assistant-icon.svg" />
                </div>
                <div class="col-span-8 break-all">
                  <vue-markdown :source="item.content" />
                </div>
                <div class="col-span-2"></div>
              </template>
            </div>
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
  <!-- 输入token的对话框 -->
</template>

<style></style>
