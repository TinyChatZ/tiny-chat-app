<script setup lang="ts">
import { NButton } from 'naive-ui'
import { defineProps, ref } from 'vue'
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
      text.value.copy = '✔️'
      break
    case 'edit':
      props.action.edit()
      break
    case 'drop':
      props.action.drop()
      break
  }
}
// 工具条文本
const text = ref({
  copy: '复制',
  edit: '编辑',
  drop: '删除'
})
</script>
<template>
  <div class="flex gap-2">
    <n-button quaternary type="default" size="tiny" @click="act('copy')">
      {{ text.copy }}
    </n-button>
    <n-button quaternary type="default" size="tiny" @click="act('edit')">
      {{ text.edit }}
    </n-button>
    <n-button quaternary type="error" size="tiny" @click="act('drop')">
      {{ text.drop }}
    </n-button>
  </div>
</template>
<style scoped></style>
