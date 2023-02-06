<template>
  <a-modal
    :visible="visible"
    :mask-closable="false"
    :destroy-on-close="true"
    :width="isPopup ? '100%' : 580"
    :title="isEdit ? $i18n('rulesEditModalTitle') : $i18n('rulesEditModalAddTitle')"
    :ok-text="$i18n('rulesEditConfirmText')"
    :cancel-text="$i18n('bookmarkCancelText')"
    :get-container="getContainer"
    :wrap-class-name="isPopup ? 'full-modal' : ''"
    class="edit-modal"
    :centered="isPopup ? true : false"
    :closable="!isPopup"
    @cancel="onCancel"
    @ok="onConfirm"
  >
    <a-form ref="formRef" name="ruleForm" :model="formState" v-bind="layout" class="edit-modal">
      <a-form-item :label="$i18n('rulesTableNameText')" name="name">
        <a-input v-model:value="formState.name" autocomplete="off" />
      </a-form-item>
      <a-form-item :label="$i18n('rulesEditPatternLabel')" :rules="[{ required: true, message: i18n('rulesEditPatternMessage') }]" name="pattern">
        <a-input v-model:value="formState.pattern" autocomplete="off" />
      </a-form-item>
      <a-form-item :label="$i18n('rulesEditFlagsLabel')" name="flags">
        <template #help>
          <p class="help-p">
            <span>{{ $i18n('rulesEditRegexHelp') }}&nbsp;</span>
            <a target="_blank" :href="$i18n('rulesEditRegexUrl')">learn-regex</a>
          </p>
        </template>
        <a-checkbox-group v-model:value="formState.flags" class="checkbox-group">
          <a-row>
            <a-col :span="8">
              <a-tooltip :title="$i18n('rulesEditFlagsGTip')">
                <a-checkbox value="g">g</a-checkbox>
              </a-tooltip>
            </a-col>
            <a-col :span="8">
              <a-tooltip :title="$i18n('rulesEditFlagsITip')">
                <a-checkbox value="i">i</a-checkbox>
              </a-tooltip>
            </a-col>
            <a-col :span="8">
              <a-tooltip :title="$i18n('rulesEditFlagsUTip')">
                <a-checkbox value="u">u</a-checkbox>
              </a-tooltip>
            </a-col>
          </a-row>
        </a-checkbox-group>
      </a-form-item>
      <a-form-item :label="$i18n('rulesEditReplacementLabel')" name="replacement">
        <template #help>
          <p class="help-p">
            <span>{{ $i18n('rulesEditReplacementHelp') }}&nbsp;</span>
            <template v-for="{ title, text, color } in tags" :key="text">
              <a-tooltip :title="title">
                <a-tag :color="color">{{ text }}</a-tag>
              </a-tooltip>
            </template>
          </p>
        </template>
        <a-input v-model:value="formState.replacement" :placeholder="$i18n('rulesEditReplacementPlaceholder')" autocomplete="off" />
      </a-form-item>
      <a-form-item :label="$i18n('rulesTableIndexText')" :help="$i18n('rulesEditIndexHelp')" name="index">
        <a-input-number v-model:value="formState.index" :min="1" :max="isEdit ? max : max + 1" :precision="0" />
      </a-form-item>
      <a-divider v-if="!isPopup">{{ $i18n('rulesTestModalTitle') }}</a-divider>
      <a-form-item v-if="!isPopup" :label="$i18n('rulesEditTestLabel')" :help="$i18n('rulesEditTestHelp')" name="test">
        <a-row>
          <a-col :span="17">
            <a-input v-model:value="formState.test" autocomplete="off" />
          </a-col>
          <a-col :span="6" :offset="1">
            <a-button @click="onTest">{{ $i18n('rulesEditTestText') }}</a-button>
          </a-col>
        </a-row>
      </a-form-item>
      <a-form-item v-if="!isPopup" :label="$i18n('rulesEditTestResultLabel')">
        <p class="test-result">{{ formState.testResult }}</p>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch, toRaw } from 'vue';
import type { FormInstance } from 'ant-design-vue';
import { createEmptyRuleFormDataItem } from '@/common/data';
import { i18n } from '@/common/ui';
import { RegOperation } from '@/common/operation';

interface Tag {
  text: string;
  title: string;
  color: string;
}

const props = defineProps<{
  visible: boolean;
  formData: RuleFormDataItem;
  isEdit: boolean;
  isPopup?: boolean;
  max: number;
  container: string;
}>();

const layout = props.isPopup
  ? {
      labelCol: { xs: 3 },
      wrapperCol: { xs: 5 },
    }
  : {
      labelCol: { span: 5 },
      wrapperCol: { span: 18 },
    };

const tags: Tag[] = [
  {
    text: '$&',
    title: i18n('rulesEditReplacementMatched'),
    color: 'pink',
  },
  {
    text: '$1',
    title: i18n('rulesEditReplacementSub'),
    color: 'green',
  },
  {
    text: '$$',
    title: i18n('rulesEditReplacementSymbol'),
    color: 'red',
  },
];

const formRef = ref<FormInstance>();
const formState = reactive<RuleFormDataItem>(createEmptyRuleFormDataItem());
const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'confirm', rule: RuleBasicDataItem): void;
}>();

watch(
  () => props.visible,
  async newValue => {
    if (newValue) {
      Object.assign(formState, props.formData);
    }
  }
);

function onCancel() {
  emit('update:visible', false);
}

function getContainer() {
  return document.getElementById(props.container) || document.body;
}

function onTest() {
  formRef.value
    ?.validate()
    .then(() => {
      const { pattern, flags, replacement, test } = formState;
      const reg = new RegOperation(pattern, flags);
      const result = reg.replace(test, replacement);
      formState.testResult = result;
    })
    .catch(err => {
      console.error(err);
    });
}

function onConfirm() {
  formRef.value
    ?.validate()
    .then(() => {
      const { key, name, pattern, flags, replacement, index } = formState;
      const maxIndex = props.isEdit ? props.max : props.max + 1;
      let newIndex = index;
      if (index > maxIndex) {
        newIndex = maxIndex;
      } else if (index < 1) {
        newIndex = 1;
      }

      emit('confirm', {
        key,
        name: name.trim(),
        pattern,
        flags: toRaw(flags),
        replacement,
        index: newIndex,
      });
      emit('update:visible', false);
    })
    .catch(err => {
      console.error(err);
    });
}
</script>

<style lang="less">
.edit-modal {
  .checkbox-group {
    width: 100%;
  }
  .help-p,
  .test-result {
    margin-bottom: 0;
  }
}

.full-modal {
  .ant-modal-header {
    display: none;
  }
  .ant-modal-body {
    padding: 10px 16px 0px 16px;
  }
  .ant-modal {
    max-width: 100%;
    top: 0;
    padding-bottom: 0;
    margin: 0;
  }
  .ant-modal-content {
    display: flex;
    flex-direction: column;
    height: calc(100vh);
  }
  .ant-modal-body {
    flex: 1;
  }
  .ant-form .ant-form-item {
    .ant-form-item-label {
      flex: 0 0 20%;
    }
    .ant-form-item-control {
      flex: 0 0 80%;
    }
  }
}
</style>
