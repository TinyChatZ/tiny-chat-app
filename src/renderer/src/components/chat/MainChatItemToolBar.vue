<script setup lang="ts">
import { NButton, NIcon, useMessage } from 'naive-ui'
import { defineProps } from 'vue'

const message = useMessage()
/**
 * 对话列表的工具条行为
 */
interface Action {
  copy: () => void
  edit: () => void
  drop: () => void
}
// 外部回调
const props = defineProps<{
  action: Action
}>()
// 行为
function act(type: string): void {
  switch (type) {
    case 'copy':
      props.action.copy()
      message.success('复制成功')
      break
    case 'edit':
      props.action.edit()
      break
    case 'drop':
      props.action.drop()
      message.success('删除成功')
      break
  }
}
</script>
<template>
  <div class="flex gap-1">
    <n-button quaternary type="default" size="tiny" @click="act('copy')">
      <n-icon
        ><svg
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          viewBox="0 0 24 24"
        >
          <path
            d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"
            fill="currentColor"
          ></path></svg
      ></n-icon>
    </n-button>
    <n-button quaternary type="default" size="tiny" @click="act('edit')">
      <n-icon>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          viewBox="0 0 24 24"
        >
          <path
            d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83l3.75 3.75l1.83-1.83a.996.996 0 0 0 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z"
            fill="currentColor"
          ></path>
        </svg>
      </n-icon>
    </n-button>
    <n-button quaternary size="tiny" @click="act('drop')">
      <n-icon>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          viewBox="0 0 24 24"
        >
          <path
            d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9zm7.5-5l-1-1h-5l-1 1H5v2h14V4h-3.5z"
            fill="currentColor"
          ></path>
        </svg>
      </n-icon>
    </n-button>
  </div>
</template>
<style scoped></style>
