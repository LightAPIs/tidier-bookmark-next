<template>
  <a-space>
    <a-button type="link" :title="$i18n('optionsImportTip')" @click="onImport">{{ $i18n('optionsImportText') }}</a-button>
    <a-button type="link" @click="() => (visible = true)">{{ $i18n('optionsExportText') }}</a-button>
  </a-space>
  <a-modal
    v-model:visible="visible"
    :title="i18n('optionsExportText')"
    :ok-text="$i18n('bookmarkOkText')"
    :cancel-text="$i18n('bookmarkCancelText')"
    :get-container="getContainer"
    @ok="handleExport"
  >
    <div class="export-label">{{ $i18n('optionsExportLabel') }}</div>
    <a-checkbox-group v-model:value="selectedKeys">
      <a-checkbox value="settings">{{ $i18n('optionsExportSettingsValue') }}</a-checkbox>
      <br />
      <a-checkbox value="rules">{{ $i18n('optionsExportRulesValue') }}</a-checkbox>
    </a-checkbox-group>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, toRaw } from 'vue';
import { downloadTextFile, openTextFile } from '@/common/file';
import { message } from 'ant-design-vue';
import { i18n } from '@/common/ui';
import { decodeContent, encodeObj } from '@/common/file';
import { saveStorage, getStorage } from '@/common/storage';

const props = defineProps<{
  container: string;
}>();

const visible = ref(false);
const selectedKeys = ref(['settings', 'rules'] as StorageKey[]);

function getContainer() {
  return document.getElementById(props.container) || document.body;
}

function onImport() {
  openTextFile(async (flag, content) => {
    if (flag.state) {
      if (content) {
        const obj = decodeContent(content);
        if (obj === undefined) {
          message.error(i18n('optionsImportErrorObjectText'));
        } else {
          const s = await saveStorage(obj);
          if (s) {
            //! 刷新网页
            location.reload();
          }
        }
      } else {
        message.warn(i18n('optionsImportEmptyText'));
      }
    } else {
      message.warn(i18n(flag.tip));
    }
  });
}

async function handleExport() {
  const res = await getStorage(toRaw(selectedKeys.value));
  const content = encodeObj(res);
  downloadTextFile(content, `config_${Date.now().toString()}.txt`, () => {
    message.success(i18n('optionsExportSuccess'));
    visible.value = false;
  });
}
</script>

<style>
.export-label {
  margin-bottom: 10px;
}
</style>
