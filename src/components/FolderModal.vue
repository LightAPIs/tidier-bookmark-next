<template>
  <a-modal
    :visible="visible"
    :title="$i18n('bookmarkNewFolderText')"
    :ok-text="$i18n('bookmarkOkText')"
    :cancel-text="$i18n('bookmarkCancelText')"
    :get-container="getContainer"
    @ok="onNewFolder"
    @cancel="onCancel"
  >
    <a-input v-focus="visible" :placeholder="$i18n('bookmarkFolderPlaceholder')" v-model:value="name" @pressEnter="() => onNewFolder()" autocomplete="off" />
  </a-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { DirectiveBinding } from 'vue';
import { i18n } from '@/common/ui';

const emit = defineEmits<{
  (e: 'folder', value: string): void;
  (e: 'update:visible', value: boolean): void;
}>();

const props = defineProps<{
  container: string;
  visible: boolean;
}>();

const name = ref(i18n('bookmarkNewFolderText'));

/**
 * v-focus
 */
const vFocus = {
  mounted: handleFocus,
  updated: handleFocus,
};

function handleFocus(el: HTMLInputElement, binding: DirectiveBinding<boolean>) {
  if (binding.value && binding.value !== binding.oldValue) {
    setTimeout(() => {
      try {
        el.focus();
        el.select();
      } catch (err) {
        console.log(err);
      }
    }, 100);
  }
}

watch(
  () => props.visible,
  async newValue => {
    if (newValue) {
      name.value = i18n('bookmarkNewFolderText');
    }
  }
);

function getContainer() {
  return document.getElementById(props.container) || document.body;
}

function onNewFolder() {
  emit('folder', name.value || i18n('bookmarkNewFolderText'));
  emit('update:visible', false);
}

function onCancel() {
  emit('update:visible', false);
}
</script>
