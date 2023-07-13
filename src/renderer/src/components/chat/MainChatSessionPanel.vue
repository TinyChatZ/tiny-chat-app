<!-- 展开模式下session选择组件 -->
<script setup lang="ts">
import { NIcon, NScrollbar } from 'naive-ui'
import SessionList from '../session/SessionList.vue'
import SessionToolbar from '../session/SessionToolbar.vue'
import IconMain from '../icons/IconMain.vue'
import { useSettingStore } from '@renderer/stores/SettingStore'
import { ref } from 'vue'
const pros = defineProps<{
  onClickHook: () => void
}>()
const settingStore = useSettingStore()
// 处理是否进行窗口移动
const mouseMoveStatus = ref('')
function onMouseMoveEvent(_event: MouseEvent, type: 'over' | 'out' | 'down' | 'up'): void {
  mouseMoveStatus.value = type
  if (type === 'down') {
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
</script>
<template>
  <div class="flex flex-col gap-x-2">
    <div style="height: 14vh">
      <div
        class="flex gap-x-2 items-center"
        @mouseout="(e) => onMouseMoveEvent(e, 'out')"
        @mousedown="(e) => onMouseMoveEvent(e, 'down')"
        @mouseup="(e) => onMouseMoveEvent(e, 'up')"
      >
        <n-icon size="41" class="mr-2">
          <icon-main />
        </n-icon>
        <div class="flex flex-col w-10/12">
          <div class="text-2xl select-none">TinyChat</div>
          <div class="text-xs dark:text-gray-400 text-gray-800">
            {{ settingStore.runtime.systemInfo.get('version') }}
          </div>
        </div>
      </div>
      <div class="mt-2 flex flex-row-reverse">
        <session-toolbar :select-item-hooks="pros.onClickHook"></session-toolbar>
      </div>
    </div>

    <div class="mt-5" style="height: 78vh">
      <n-scrollbar class="pr-4">
        <session-list :select-item-hooks="pros.onClickHook"></session-list>
      </n-scrollbar>
    </div>
  </div>
</template>
