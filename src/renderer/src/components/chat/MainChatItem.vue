<script setup lang="ts">
import { type ChatItem } from '@renderer/stores/ChatgptStore'
import MarkdownRender from '@renderer/components/markdown/MarkdownRender.vue'

const props = defineProps<{
  item: ChatItem
}>()
</script>
<template>
  <div class="flex">
    <div class="mt-4" style="min-width: 2rem; min-height: 2rem">
      <template v-if="props.item.role === 'user'">
        <img class="w-8 h-8" src="@renderer/assets/icons/chat-user-icon.svg" />
      </template>
      <template v-if="props.item.role === 'assistant'">
        <!-- 该图像来源于OpenAI官网 -->
        <img class="w-8 h-8" src="@renderer/assets/icons/chat-assistant-icon.svg" />
      </template>
    </div>
    <div class="ml-3 mr-3 markdown-render">
      <markdown-render :source="props.item.content" />
    </div>
  </div>
</template>
<style scoped lang="less">
.markdown-render {
  width: calc(100vw - 6rem);
}
</style>
