<template>
  <div id="batch-component">
    <a-affix :offset-top="0" :target="affixTarget">
      <a-space class="top-button-group">
        <a-button @click="onPreview(true)">{{ $i18n('batchPreviewText') }}</a-button>
        <a-button type="primary" v-show="effectVisible" :disabled="checkedKeys.length === 0" @click="onEffect">{{ $i18n('batchEffectText') }}</a-button>
      </a-space>
    </a-affix>
    <a-tree
      v-if="effectVisible"
      v-model:expanded-keys="expandedKeys"
      v-model:checked-keys="checkedKeys"
      :tree-data="treeData"
      :show-line="{ showLeafIcon: false }"
      checkable
      :selectable="false"
    >
      <template #title="{ title, newTitle, url, matchIndex, isFolder }">
        <span v-if="isFolder">{{ title }}</span>
        <a-tooltip v-else placement="topLeft" class="replace-title" overlay-class-name="tips">
          <template #title>
            <p>{{ $i18n('bookmarkUrlLabel', ': ') + url }}</p>
            <p>{{ $i18n('bookmarkOriginalNameLabel', ': ') + title }}</p>
            <p>{{ $i18n('batchNewNameLabel', ': ') + newTitle }}</p>
            <p>{{ $i18n('rulesTestMatchLabel', ': ') + matchIndex.join(' ') }}</p>
          </template>
          <a-space>
            <span>{{ title }}</span>
            <b class="arrow">==></b>
            <span>{{ newTitle }}</span>
          </a-space>
        </a-tooltip>
      </template>
    </a-tree>
  </div>
</template>

<script setup lang="ts">
import { ref, h, toRaw } from 'vue';
import type { Ref } from 'vue';
import { message, notification } from 'ant-design-vue';
import { getRules } from '@/common/storage';
import { BookmarksTree } from '@/common/operation';
import type { BookmarkDataNode } from '@/common/operation';
import { i18n } from '@/common/ui';

const undoNotifyKey = 'tidier-undo';

const effectVisible = ref(false);
const expandedKeys = ref<string[]>([]);
const checkedKeys = ref<string[]>([]);
const treeData: Ref<BookmarkDataNode[]> = ref([]);

const bookmarksTree = new BookmarksTree();

function affixTarget() {
  return document.querySelector('.content') || document.body;
}

async function onPreview(initiative = false) {
  checkedKeys.value = [];
  expandedKeys.value = [];
  const rules = await getRules();
  bookmarksTree.setRules(rules);
  treeData.value = await bookmarksTree.getData();
  if (treeData.value.length > 0) {
    //? 展开顶层文件夹
    expandedKeys.value = treeData.value.map(item => item.key);
    effectVisible.value = true;
  } else {
    effectVisible.value = false;
    initiative && message.info(i18n('batchNoMatching'));
  }
}

function onEffect() {
  bookmarksTree.changeBookmarks(toRaw(checkedKeys.value));
  notification.close(undoNotifyKey);
  setTimeout(() => {
    notification.success({
      key: undoNotifyKey,
      placement: 'topRight',
      duration: 5,
      getContainer: () => document.getElementById('options-app') || document.body,
      message: () =>
        h('div', [
          i18n('batchCompletionText'),
          h('a', {
            class: 'undo',
            textContent: i18n('batchUndoText'),
            onClick: (e: Event) => {
              e.stopPropagation();
              onUndo();
            },
          }),
        ]),
    });
  }, 100);

  onPreview();
}

async function onUndo() {
  notification.close(undoNotifyKey);
  await bookmarksTree.undo();
  bookmarksTree.clearOldData();
  onPreview();
}
</script>

<style lang="less">
#batch-component {
  .top-button-group {
    background-color: @general-background-color;
    width: 100%;
    padding: 10px;
  }
}
.replace-title {
  width: 100%;
  overflow: hidden;
}
.arrow {
  color: @arrow-color;
}
.tips {
  word-break: break-all;
}
.undo {
  margin-left: 15px;
}
</style>
