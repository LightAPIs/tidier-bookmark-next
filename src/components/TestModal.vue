<template>
  <a-modal
    :visible="visible"
    :title="$i18n('rulesTestModalTitle')"
    class="test-modal"
    :footer="null"
    :get-container="getContainer"
    closeable
    @cancel="onCancel"
  >
    <a-space direction="vertical" style="width: 100%">
      <a-row type="flex" align="middle">
        <a-col flex="80px" class="label">{{ $i18n('rulesEditTestLabel') }}</a-col>
        <a-col :flex="21">
          <a-input class="input" v-model:value="testValue" autocomplete="off" @pressEnter="() => onClick()" />
        </a-col>
        <a-col :flex="4" class="center-button">
          <a-button @click="onClick">{{ $i18n('rulesEditTestText') }}</a-button>
        </a-col>
      </a-row>
      <a-divider>{{ $i18n('rulesEditTestResultLabel') }}</a-divider>
      <a-row type="flex" align="middle">
        <a-col flex="auto">
          {{ testResult }}
        </a-col>
      </a-row>
      <a-divider>{{ $i18n('rulesTestMatchLabel') }}</a-divider>
      <a-row type="flex" align="middle">
        <a-col flex="auto">
          <div class="tags">
            <template v-for="{ name, pattern, flags, replacement, index } in tags" :key="index">
              <a-tooltip>
                <template #title>
                  <rule-string :name="name" :pattern="pattern" :flags="flags" :replacement="replacement"></rule-string>
                </template>
                <a-tag :key="index" color="blue">{{ index }}</a-tag>
              </a-tooltip>
            </template>
          </div>
        </a-col>
      </a-row>
    </a-space>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, toRaw, watch } from 'vue';
import type { Ref } from 'vue';
import { RegOperation, sortRules } from '@/common/operation';
import RuleString from '@/components/RuleString.vue';

const props = defineProps<{
  visible: boolean;
  data: RuleDataItem[];
  container: string;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
}>();

const testValue = ref('');
const testResult = ref('');
const tags: Ref<RuleTagDataItem[]> = ref([]);

watch(
  () => props.visible,
  async newValue => {
    if (newValue) {
      testResult.value = '';
      tags.value = [];
    }
  }
);

function getContainer() {
  return document.getElementById(props.container) || document.body;
}

function onClick() {
  let result = testValue.value;
  const matchArr: RuleTagDataItem[] = [];
  if (result) {
    const tempData = toRaw(props.data);
    sortRules(tempData);
    tempData.forEach(item => {
      const { enable, name, pattern, flags, replacement, index } = item;
      if (enable) {
        const reg = new RegOperation(pattern, flags);
        if (reg.test(result)) {
          matchArr.push({
            name,
            index,
            pattern,
            flags,
            replacement,
          });
          result = reg.replace(result, replacement);
        }
      }
    });
  }

  testResult.value = result;
  tags.value = matchArr;
}

function onCancel() {
  emit('update:visible', false);
}
</script>

<style lang="less">
.test-modal {
  .center-button {
    text-align: center;
  }
  .tags {
    white-space: nowrap;
    overflow-x: auto;
    padding: 5px 0px;
    &::-webkit-scrollbar {
      background-color: @scrollbar-background-color;
      border-radius: 5px;
      height: 10px;
    }
    &::-webkit-scrollbar-thumb {
      background-color: @scrollbar-thumb-background-color;
      border-radius: 5px;
    }
  }
}
</style>
