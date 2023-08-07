<script setup lang="ts">
import { useMessage } from 'naive-ui'
import MainChat from '@renderer/components/chat/MainChat.vue'
import { useSettingStore } from '@renderer/stores/SettingStore'
import { TinyResultUiMessageHandler, TinyResultUtils } from '@renderer/utils/TinyResultUtils'
import ChatTitleBar from '@renderer/components/chat/ChatTitleBar.vue'
const settingStore = useSettingStore()

// 设置全局默认异常处理为naive-ui
const defaultHandler = new TinyResultUiMessageHandler(useMessage())
TinyResultUtils.defaultHandler = defaultHandler
</script>

<template>
  <div class="h-full">
    <!-- 标题头组件 -->
    <ChatTitleBar />
    <div v-show="settingStore.showDialogState" style="height: 90%">
      <main-chat ref="mainChat" />
    </div>
  </div>
</template>

<style>
body {
  height: 100vh;
}
</style>
