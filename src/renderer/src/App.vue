<script setup lang="ts">
import { RouterView } from 'vue-router'
import MessageDialog from '@renderer/components/MessageDialog.vue'
</script>

<template>
  <message-dialog class="h-full">
    <router-view></router-view>
  </message-dialog>
</template>

<style lang="less"></style>
