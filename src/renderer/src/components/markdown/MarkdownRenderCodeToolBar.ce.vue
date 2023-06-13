<script setup lang="ts">
import { ref, computed } from 'vue'

const copyText = ref('copy')
const props = defineProps({
  copyData: String
})
const copyData = computed(() => decodeURIComponent(props.copyData ?? ''))
function copy(): void {
  navigator.clipboard.writeText(copyData.value).then(() => {
    copyText.value = '✔️'
    setTimeout(() => (copyText.value = 'copy'), 2000)
  })
}
</script>
<template>
  <div class="toolbar">
    <button class="copy" @click="copy">{{ copyText }}</button>
  </div>
</template>
<style scoped>
.toolbar {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
}
.copy {
  background-color: transparent;
  border: none;
  padding: 2;
  text-align: center;
  cursor: pointer;
  counter-reset: #333;
}

.copy:hover {
  box-shadow: -1px -1px 0px 0px #dbdbdbab; /* 添加灰色的阴影 */
  background-color: #dbdbdbab;
}

@media (prefers-color-scheme: dark) {
  .copy {
    background-color: transparent;
    border: none;
    padding: 2;
    text-align: center;
    cursor: pointer;
    color: #d6d6d6;
    counter-reset: #d6d6d6;
  }

  .copy:hover {
    box-shadow: -1px -1px 0px 0px #dbdbdbab; /* 添加灰色的阴影 */
    background-color: #333;
  }
}
</style>
