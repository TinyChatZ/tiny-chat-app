<script lang="ts" setup>
import { useSettingStore } from '@renderer/stores/SettingStore'
import {
  NCard,
  NForm,
  NFormItem,
  NRadioGroup,
  NRadioButton,
  NInputNumber,
  NSelect,
  useMessage
} from 'naive-ui'
import { onMounted, PropType, ref } from 'vue'

import { SettingGeneralType } from '@shared/config/SettingType'

const settingStore = useSettingStore()

const message = useMessage()

defineProps({
  config: Object as PropType<SettingGeneralType>
})

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
</script>

<template>
  <n-card id="general" title="通用（General)">
    <n-form>
      <n-form-item label="显示模式">
        <n-radio-group v-model:value="config.displayMode">
          <n-radio-button key="light" value="light">明亮</n-radio-button>
          <n-radio-button key="dark" value="dark">黑暗</n-radio-button>
          <n-radio-button key="system" value="system">跟随系统</n-radio-button>
        </n-radio-group>
      </n-form-item>
      <n-form-item label="窗口置顶"
        ><n-switch v-model:value="config.windowTop" />
      </n-form-item>
      <n-form-item label="保留窗口位置">
        <n-switch v-model:value="formValue.general.saveWindowPosition" />
      </n-form-item>
      <n-form-item label="多会话唤醒方式">
        <div class="flex flex-col gap-y-5">
          <div class="flex gap-x-2 items-center">
            <div>主窗口图标唤醒方式：</div>
            <n-radio-group v-model:value="formValue.general.sessionWakeUp.mainWindow">
              <n-radio-button value="click">鼠标单击</n-radio-button>
              <n-radio-button value="hover">鼠标hover</n-radio-button>
            </n-radio-group>
          </div>
          <div v-show="false" class="flex gap-x-2">
            <div>缩略图图标唤醒方式：</div>
            <n-radio-group v-model:value="formValue.general.sessionWakeUp.thumbnall">
              <n-radio-button value="click">鼠标单击</n-radio-button>
              <n-radio-button value="hover">鼠标hover</n-radio-button>
            </n-radio-group>
          </div>
        </div>
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
</template>
