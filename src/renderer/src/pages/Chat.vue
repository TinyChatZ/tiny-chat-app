<script setup lang="ts">
import { NButton, NCollapseTransition, NPopover } from 'naive-ui'
import { ref } from 'vue'
import MainChat from '@renderer/components/chat/MainChat.vue'
import Setting from '@renderer/components/Setting.vue'
import SessionList from '@renderer/components/session/SessionList.vue'
const showState = ref(true)
const showDialog = (): void => {
  showState.value = !showState.value
  window.api.resize(showState.value)
}
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="p-3 content-center flex items-center" style="-webkit-app-region: drag">
      <!-- 主要图标 -->
      <n-popover placement="bottom-start" :delay="300" :duration="500">
        <template #trigger>
          <NButton style="-webkit-app-region: no-drag" size="large" circle @click="showDialog">
            <img src="@renderer/assets/icons/icon-grey.png" style="width: 100%; height: auto" />
          </NButton>
        </template>
        <session-list />
      </n-popover>

      <div class="inline-block text-xl pl-2 select-none" style="line-height: 40px">TinyChat</div>
      <!-- 配置界面，刷新和修改 -->
      <n-collapse-transition class="ml-4" :show="showState">
        <setting />
      </n-collapse-transition>
    </div>
    <div v-show="showState" style="height: 90%">
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
