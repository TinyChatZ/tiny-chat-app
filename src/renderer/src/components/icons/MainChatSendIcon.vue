<!-- 聊天窗口中发送图标 -->
<script setup lang="ts">
const props = defineProps<{ loading: boolean }>()
</script>
<template>
  <div
    :class="{
      'p-1 flex items-center justify-center  rounded-full bg-gradient-to-b from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 buttonStyle': true,
      'cursor-pointer': !props.loading,
      'cursor-progress': props.loading
    }"
  >
    <div v-show="!props.loading" class="text-white select-none">Send</div>
    <div v-show="props.loading">
      <div class="lds-dual-ring"></div>
    </div>
  </div>
</template>
<style scoped>
.buttonStyle {
  margin-top: 0.5vh;
  height: 5vh;
  width: calc(5vh * 2.5);
}
.lds-dual-ring {
  display: inline-block;
  width: 3vh;
  height: 3vh;
}
.lds-dual-ring:after {
  content: ' ';
  display: block;
  width: 3vh;
  height: 3vh;
  margin: 0.2vh;
  margin-top: 0.5vh;
  border-radius: 50%;
  border: 0.4vh solid #fff;
  border-color: #fff transparent #fff transparent;
  animation: lds-dual-ring 1.2s linear infinite;
}
@keyframes lds-dual-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
