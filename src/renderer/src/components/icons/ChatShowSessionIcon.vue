<script setup lang="ts">
import { useSettingStore } from '@renderer/stores/SettingStore'
import { computed } from 'vue'
const settingStore = useSettingStore()
const displayMode = computed(() => settingStore.getDisplayMode)
</script>
<template>
  <template v-if="displayMode === 'dark'">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 24 24"
    >
      <path d="M6.23 20.23L8 22l10-10L8 2L6.23 3.77L14.46 12z" fill="#fafafa"></path>
    </svg>
  </template>
  <template v-else>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 24 24"
    >
      <path d="M6.23 20.23L8 22l10-10L8 2L6.23 3.77L14.46 12z" fill="2c2c2c"></path>
    </svg>
  </template>
</template>
