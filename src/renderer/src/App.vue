<script setup lang="ts">
import { RouterView } from 'vue-router'
import PreInitialization from '@renderer/components/PreInitialization.vue'
import MessageDialog from '@renderer/components/MessageDialog.vue'
</script>

<template>
  <message-dialog class="h-full">
    <pre-initialization class="h-full">
      <router-view></router-view>
    </pre-initialization>
  </message-dialog>
</template>

<style></style>
