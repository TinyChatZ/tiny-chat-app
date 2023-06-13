<script setup lang="ts">
import { useSettingStore } from '@renderer/stores/SettingStore'
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
  NCollapseTransition,
  NSpin,
  useMessage
} from 'naive-ui'
import { ref, onMounted, watch } from 'vue'
import { SettingType, getDefaultSetting } from '@shared/config/SettingType'

const settingStore = useSettingStore()
const message = useMessage()
// 表单数据
const formValue = ref<SettingType>(settingStore.cloneNewSetting())
// 系统信息
const sysInfo = ref<Map<string, string>>(new Map<string, string>())
// 加载图标
const loading = ref(true)
// 是否显示代理
const showProxy = ref(false)
onMounted(async () => {
  const res = await settingStore.initSettingParams()
  if (!res.success) message.error('无法加载配置')
  formValue.value = settingStore.cloneNewSetting()
  showProxy.value =
    formValue.value.chatgpt.proxy && formValue.value.chatgpt.proxy.address ? true : false
  sysInfo.value = await window.api.getSysInfo()
  loading.value = false
})

// 监听配置发生变化,刷新数据
watch(
  formValue,
  async () => {
    // TODO 最好添加节流，否则每次都会请求
    console.log(formValue.value.general.fontSize)
    settingStore.setSettingParams(formValue.value)
  },
  { deep: true }
)

// 重置本地配置
async function handleResetSetState(): Promise<void> {
  settingStore.resetInitSetting()
  formValue.value = settingStore.cloneNewSetting()
}

// 恢复成默认设置
async function handleResetEmptySet(): Promise<void> {
  formValue.value = getDefaultSetting()
}

// 唤起开发者界面
async function openDevTool(type: string): Promise<void> {
  window.api.openDevTools(type)
}

