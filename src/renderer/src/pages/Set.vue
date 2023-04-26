<script setup lang="ts">
import { SettingStoreState, useSettingStore } from '@renderer/stores/SettingStore'
import {
  NCard,
  NAnchor,
  NAnchorLink,
  NForm,
  NFormItem,
  NRadioGroup,
  NRadioButton,
  NSwitch,
  NInput,
  NInputNumber,
  NSelect,
  NButton,
  NScrollbar,
  NPopconfirm,
  NSpin,
  useMessage
} from 'naive-ui'
import { ref, onMounted, watch } from 'vue'
import MessageDialog from '@renderer/components/MessageDialog.vue'

const settingStore = useSettingStore()
const message = useMessage()
// 表单数据
const formValue = ref<SettingStoreState>(settingStore.cloneNewSetting())
const sysInfo = ref<Map<string, string>>(new Map<string, string>())
// 加载图标
const loading = ref(true)
onMounted(async () => {
  const res = await settingStore.initSettingParams()
  if (!res.success) message.error('无法加载配置')
  formValue.value = settingStore.cloneNewSetting()

  sysInfo.value = await window.api.getSysInfo()
  loading.value = false
})

// 监听配置发生变化,刷新数据
watch(
  formValue,
  async () => {
    // TODO 最好添加节流，否则每次都会请求
    settingStore.setSettingParams(formValue.value)
  },
  { deep: true }
)

// 重置本地配置
async function handleResetSetState(): Promise<void> {
  settingStore.resetInitSetting()
  await settingStore.setSettingParams(settingStore.cloneNewSetting())
  formValue.value = settingStore.cloneNewSetting()
}

// 恢复成默认设置
async function handleResetEmptySet(): Promise<void> {
  settingStore.$reset()
  await settingStore.setSettingParams(settingStore.cloneNewSetting())
  formValue.value = settingStore.cloneNewSetting()
}

// 唤起开发者界面
async function openDevTool(type: string): Promise<void> {
  window.api.openDevTools(type)
}

