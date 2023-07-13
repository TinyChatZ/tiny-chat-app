<script setup lang="ts">
import { useSettingStore } from '@renderer/stores/SettingStore'
import {
  NCard,
  NThing,
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
  useMessage,
  NIcon
} from 'naive-ui'
import { ref, onMounted, watch } from 'vue'
import { SettingType, SettingChatgptType, getDefaultSetting } from '@shared/config/SettingType'
import IconMain from '@renderer/components/icons/IconMain.vue'
import GithubButton from 'vue-github-button'

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

// 处理All In One配置
const allInOneConfigData = ref('')
const allInOneLoading = ref(false)
const allInOneButtonText = ref('生成配置')
const allInOneConfigInputLoading = ref(false)
// 生成AllInOne配置
function generateAllInOneConfig(): void {
  allInOneLoading.value = true
  try {
    const json = JSON.stringify(settingStore.chatgpt)
    window.electronClipboard.writeText(window.btoa(json))
    message.success('生成成功已复制到剪切板')
  } catch {
    message.error('生成位置异常')
  } finally {
    allInOneLoading.value = false
    allInOneButtonText.value = '✔️'
    setTimeout(() => (allInOneButtonText.value = '生成配置'), 1000)
  }
}
// 监听修改
watch(allInOneConfigData, (newValue) => {
  if (newValue) {
    allInOneConfigInputLoading.value = true
    setTimeout(() => {
      try {
        const json = JSON.parse(decodeURIComponent(window.atob(newValue)))
        const gptConfig: SettingChatgptType = getDefaultSetting().chatgpt
        if (json.token) gptConfig.token = json.token

        if (json.options && json.options.limitsLength)
          gptConfig.options.limitsLength = json.options.limitsLength

        if (json.options && json.options.limitsBehavior)
          gptConfig.options.limitsBehavior = json.options.limitsBehavior

        if (json.options && json.options.limitsCalculate)
          gptConfig.options.limitsCalculate = json.options.limitsCalculate

        if (json.proxy && json.proxy.address) gptConfig.proxy.address = json.proxy.address

        if (json.proxy && json.proxy.param) gptConfig.proxy.param = json.proxy.param

        if (json.proxy && json.proxy.useProxy) gptConfig.proxy.useProxy = json.proxy.useProxy

        if (json.session && json.session.savePath)
          gptConfig.session.savePath = json.session.savePath

        if (json.session && json.session.savePrefix)
          gptConfig.session.savePrefix = json.session.savePrefix

        if (json.prompts && json.prompts.generateTitle)
          gptConfig.prompts.generateTitle = json.prompts.generateTitle

        formValue.value.chatgpt = gptConfig
        message.success('解析成功')
      } catch (e) {
        console.error(e)
        message.error('解析失败，请检查格式')
      } finally {
        allInOneConfigInputLoading.value = false
        allInOneConfigData.value = ''
      }
    }, 500)
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
            <n-card id="chatgpt">
              <n-thing title="ChatGPT">
                <template #header-extra>
                  <n-button text :loading="allInOneLoading" @click="generateAllInOneConfig">
                    {{ allInOneButtonText }}
                  </n-button>
                </template>
                <n-form>
                  <n-form-item label="All In One 配置">
                    <n-input
                      v-model:value="allInOneConfigData"
                      :loading="allInOneConfigInputLoading"
                      type="textarea"
                      placeholder="如何有人给你提供了All In One Token，你可以直接把这段话粘贴到这里"
                    />
                  </n-form-item>
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
                  <n-collapse-transition
                    :show="formValue.chatgpt.options.limitsBehavior === 'failSafe'"
                  >
                    <n-form-item label="文本限制计量">
                      <n-radio-group v-model:value="formValue.chatgpt.options.limitsCalculate">
                        <n-radio-button value="character">按字符计算</n-radio-button>
                        <n-radio-button value="block">按问答计算</n-radio-button>
                      </n-radio-group>
                    </n-form-item>
                  </n-collapse-transition>
                  <n-form-item label="Prompt:标题生成（除非你有更好的否则请不要修改）">
                    <n-input
                      v-model:value="formValue.chatgpt.prompts.generateTitle"
                      type="textarea"
                    ></n-input>
                  </n-form-item>
                  <n-form-item label="代理:是否使用代理模式">
                    <n-switch v-model:value="formValue.chatgpt.proxy.useProxy" />
                  </n-form-item>
                  <n-collapse-transition :show="formValue.chatgpt.proxy.useProxy">
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
              </n-thing>
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
              <div class="flex flex-col items-center">
                <!-- 图标 -->
                <div class="p-2 bg-white rounded-lg" style="width: 48px; height: 48px">
                  <n-icon size="48">
                    <icon-main />
                  </n-icon>
                </div>
                <!-- 简介 -->
                <div>
                  <p>TinyChat是一个AI对话应用由ChatGPT驱动</p>
                </div>
                <div class="flex gap-x-2">
                  <!-- Place this tag where you want the button to render. -->
                  <github-button
                    href="https://github.com/TinyChatZ/tiny-chat-app"
                    data-color-scheme="no-preference: light; light: light; dark: dark;"
                    data-icon="octicon-star"
                    data-size="large"
                    data-show-count="true"
                    aria-label="Star TinyChatZ/tiny-chat-app on GitHub"
                    >Star</github-button
                  >
                  <!-- Place this tag where you want the button to render. -->
                  <github-button
                    href="https://github.com/TinyChatZ/tiny-chat-app/issues"
                    data-color-scheme="no-preference: light; light: light; dark: dark;"
                    data-icon="octicon-issue-opened"
                    data-size="large"
                    data-show-count="true"
                    aria-label="Issue TinyChatZ/tiny-chat-app on GitHub"
                    >Issue</github-button
                  >
                  <!-- Place this tag where you want the button to render. -->
                  <github-button
                    href="https://github.com/TinyChatZ/tiny-chat-app/releases"
                    data-color-scheme="no-preference: light; light: light; dark: dark;"
                    data-icon="octicon-download"
                    data-size="large"
                    aria-label="Download TinyChatZ/tiny-chat-app on GitHub"
                    >Download</github-button
                  >
                  <!-- Place this tag where you want the button to render. -->
                  <github-button
                    href="https://github.com/Jakentop"
                    data-color-scheme="no-preference: light; light: light; dark: dark;"
                    data-size="large"
                    data-show-count="true"
                    aria-label="Follow @Jakentop on GitHub"
                    >Follow @Jakentop</github-button
                  >
                </div>
                <!-- 软件信息 -->
                <div class="mt-10 flex gap-x-2">
                  <div>Name: {{ 'TinyChat' }}</div>
                  <div>Version: {{ sysInfo.get('version') }}</div>
                </div>
                <!-- <div class="col-start-2 col-span-4">BuildDate: {{ sysInfo.get('buildDate') }}</div> -->
                <div>System: {{ sysInfo.get('systemVersion') }}</div>
                <div class="flex gap-x-2">
                  <div>Node: {{ sysInfo.get('nodeVersion') }}</div>
                  <div>Electron: {{ sysInfo.get('electronVersion') }}</div>
                  <div>Chrome: {{ sysInfo.get('chromeVersion') }}</div>
                </div>
              </div>
              <div class="m-10 grid grid-cols-6 place-items-center">
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
