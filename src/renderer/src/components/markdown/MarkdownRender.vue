<script setup lang="ts">
import { PropType, computed, ref } from 'vue'
import MarkdownIt, { Options as MarkdownItOptions } from 'markdown-it'
import hljs from 'highlight.js'

// markdown配置
const markdownConfig = ref({
  html: false,
  typographer: true,
  highlight: (str, lang) => buildCodeBlock(str, lang)
})

// 创建props
const props = defineProps({
  source: {
    type: String,
    required: true
  },
  options: {
    type: Object as PropType<MarkdownItOptions>,
    required: false
  }
})

// mdRender实例
const mdRender = ref<MarkdownIt>(
  new MarkdownIt({ ...props.options, ...markdownConfig.value } ?? markdownConfig.value)
)

// 监听外部改变并实时渲染
const content = computed((): string | undefined => {
  return mdRender.value?.render(props.source ?? '')
})

// fix #15 给pre和code提供默认初始值
mdRender.value.renderer.rules.code_block = (tokens, idx, _options, _env, slf): string => {
  const token = tokens[idx]
  return buildCodeBlock(tokens[idx].content, undefined, slf.renderAttrs(token))
}

/**
 * 构建代码块
 * @param str 需要构建的code文本
 * @param lang 语言，为空时自动配置
 * @returns 返回str
 */
function buildCodeBlock(str: string, lang?: string, other?: string): string {
  if (lang && hljs.getLanguage(lang)) {
    return (
      `<pre style="margin auto;" ${other} class="hljs code_public_style">` +
      `<div><web-component-code-tool-bar copy-data="${encodeURIComponent(str)}" /></div>` +
      `<code class="p-3 h-full overflow-x-auto block code_scrollbar">${
        hljs.highlight(str, { language: lang, ignoreIllegals: true }).value
      }</code></pre>`
    )
  } else {
    return (
      `<pre style="margin auto;" class="hljs code_public_style">` +
      `<div><web-component-code-tool-bar copy-data="${encodeURIComponent(str)}" /></div>` +
      `<code class="p-3 h-full overflow-x-auto block code_scrollbar">` +
      `${hljs.highlightAuto(str).value}` +
      `</code></pre>`
    )
  }
}
</script>

<template>
  <!--eslint-disable-next-line vue/no-v-html-->
  <div v-html="content"></div>
</template>

<style lang="less">
.copy-btn {
  top: 2px;
  right: 4px;
  z-index: 10;
  color: #333;
  cursor: pointer;
  background-color: #fff;
  border: 0;
  border-radius: 2px;
}

// 代码块背景
.code_public_style {
  background: #f8f8f8;
}

// 滚动条相关代码
.code_scrollbar::-webkit-scrollbar {
  width: 10px;
  height: 10px;
  /**/
}

.code_scrollbar::-webkit-scrollbar-track {
  background: rgb(239, 239, 239);
  border-radius: 2px;
}

.code_scrollbar::-webkit-scrollbar-thumb {
  background: #bfbfbf;
  border-radius: 10px;
}

.code_scrollbar::-webkit-scrollbar-thumb:hover {
  background: #333;
}

.code_scrollbar::-webkit-scrollbar-corner {
  background: #179a16;
}
</style>