// Hash模式下锚点定位兼容性代码
function gotoHash(id: string): void {
  const target = document.querySelector(id)
  if (target) {
    target.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>
<template>
  <message-dialog>
    <div class="grid grid-cols-12">
      <div class="col-span-3">
        <n-card :bordered="false">
          <div class="text-2xl mb-3">配置</div>
          <n-anchor
            affix
            :trigger-top="80"
            :top="80"
            :show-rail="true"
            :show-background="true"
            ignore-gap
            :bound="120"
            type="block"
          >
            <n-anchor-link
              title="通用（General)"
              href="#/set#general"
              @click="gotoHash('#general')"
            />
            <n-anchor-link title="ChatGPT" href="#/set#chatgpt" @click="gotoHash('#chatgpt')" />
            <!-- <n-anchor-link title="快捷键" href="#shortcuts" /> -->
            <!-- <n-anchor-link title="检查更新" href="#update" /> -->
            <n-anchor-link title="关于（About）" href="#/set#about" @click="gotoHash('#about')" />
            <n-anchor-link
              v-show="formValue.other.devMode"
              title="开发者"
              href="#/set#devMode"
              @click="gotoHash('#devMode')"
            />
          </n-anchor>
        </n-card>
      </div>
      <div class="col-span-9">
        <n-scrollbar class="h-screen">
          <n-spin :show="loading">
            <n-card :bordered="false">
              <!-- 通用卡片 -->
              <n-card id="general" title="通用（General)">
                <n-form>
                  <!-- todo 尚未实现 -->
                  <n-form-item v-show="false" label="显示模式">
                    <n-radio-group v-model:value="formValue.general.dispalyMode" disabled>
                      <n-radio-button key="light" value="明亮">明亮</n-radio-button>
                      <n-radio-button key="dark" value="黑暗">黑暗</n-radio-button>
                      <n-radio-button key="auto" value="跟随系统">跟随系统</n-radio-button>
                    </n-radio-group>
                  </n-form-item>
                  <n-form-item label="窗口置顶"
                    ><n-switch v-model:value="formValue.general.windowTop" />
                  </n-form-item>
                  <n-form-item label="保留窗口位置">
                    <n-switch v-model:value="formValue.general.saveWindowPosition" />
                  </n-form-item>
                  <n-form-item label="窗口大小">
                    <div class="grid grid-cols-12 gap-x-2 items-center">
                      <span class="col-span-1">宽度:</span>
                      <n-input-number
                        v-model:value="formValue.general.windowSize.width"
                        class="col-span-5"
                        :show-button="false"
                      />
                      <span class="col-span-1">高度:</span>
                      <n-input-number
                        v-model:value="formValue.general.windowSize.height"
                        class="col-span-5"
                        :show-button="false"
                      />
                    </div>
                  </n-form-item>
                  <!-- TODO 尚未实现 -->
                  <n-form-item v-show="false" label="字体">
                    <n-select
                      v-model:value="formValue.general.fontFamily"
                      placeholder="请设置字体"
                    />
                  </n-form-item>
                  <!-- TODO 尚未实现 -->
                  <n-form-item v-show="false" label="字体大小">
                    <n-select
                      v-model:value="formValue.general.fontSize"
                      placeholder="请选择字体大小"
                    />
                  </n-form-item>
                </n-form>
              </n-card>
              <!-- chagpt配置卡片 -->
              <n-card id="chatgpt" title="ChatGPT">
                <n-form>
                  <n-form-item label="OpenAI Token"
                    ><n-input v-model:value="formValue.chatgpt.token"
                  /></n-form-item>
                  <n-form-item label="TokenServer 地址"
                    ><n-input v-model:value="formValue.chatgpt.proxy.address"
                  /></n-form-item>
                  <n-form-item label="TokenServer Token"
                    ><n-input v-model:value="formValue.chatgpt.proxy.param"
                  /></n-form-item>
                </n-form>
              </n-card>
              <!-- 快捷键卡片 -->
              <n-card v-show="false" id="shortcuts" title="快捷键">
                <n-form>
                  <n-form-item label="发送"
                    ><n-input v-model:value="formValue.shortcuts.send"
                  /></n-form-item>
                  <n-form-item label="刷新"
                    ><n-input v-model:value="formValue.shortcuts.refresh"
                  /></n-form-item>
                  <n-form-item label="最小化"
                    ><n-input v-model:value="formValue.shortcuts.minimize"
                  /></n-form-item>
                  <n-form-item label="窗口置顶"
                    ><n-input v-model:value="formValue.shortcuts.windowTop"
                  /></n-form-item>
                  <n-form-item label="固定窗口位置"
                    ><n-input v-model:value="formValue.shortcuts.doFixedWindowPosition"
                  /></n-form-item>
                  <n-form-item label="解除固定窗口位置"
                    ><n-input v-model:value="formValue.shortcuts.undoFixedWindowPosition"
                  /></n-form-item>
                </n-form>
              </n-card>
              <!-- 检查更新 -->
              <n-card v-show="false" id="update" title="检查更新">
                <n-button>检查更新</n-button>
                <div class="mt-4 gap-x-2">自动检查：<n-switch></n-switch></div>
                <div class="mt-6">
                  <div>当前版本：</div>
                  <div>最近检查时间：</div>
                </div>
              </n-card>
              <!-- 关于 -->
              <n-card
                id="about"
                title="关于（About）"
                style="min-height: 400px"
                class="align-middle"
              >
                <div class="grid grid-cols-6 place-items-center">
                  <!-- 图标 -->
                  <div class="col-start-2 col-span-4">
                    <img src="@renderer/assets/icons/main-icon.svg" />
                  </div>
                  <!-- 简介 -->
                  <div class="col-start-2 col-span-4">
                    <p></p>
                  </div>
                  <!-- 软件信息 -->
                  <div class="col-start-2 col-span-4 content-center">Name: {{ 'TinyChat' }}</div>
                  <div class="col-start-2 col-span-4">Version: {{ sysInfo.get('version') }}</div>
                  <div class="col-start-2 col-span-4">
                    BuildDate: {{ sysInfo.get('buildDate') }}
                  </div>
                  <div class="col-start-2 col-span-4 content-center">
                    System: {{ sysInfo.get('systemVersion') }}
                  </div>
                  <div class="col-start-2 col-span-4">Node: {{ sysInfo.get('nodeVersion') }}</div>
                  <div class="col-start-2 col-span-4">
                    Electron: {{ sysInfo.get('electronVersion') }}
                  </div>
                  <div class="col-start-2 col-span-4">
                    Chrome: {{ sysInfo.get('chromeVersion') }}
                  </div>

                  <div class="col-start-2 col-span-4 flex gap-x-2">
                    开发者模式：<n-switch v-model:value="formValue.other.devMode" />
                  </div>
                  <!-- 重置，默认值 -->
                  <div class="mt-3 col-start-2 col-span-4 flex gap-x-2">
                    <n-popconfirm
                      negative-text="取消"
                      positive-text="确认"
                      @positive-click="handleResetSetState"
                    >
                      <template #trigger><n-button type="primary">重置修改</n-button></template>
                      将重置你本次在页面中的修改，请确认是否继续
                    </n-popconfirm>

                    <n-popconfirm
                      negative-text="取消"
                      positive-text="确认"
                      @positive-click="handleResetEmptySet"
                    >
                      <template #trigger><n-button type="error">恢复默认值</n-button></template>
                      将恢复成最初的设置，注意所有设置将不被保留请谨慎
                    </n-popconfirm>
                  </div>
                </div>
              </n-card>
              <!-- 开发者模式 -->
              <n-card v-show="formValue.other.devMode" id="devMode" title="开发者模式">
                <n-card :bordered="false" title="唤起开发者工具">
                  <div class="flex gap-x-5">
                    <n-button @click="openDevTool('ChatWindow')">Chat界面</n-button>
                    <n-button @click="openDevTool('SetWindow')">Set界面</n-button>
                  </div>
                </n-card>
              </n-card>
            </n-card>
          </n-spin>
        </n-scrollbar>
      </div>
    </div>
  </message-dialog>
</template>

<style scoped></style>