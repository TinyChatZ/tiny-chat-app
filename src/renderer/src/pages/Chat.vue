<script setup lang="ts">
import { NButton, NPopover, NScrollbar, NEl } from 'naive-ui'
import { ref, watch } from 'vue'
import MainChat from '@renderer/components/chat/MainChat.vue'
import SessionList from '@renderer/components/session/SessionList.vue'
import SessionToolbar from '@renderer/components/session/SessionToolbar.vue'
import { useChatSessionStore } from '@renderer/stores/ChatSessionStore'
import { useSettingStore } from '@renderer/stores/SettingStore'

const settingStore = useSettingStore()
const chatSessionStore = useChatSessionStore()
const win = ref(window)

// 只要在顶层初始化一次即可
chatSessionStore.initChatSession()

// 是否显示dialog
const showDialog = (): void => {
  settingStore.showDialogState = !settingStore.showDialogState
}

// 处理透明度及鼠标事件
const popoverStatus = ref()
const mouseEnterDrag = ref<boolean>()
// 监听是否缩小、session选择是否show、鼠标是否进入可拖拽区域
watch(
  [(): boolean => settingStore.showDialogState, popoverStatus, mouseEnterDrag],
  ([showDialogState, popoverStatus, mouseEnterDrag], [oldShowDialogState]) => {
    // 如果窗口缩放没有变化，且窗口是放大的，则忽略所有后续逻辑（减少IPC次数）
    if (oldShowDialogState === showDialogState && showDialogState) {
      return
    }
    let isIgnoreMouseEvent = false
    // 展开对话时处理透明度和鼠标事件(收缩时忽略鼠标点击事件)
    if (showDialogState) {
      document.body.classList.remove('body-transparent')
      isIgnoreMouseEvent = false
    } else if (!showDialogState) {
      document.body.classList.add('body-transparent')
      isIgnoreMouseEvent = true
    }
    // 如果鼠标进入可拖动区域，捕获鼠标事件
    isIgnoreMouseEvent = !mouseEnterDrag
    // 如果展开dialog，捕获鼠标时间
    if (popoverStatus) {
      isIgnoreMouseEvent = false
    }
    window.api.setIgnoreMouseEvent(isIgnoreMouseEvent)
  }
)
function onPopoverStatusChange(status: boolean): void {
  popoverStatus.value = status
}

// 点击某个session后缩回列表
const popover = ref()
function sessionItemSelect(): void {
  popover.value.setShow(false)
}
</script>

<template>
  <div class="flex flex-col h-full">
    <div
      id="test"
      class="flex"
      @mouseover="mouseEnterDrag = true"
      @mouseout="mouseEnterDrag = false"
      @mousedown="win.api.windowMove(true, 'ChatWindow')"
      @mouseup="win.api.windowMove(false, 'ChatWindow')"
    >
      <n-el
        class="p-3 content-center flex items-center"
        tag="div"
        style="background-color: var(--body-color)"
      >
        <!-- 主要图标 -->
        <n-popover ref="popover" placement="bottom-start" :on-update-show="onPopoverStatusChange">
          <template #trigger>
            <NButton size="large" circle @click="showDialog">
              <img
                draggable="false"
                src="@renderer/assets/icons/icon-grey.png"
                style="width: 100%; height: auto"
              />
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
  height: 100vh;
}
// 参考大佬的解决方案我们不再使用拖拽css
// button {
//   -webkit-app-region: no-drag;
// }

// .dragable {
//   -webkit-app-region: drag;
//   // todo 为什么这样会无效
//   // cursor: move;
// }
</style>
