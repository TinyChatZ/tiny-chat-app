<script setup lang="ts">
import { MilkdownProvider, UseEditorReturn } from '@milkdown/vue'
import { getMarkdown, replaceAll } from '@milkdown/utils'
import ChatInputMilkdown from '@renderer/components/chatInput/ChatInputMilkdown.vue'
import { ref, defineEmits } from 'vue'
import { ChatInputmilkdownAction } from '@renderer/types/ChatInputMilkdownType'

// 透传事件
const emits = defineEmits(['submit'])

const milkdown = ref<{ editor: UseEditorReturn }>()

const action: ChatInputmilkdownAction = {
  getMakrdownText: function (): string {
    return milkdown.value?.editor.get()?.action(getMarkdown()) ?? ''
  },
  setMakrdownText: function (text: string): void {
    const editor = milkdown.value?.editor.get()
    if (editor) {
      editor.action(replaceAll(text))
    } else {
      console.warn('milkdown editor尚未加载')
    }
  }
}
defineExpose<ChatInputmilkdownAction>(action)
</script>
<template>
  <MilkdownProvider>
    <ChatInputMilkdown ref="milkdown" @submit="emits('submit')" />
  </MilkdownProvider>
</template>
<style>
.milkdown p {
  margin: 0rem;
}

.milkdown ol {
  list-style: decimal;
  margin: 0rem;
  padding: 0rem;
  padding-left: 1.2rem;
}

.milkdown ul {
  list-style: disc;
  margin: 0rem;
  padding: 0rem;
  padding-left: 1.2rem;
}

/* blockquote */
.milkdown blockquote {
  border-left: 4px solid #aaaaaa80;
  margin-left: 2px;
  padding: 0 15px;
  color: #aaa;
}
.milkdown blockquote blockquote {
  padding-right: 0;
}
/* todo code样式优化 */
.milkdown pre {
  margin: 8px;
  padding: 8px;
  background-color: #cecece;
  border-radius: 0.5rem;
}

@media (prefers-color-scheme: dark) {
  .milkdown pre {
    margin: 8px;
    padding: 8px;
    background-color: #2b2b2b;
    border-radius: 0.5rem;
  }
}
</style>
