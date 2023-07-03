<script setup lang="ts">
import { useSettingStore } from '@renderer/stores/SettingStore'
import { computed } from 'vue'
const settingStore = useSettingStore()
const displayMode = computed(() => settingStore.getDisplayMode)
</script>
<template>
  <template v-if="displayMode === 'dark'"
    ><svg
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 24 24"
    >
      <path
        d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9zm7.5-5l-1-1h-5l-1 1H5v2h14V4h-3.5z"
        fill="#fafafa"
      ></path></svg></template
  ><template v-else
    ><svg
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 24 24"
    >
      <path
        d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9zm7.5-5l-1-1h-5l-1 1H5v2h14V4h-3.5z"
        fill="#2c2c2c"
      ></path></svg
  ></template>
</template>
