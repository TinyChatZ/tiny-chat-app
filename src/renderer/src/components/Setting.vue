<script setup lang="ts">
import { getSettingIcon } from '@renderer/utils/IconUtils'
import { NButton, useDialog } from 'naive-ui'
const dialog = useDialog()
// 退出程序
const eixtProgram = (): void => {
  dialog.warning({
    title: '退出',
    content: '确定要退出？',
    positiveText: '确定',
    negativeText: '不确定',
    onPositiveClick: () => {
      window.api.exitProgram()
    }
  })
}
// 唤醒配置界面
const clickSet = async (): Promise<void> => {
  window.api.openSetWindow()
}
</script>

<template>
  <div class="flex items-center space-x-3">
    <!-- 设置按钮 -->
    <n-button text @click="clickSet">
      <img :src="getSettingIcon()" />
    </n-button>
    <n-button quaternary @click="eixtProgram">退出</n-button>
  </div>
</template>

<style scoped></style>
