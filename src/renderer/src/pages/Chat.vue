<script setup lang="ts">
import { NButton, NPopover, NScrollbar, NEl } from 'naive-ui'
import { watch, ref } from 'vue'
import MainChat from '@renderer/components/chat/MainChat.vue'
import SessionList from '@renderer/components/session/SessionList.vue'
import SessionToolbar from '@renderer/components/session/SessionToolbar.vue'
import { useChatSessionStore } from '@renderer/stores/ChatSessionStore'
import { useSettingStore } from '@renderer/stores/SettingStore'

const settingStore = useSettingStore()
const chatSessionStore = useChatSessionStore()

// 只要在顶层初始化一次即可
chatSessionStore.initChatSession()

// 是否显示dialog
const showDialog = (): void => {
  settingStore.showDialogState = !settingStore.showDialogState
}
// 处理透明度
watch(
  () => settingStore.showDialogState,
  (newValue) => {
    if (!newValue) {
      document.body.classList.add('body-transparent')
    } else {
      document.body.classList.remove('body-transparent')
    }
  }
)
// 点击某个session后缩回列表
const popover = ref()
function sessionItemSelect(): void {
  popover.value.setShow(false)
}
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="flex" style="-webkit-app-region: drag">
      <n-el
        class="p-3 content-center flex items-center"
        tag="div"
        style="background-color: var(--body-color)"
      >
        <!-- 主要图标 -->
        <n-popover ref="popover" placement="bottom-start" :delay="300" :duration="500">
          <template #trigger>
            <NButton style="pointer-events: auto" size="large" circle @click="showDialog">
              <img src="@renderer/assets/icons/icon-grey.png" style="width: 100%; height: auto" />
            </NButton>
          </template>
          <n-scrollbar style="max-height: 33vh">
            <session-list :select-item-hooks="sessionItemSelect" />
          </n-scrollbar>
          <SessionToolbar />
        </n-popover>
        <div class="inline-block text-xl pl-2 select-none" style="line-height: 40px">TinyChat</div>

        <!-- 配置界面，刷新和修改 -->
        <!-- <n-collapse-transition class="ml-4" :show="showState">
        <setting />
      </n-collapse-transition> -->
      </n-el>
    </div>

    <div v-show="settingStore.showDialogState" style="height: 90%">
      <main-chat ref="mainChat" />
    </div>
  </div>
</template>

<style lang="less">
body {
  // -webkit-app-region: drag;
  height: 100vh;
}

button {
  -webkit-app-region: no-drag;
}
</style>
