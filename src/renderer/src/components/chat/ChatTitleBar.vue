<script setup lang="ts">
import { NPopover, NScrollbar, NEl, NEllipsis, NDrawer, NDrawerContent } from 'naive-ui'
import SessionList from '@renderer/components/session/SessionList.vue'
import SessionToolbar from '@renderer/components/session/SessionToolbar.vue'
import IconMain from '@renderer/components/icons/IconMain.vue'
import SessionStatus from '@renderer/components/session/SessionStatus.vue'
import MainChatSessionPanel from '@renderer/components/chat/MainChatSessionPanel.vue'
import { useChatSessionStore } from '@renderer/stores/ChatSessionStore'
import { useSettingStore } from '@renderer/stores/SettingStore'
import { ref, watch } from 'vue'

const settingStore = useSettingStore()
const chatSessionStore = useChatSessionStore()
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
      // fix 非置顶缩小窗口消失
      // window.api.resize(!showDialogState)
    } else if (!showDialogState) {
      document.body.classList.add('body-transparent')
      isIgnoreMouseEvent = true
      // fix 非置顶缩小窗口消失
      // window.api.resize(!showDialogState)
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

// 处理是否进行窗口移动
const mouseMoveStatus = ref('')
function onMouseMoveEvent(event: MouseEvent, type: 'over' | 'out' | 'down' | 'up'): void {
  mouseMoveStatus.value = type
  if (type === 'over') {
    // 仅当缩小状态且鼠标在mainIconDrag区域内，才会取消
    if (
      settingStore.showDialogState === false &&
      (event.target as HTMLElement).id === 'mainIconDrag'
    )
      mouseEnterDrag.value = true
    else mouseEnterDrag.value = false
  } else if (type === 'out') {
    mouseEnterDrag.value = false
  } else if (type === 'down') {
    window.api.windowMove('move', 'ChatWindow')
    // 发送心跳
    const heartBeatInterval = setInterval(() => {
      console.log(mouseMoveStatus.value)
      window.api.windowMove('heartBeat', 'ChatWindow')
      if (mouseMoveStatus.value === 'out' || mouseMoveStatus.value === 'up') {
        clearInterval(heartBeatInterval)
      }
    }, 300)
  } else if (type === 'up') {
    window.api.windowMove('end', 'ChatWindow')
  }
}

function onPopoverStatusChange(status: boolean): void {
  popoverStatus.value = status
}

// 点击某个session后缩回列表
const popover = ref()
function sessionItemSelect(): void {
  showDrawer.value = false
  popover.value.setShow(false)
}

// 抽屉相关
const showDrawer = ref(false)

// 处理dialog缩放事件(缩略图和展开图)
let clickTimer, hoverTimer
function changeShowDrawer(): void {
  // 双击事件
  if (clickTimer) {
    clearTimeout(clickTimer)
    clickTimer = null
    settingStore.showDialogState = !settingStore.showDialogState
  }
  // 单击事件 & hover事件
  else {
    clickTimer = setTimeout(() => {
      clearTimeout(clickTimer)
      clickTimer = null
      if (settingStore.showDialogState) {
        showDrawer.value = !showDrawer.value
      }
    }, 200)
  }
}
function hoverChangeShowDrawer(): void {
  if (settingStore.showDialogState && settingStore.general.sessionWakeUp.mainWindow === 'hover') {
    clearTimeout(hoverTimer)
    hoverTimer = setTimeout(() => {
      showDrawer.value = !showDrawer.value
    }, 300)
  }
}
</script>
<template>
  <div
    style="height: 10%"
    class="flex items-center cursor-move"
    @mouseover="(e) => onMouseMoveEvent(e, 'over')"
    @mouseout="(e) => onMouseMoveEvent(e, 'out')"
    @mousedown="(e) => onMouseMoveEvent(e, 'down')"
    @mouseup="(e) => onMouseMoveEvent(e, 'up')"
  >
    <n-el
      id="mainIconDrag"
      class="p-2 flex items-center rounded-full"
      tag="div"
      style="background-color: var(--body-color)"
    >
      <!-- 主要图标 -->
      <n-popover
        ref="popover"
        placement="bottom-start"
        :disabled="settingStore.showDialogState"
        :on-update-show="onPopoverStatusChange"
      >
        <template #trigger>
          <div
            class="rounded-full inline-block hover:cursor-pointer"
            style="width: 41px; height: 41px"
            @click="changeShowDrawer"
            @mouseenter="hoverChangeShowDrawer"
          >
            <icon-main />
          </div>
        </template>
        <n-scrollbar class="mt-4" style="max-height: 40vh">
          <session-list style="width: 80vw" :select-item-hooks="sessionItemSelect" />
        </n-scrollbar>
        <SessionToolbar />
      </n-popover>
    </n-el>
    <!-- 标题 -->
    <div
      v-show="settingStore.showDialogState"
      class="flex gap-x-2 items-center pt-1 pr-6 select-none"
    >
      <!-- session状态(生成标题或同步状态) -->
      <div>
        <session-status :session="chatSessionStore.curChatSessionId" />
      </div>
      <!-- 标题名称 -->
      <n-ellipsis
        :tooltip="{
          width: 300
        }"
        :line-clamp="1"
        :class="{
          'text-2xl': (chatSessionStore.curChatSession?.name.length ?? 1) < 11,
          'text-lg': (chatSessionStore.curChatSession?.name.length ?? 1) >= 11
        }"
      >
        {{ chatSessionStore.curChatSession?.name ?? 'Default Session' }}
      </n-ellipsis>
    </div>
  </div>
  <!-- 展开模式的抽屉 -->
  <n-drawer
    v-model:show="showDrawer"
    :trap-focus="false"
    :block-scroll="false"
    placement="left"
    style="width: 85%; max-width: 400px"
  >
    <n-drawer-content :native-scrollbar="false">
      <MainChatSessionPanel :on-click-hook="sessionItemSelect"></MainChatSessionPanel>
    </n-drawer-content>
  </n-drawer>
</template>
<style scoped></style>
