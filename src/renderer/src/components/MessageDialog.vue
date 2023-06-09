<script lang="ts" setup>
import { computed } from 'vue'
import { useSettingStore } from '@renderer/stores/SettingStore'
import {
  NMessageProvider,
  NDialogProvider,
  NConfigProvider,
  NGlobalStyle,
  darkTheme,
  lightTheme
} from 'naive-ui'
const settingStore = useSettingStore()
const theme = computed(() => {
  switch (settingStore.general.dispalyMode) {
    case 'dark':
      return darkTheme
    default:
      return lightTheme
  }
})
</script>
<template>
  <div>
    <n-config-provider class="h-full" :theme="theme">
      <n-dialog-provider class="h-full">
        <n-message-provider class="h-full">
          <slot></slot>
        </n-message-provider>
      </n-dialog-provider>
      <n-global-style />
    </n-config-provider>
  </div>
</template>
