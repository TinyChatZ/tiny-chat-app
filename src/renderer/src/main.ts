import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import { router } from './router'
// 导入TaiWindcss
import './index.css'
// 高亮插件
import 'highlight.js/styles/github.css'

createApp(App).use(createPinia()).use(router).mount('#app')
