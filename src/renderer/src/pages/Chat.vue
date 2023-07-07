<script setup lang="ts">
import { NPopover, NScrollbar, NEl, NIcon } from 'naive-ui'
import { ref, watch } from 'vue'
import MainChat from '@renderer/components/chat/MainChat.vue'
import SessionList from '@renderer/components/session/SessionList.vue'
import SessionToolbar from '@renderer/components/session/SessionToolbar.vue'
import IconMain from '@renderer/components/icons/IconMain.vue'
import { useChatSessionStore } from '@renderer/stores/ChatSessionStore'
import { useSettingStore } from '@renderer/stores/SettingStore'

const settingStore = useSettingStore()
const chatSessionStore = useChatSessionStore()

// 只要在顶层初始化一次即可
chatSessionStore.initChatSession()

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
// 处理是否进行窗口移动
function onMouseMoveEvent(event: MouseEvent, type: 'over' | 'out' | 'down' | 'up'): void {
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
    window.api.windowMove(true, 'ChatWindow')
  } else if (type === 'up') {
    window.api.windowMove(false, 'ChatWindow')
  }
}

function onPopoverStatusChange(status: boolean): void {
  popoverStatus.value = status
}

/**
 * 切换是否展示整个窗口
 * 单击模式下只允许从展开切换到缩放，不允许操作
 * @param clickType
 */
function changeShowDialog(clickType: 'single' | 'double'): void {
  if (clickType === 'double') settingStore.showDialogState = !settingStore.showDialogState
  // else {
  //   if (settingStore.showDialogState) settingStore.showDialogState = false
  // }
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
      class="flex content-center items-center cursor-move"
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
        <n-popover ref="popover" placement="bottom-start" :on-update-show="onPopoverStatusChange">
          <template #trigger>
            <div
              class="rounded-full inline-block hover:cursor-pointer p-1"
              style="width: 41px; height: 41px"
              @click="changeShowDialog('single')"
              @dblclick="changeShowDialog('double')"
            >
              <n-icon size="41">
                <icon-main />
              </n-icon>
            </div>
          </template>
          <n-scrollbar style="max-height: 33vh">
            <session-list :select-item-hooks="sessionItemSelect" />
          </n-scrollbar>
          <SessionToolbar />
        </n-popover>
      </n-el>
      <!-- 标题 -->
      <div v-show="settingStore.showDialogState" class="inline-block text-lg pl-2 select-none">
        {{ chatSessionStore.curChatSession?.name ?? 'Default Session' }}
      </div>
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
