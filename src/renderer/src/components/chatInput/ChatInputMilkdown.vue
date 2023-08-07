<script setup lang="ts">
import { Editor, rootCtx, editorViewOptionsCtx } from '@milkdown/core'
import { listener, listenerCtx } from '@milkdown/plugin-listener'
import { commonmark } from '@milkdown/preset-commonmark'
import { $useKeymap } from '@milkdown/utils'
import { Milkdown, useEditor } from '@milkdown/vue'
import { trailing } from '@milkdown/plugin-trailing';

const emits = defineEmits(['submit'])

const editor = useEditor((root) =>
  Editor.make()
    .config((ctx) => {
      // @ts-ignore 忽略unknow，编辑器改动绑定到外部
      ctx.get(listenerCtx).markdownUpdated((ctx, markdown) => {})
      // 配置默认样式
      ctx.update(editorViewOptionsCtx, (prev) => ({
        ...prev,
        attributes: {
          class:
            'dark:bg-neutral-900 bg-neutral-50 border-solid border-2 border-neutral-200 dark:border-neutral-700 h-full focusHeight scrollbar-min'
        }
      }))
      ctx.set(rootCtx, root)
    })
    .use(commonmark)
    .use(listener)
    // 末尾添加换行
    .use(trailing)
    // Ctrl+Enter触发submit事件
    .use(
      $useKeymap('blockquoteKeymap', {
        WrapInBlockquote: {
          shortcuts: 'Mod-Enter',
          command: () => {
            return (): boolean => {
              try {
                emits('submit')
              } catch {
                return false
              }
              return true
            }
          }
        }
      })
    )
)
defineExpose({ editor })
</script>
<template>
  <Milkdown class="milkdown-extra" />
</template>
<style>
/* .milkdown {
  transition: all 0.5s;
}
.milkdown:hover,
.milkdown:focus {
  height: 20vh;
} */
.focusHeight {
  height: 5vh;
  overflow: hidden;
  transition: all 0.5s;
}
.focusHeight:hover,
.focusHeight:focus {
  height: 20vh;
  overflow: auto;
}

/* 滚动条相关代码 */
.scrollbar-min::-webkit-scrollbar {
  width: 4px;
  height: 4px;
  /**/
}

.scrollbar-min::-webkit-scrollbar-track {
  background: rgb(239, 239, 239);
  border-radius: 2px;
}

.scrollbar-min::-webkit-scrollbar-thumb {
  background: #bfbfbf;
  border-radius: 4px;
}

.scrollbar-min::-webkit-scrollbar-thumb:hover {
  background: #666;
}

@media (prefers-color-scheme: dark) {
  /* 滚动条相关代码 */
  .scrollbar-min::-webkit-scrollbar {
    width: 4px;
    height: 4px;
    /**/
  }

  .scrollbar-min::-webkit-scrollbar-track {
    background: #222;
    border-radius: 2px;
  }

  .scrollbar-min::-webkit-scrollbar-thumb {
    background: #555;
    border-radius: 4px;
  }

  .scrollbar-min::-webkit-scrollbar-thumb:hover {
    background: #c0c0c0;
  }
}
</style>
