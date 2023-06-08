import { createApp, defineCustomElement } from 'vue'
import WebComponentMarkdownRenderCodeToolBar from '@renderer/components/markdown/MarkdownRenderCodeToolBar.ce.vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import { router } from './router'
// 导入TaiWindcss
import './index.css'
// 高亮插件
import 'highlight.js/styles/github.css'

// 注册Element tip注册只能执行一次否则会报错
const CodeToolBar = defineCustomElement(WebComponentMarkdownRenderCodeToolBar)
customElements.define('web-component-code-tool-bar', CodeToolBar)

createApp(App).use(createPinia()).use(router).mount('#app')
