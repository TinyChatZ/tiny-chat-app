<script lang="ts" setup>
import { computed, onMounted, watch } from 'vue'
import { useSettingStore } from '@renderer/stores/SettingStore'
import {
  NMessageProvider,
  NDialogProvider,
  NConfigProvider,
  NGlobalStyle,
  darkTheme,
  lightTheme,
  GlobalThemeOverrides
} from 'naive-ui'
// 在最外层加载一次配置，后面就不用加载了
const settingStore = useSettingStore()

// 计算naive-ui样式
const theme = computed(() => {
  switch (settingStore.getDisplayMode) {
    case 'dark':
      return darkTheme
    default:
      return lightTheme
  }
})

// 计算naive-ui中需要覆盖的样式
const themeOverrides = computed(
  (): GlobalThemeOverrides => ({
    common: {
      fontFamily: settingStore.general.fontFamily || undefined,
      fontSize: settingStore.general.fontSize ? settingStore.general.fontSize + 'px' : undefined
    }
  })
)

// 等待组件挂载时，才添加额外样式
onMounted(async () => {
  // 初始化markdown样式
  const markdownStyle = document.createElement('style')
  document.head.appendChild(markdownStyle)
  // 这里加上inline后保证不会被直接注入到页面的head中
  const { default: dark } = await import('highlight.js/styles/atom-one-dark.css?inline')
  const { default: light } = await import('highlight.js/styles/atom-one-light.css?inline')
  // 根据配置加载css文件
  watch(
    () => settingStore.getDisplayMode,
    async (newValue) => {
      if (newValue === 'dark') {
        markdownStyle.textContent = dark
      } else {
        markdownStyle.textContent = light
      }
    },
    { immediate: true }
  )
})
</script>
<template>
  <div>
    <n-config-provider class="h-full" :theme="theme" :theme-overrides="themeOverrides">
      <n-dialog-provider class="h-full">
        <n-message-provider class="h-full">
          <slot></slot>
        </n-message-provider>
      </n-dialog-provider>
      <n-global-style />
    </n-config-provider>
  </div>
</template>
