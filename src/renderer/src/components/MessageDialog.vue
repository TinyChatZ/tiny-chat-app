<script lang="ts" setup>
import { NMessageProvider, NDialogProvider } from 'naive-ui'
</script>
<template>
  <div>
    <n-dialog-provider class="h-full">
      <n-message-provider class="h-full">
        <slot></slot>
      </n-message-provider>
    </n-dialog-provider>
  </div>
</template>