// 获取系统可用字体
const sysFontFamilies = ref(new Array<{ label: string; value: string }>())
const sysFontFamiliesLoading = ref(false)
onMounted(async () => {
  if (sysFontFamilies.value.length > 0) return
  sysFontFamiliesLoading.value = true
  try {
    const data = await window.api.getSysFontFamilies()
    console.log(data)
    const li = new Array<{ label: string; value: string }>()
    data.forEach((item) => li.push({ label: item, value: item }))
    sysFontFamilies.value = li
  } catch (e) {
    message.error('系统字体加载失败')
  } finally {
    sysFontFamiliesLoading.value = false
  }
})
// Hash模式下锚点定位兼容性代码
function gotoHash(id: string): void {
  const target = document.querySelector(id)
  if (target) {
    target.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>
<template>
  <div class="grid grid-cols-12">
    <div class="col-span-3">
      <n-card :bordered="false" class="h-full">
        <div class="text-2xl border-solid border-0 border-b-2 border-indigo-500/10 pb-4">配置</div>
        <n-anchor
          affix
          :trigger-top="100"
          :top="100"
          :show-rail="true"
          :show-background="true"
          ignore-gap
          :bound="120"
          type="block"
        >
          <n-anchor-link title="通用(General)" href="#/set#general" @click="gotoHash('#general')" />
          <n-anchor-link title="ChatGPT" href="#/set#chatgpt" @click="gotoHash('#chatgpt')" />
          <!-- <n-anchor-link title="快捷键" href="#shortcuts" /> -->
          <!-- <n-anchor-link title="检查更新" href="#update" /> -->
          <n-anchor-link title="关于(About)" href="#/set#about" @click="gotoHash('#about')" />
          <n-anchor-link
            v-show="formValue.other.devMode"
            title="开发者(DevTools)"
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
                <n-form-item label="显示模式">
                  <n-radio-group v-model:value="formValue.general.displayMode">
                    <n-radio-button key="light" value="light">明亮</n-radio-button>
                    <n-radio-button key="dark" value="dark">黑暗</n-radio-button>
                    <n-radio-button key="system" value="system">跟随系统</n-radio-button>
                  </n-radio-group>
                </n-form-item>
                <n-form-item label="窗口置顶"
                  ><n-switch v-model:value="formValue.general.windowTop" />
                </n-form-item>
                <n-form-item label="保留窗口位置">
                  <n-switch v-model:value="formValue.general.saveWindowPosition" />
                </n-form-item>
                <n-form label="窗口大小" label-placement="left">
                  <div class="flex gap-x-2">
                    <n-form-item label="宽度">
                      <n-input-number
                        v-model:value="formValue.general.windowSize.width"
                        placeholder="窗口长度"
                        class="col-span-5"
                        :show-button="false"
                      />
                    </n-form-item>
                    <n-form-item label="高度" label-placement="left">
                      <n-input-number
                        v-model:value="formValue.general.windowSize.height"
                        placeholder="窗口高度"
                        class="col-span-5"
                        :show-button="false"
                      />
                    </n-form-item>
                  </div>
                </n-form>
                <n-form-item label="字体">
                  <n-select
                    v-model:value="formValue.general.fontFamily"
                    :options="sysFontFamilies"
                    :loading="sysFontFamiliesLoading"
                    clearable
                    placeholder="请设置字体"
                  />
                </n-form-item>
                <n-form-item label="字体大小">
                  <n-input-number
                    v-model:value="formValue.general.fontSize"
                    clearable
                    max="128"
                    min="0"
                    placeholder="请选择字体大小"
                  />
                </n-form-item>
              </n-form>
            </n-card>

            <!-- chagpt配置卡片 -->
            <n-card id="chatgpt" title="ChatGPT">
              <n-form>
                <n-form-item label="OpenAI Token"
                  ><n-input
                    v-model:value="formValue.chatgpt.token"
                    placeholder="这是OpenAI官网中生成的token"
                /></n-form-item>
                <n-form-item label="文本限制长度(500-5000)">
                  <n-input-number
                    v-model:value="formValue.chatgpt.options.limitsLength"
                    max="5000"
                    min="500"
                    step="500"
                    placeholder="限制文本长度默认为5000"
                  />
                </n-form-item>
                <n-form-item label="文本限制策略">
                  <n-radio-group v-model:value="formValue.chatgpt.options.limitsBehavior">
                    <n-radio-button value="failSafe">忽略早期内容</n-radio-button>
                    <n-radio-button value="failFast">提示错误</n-radio-button>
                  </n-radio-group>
                </n-form-item>
                <n-form-item label="文本限制计量">
                  <n-radio-group v-model:value="formValue.chatgpt.options.limitsCalculate">
                    <n-radio-button value="character">按字符计算</n-radio-button>
                    <n-radio-button value="block">按问答计算</n-radio-button>
                  </n-radio-group>
                </n-form-item>
                <n-form-item label="代理:是否使用代理模式">
                  <n-switch v-model:value="showProxy" />
                </n-form-item>
                <n-collapse-transition :show="showProxy">
                  <n-form-item label="代理地址"
                    ><n-input
                      v-model:value="formValue.chatgpt.proxy.address"
                      placeholder="请输入代理地址"
                  /></n-form-item>
                  <n-form-item label="代理Token"
                    ><n-input
                      v-model:value="formValue.chatgpt.proxy.param"
                      placeholder="请输入代理token"
                  /></n-form-item>
                </n-collapse-transition>
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
            <n-card id="about" title="关于（About）" style="min-height: 400px" class="align-middle">
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
                <div class="col-start-2 col-span-4">BuildDate: {{ sysInfo.get('buildDate') }}</div>
                <div class="col-start-2 col-span-4 content-center">
                  System: {{ sysInfo.get('systemVersion') }}
                </div>
                <div class="col-start-2 col-span-4">Node: {{ sysInfo.get('nodeVersion') }}</div>
                <div class="col-start-2 col-span-4">
                  Electron: {{ sysInfo.get('electronVersion') }}
                </div>
                <div class="col-start-2 col-span-4">Chrome: {{ sysInfo.get('chromeVersion') }}</div>

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
            <n-card v-show="formValue.other.devMode" id="devMode" title="开发者(DevTools)">
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
</template>

<style scoped></style>
