<script setup lang="ts">
import { NPopover } from 'naive-ui'
const props = defineProps<{
  status?: 'sync' | 'unsync' | 'unload' | 'error' | 'unknown'
}>()
</script>
<template>
  <template v-if="props.status === 'sync'">
    <n-popover>
      <div>已同步</div>
      <template #trigger><div class="sync-circle"></div></template>
    </n-popover>
  </template>
  <template v-else-if="props.status === 'unsync'">
    <n-popover>
      <div>同步中</div>
      <template #trigger><div class="unsync-circle"></div></template>
    </n-popover>
  </template>
  <template v-else-if="props.status === 'unload'">
    <n-popover>
      <div>未加载</div>
      <template #trigger><div class="unload-circle"></div></template>
    </n-popover>
  </template>
  <template v-else-if="props.status === 'error'">
    <n-popover>
      <div>异常</div>
      <template #trigger><div class="error-circle"></div></template>
    </n-popover>
  </template>
  <template v-else>
    <n-popover>
      <div>未知状态</div>
      <template #trigger><div class="unknow-circle"></div></template>
    </n-popover>
  </template>
</template>

<style scoped>
.error-circle {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #ff2121;
  box-shadow: 0 0 5px #ff2121;
  animation: blink 1s infinite;
  display: inline-block;
}
.error-circle {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #ff2121;
  box-shadow: 0 0 5px #ff2121;
  animation: blink 1s infinite;
  display: inline-block;
}
.unsync-circle {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #ffb121;
  box-shadow: 0 0 5px #ffb121;
  animation: blink 1s infinite;
  display: inline-block;
}
.unload-circle {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #838383;
  box-shadow: 0 0 5px #838383;
  display: inline-block;
}
.sync-circle {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #00ff00;
  box-shadow: 0 0 5px #00ff00;
  animation: blink 5s infinite;
  display: inline-block;
}

@keyframes blink {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.9;
  }
  100% {
    opacity: 0.6;
  }
}
</style>
