<template>
  <div id="popup-app" class="container" :class="skinClass">
    <a-space direction="vertical" style="width: 100%">
      <h1 class="heading">{{ heading }}</h1>
      <a-row type="flex" align="middle" :wrap="false">
        <a-col flex="80px" class="label">{{ $i18n('bookmarkOriginalNameLabel') }}</a-col>
        <a-col :flex="21" class="original-title" :title="originalName">{{ originalName }}</a-col>
        <a-col flex="0 0 auto" class="top-button">
          <a-button :title="$i18n('bookmarkRenameTip')" @click="onRename">{{ $i18n('bookmarkRenameText') }}</a-button>
        </a-col>
      </a-row>
      <a-row type="flex" align="middle">
        <a-col flex="80px" class="label">{{ $i18n('bookmarkNameLabel') }}</a-col>
        <a-col :flex="21">
          <a-input :placeholder="$i18n('bookmarkTitlePlaceholder')" v-model:value="name" autocomplete="off" />
        </a-col>
        <a-col flex="0 4 auto" class="top-button">
          <a-button :title="$i18n('bookmarkRestoreNameTip')" @click="restoreName">{{ $i18n('bookmarkRestoreText') }}</a-button>
        </a-col>
      </a-row>
      <a-row type="flex" align="middle">
        <a-col flex="80px" class="label">{{ $i18n('bookmarkUrlLabel') }}</a-col>
        <a-col :flex="21">
          <a-input :placeholder="$i18n('bookmarkUrlPlaceholder')" v-model:value="url" autocomplete="off" />
        </a-col>
        <a-col flex="0 4 auto" class="top-button">
          <a-button :title="$i18n('bookmarkRestoreUrlTip')" @click="restoreUrl">{{ $i18n('bookmarkRestoreText') }}</a-button>
        </a-col>
      </a-row>
      <a-row type="flex" class="tree-select-row" align="middle" :wrap="false">
        <a-col flex="80px" class="label">{{ $i18n('bookmarkFolderLabel') }}</a-col>
        <a-col flex="auto" class="tree-select-col">
          <a-tree-select
            v-model:value="folderId"
            :tree-data="treeData"
            :tree-default-expanded-keys="defaultExpandedKeys"
            tree-node-filter-prop="title"
            :dropdown-match-select-width="false"
            dropdown-class-name="bookmarks-folder-select-tree"
            :dropdown-style="{ maxHeight: '150px', width: '82%', padding: '0 0', overflow: 'auto' }"
            :list-height="150"
            style="width: 100%"
            :get-popup-container="getTreeContainer"
            show-search
          >
          </a-tree-select>
        </a-col>
      </a-row>
      <a-divider>{{ $i18n('rulesTestMatchLabel') }}</a-divider>
      <a-row type="flex" class="tags-row" align="middle">
        <a-col flex="auto" class="tags-col">
          <div class="tags">
            <template v-for="{ enable, name, pattern, flags, replacement, index } in tags" :key="index">
              <a-tooltip placement="topLeft">
                <template #title>
                  <rule-string :name="name" :pattern="pattern" :flags="flags" :replacement="replacement"></rule-string>
                </template>
                <a-tag :key="index" class="tag" :color="enable ? 'blue' : '#dedede'" @click="onTagClick(index)">{{ index }}</a-tag>
              </a-tooltip>
            </template>
          </div>
        </a-col>
      </a-row>
      <a-row class="footer">
        <a-col :span="6" class="center-button">
          <a-button @click="newFolderClick">{{ $i18n('bookmarkNewFolderText') }}</a-button>
        </a-col>
        <a-col :span="4" class="center-button">
          <a-button @click="newRuleClick">{{ $i18n('rulesEditModalAddTitle') }}</a-button>
        </a-col>
        <a-col :span="4" :offset="6" class="center-button">
          <a-button type="primary" @click="saveBookmark">{{ $i18n('bookmarkSaveText') }}</a-button>
        </a-col>
        <a-col :span="4" class="center-button">
          <a-button type="danger" @click="deleteBookmark">{{ $i18n('bookmarkRemoveText') }}</a-button>
        </a-col>
      </a-row>
    </a-space>
    <folder-modal v-model:visible="folderVisible" container="popup-app" @folder="onNewFolder"></folder-modal>
    <edit-modal
      v-model:visible="ruleVisible"
      :is-popup="true"
      :is-edit="false"
      container="popup-app"
      :max="count"
      :form-data="ruleFormData"
      @confirm="onRuleConfirm"
    ></edit-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, toRaw, computed, onBeforeMount } from 'vue';
import type { Ref } from 'vue';
import { message } from 'ant-design-vue';
import { i18n, getSkinClass, isDarkColorScheme } from '@/common/ui';
import { getStorage, saveRules } from '@/common/storage';
import { createEmptyRuleFormDataItem } from '@/common/data';
import { isDark, setDark } from '@/common/db';
import {
  RegOperation,
  FoldersTree,
  getCurrentTabInfo,
  getBookmarkInfo,
  sortRules,
  getRecentBookmarkFolderId,
  addNewBookmark,
  updateBookmark,
  moveBookmark,
  removeBookmark,
  createFolder,
  sendDarkMessage,
} from '@/common/operation';
import type { FolderDataNode } from '@/common/operation';
import RuleString from '@/components/RuleString.vue';
import FolderModal from '@/components/FolderModal.vue';
import EditModal from '@/components/EditModal.vue';

const foldersTree = new FoldersTree();
/** 是否处理过规则 */
let isHandleRules = false;

const existed = ref(false);
const originalName = ref('');
const originalUrl = ref('');
const name = ref('');
const url = ref('');
const id = ref('');
const folderId = ref('1');
const folderVisible = ref(false);
const ruleVisible = ref(false);
const config: StorageConfig = reactive({});
const treeData: Ref<FolderDataNode[]> = ref([]);
const rules: RuleDataItem[] = reactive([]);
const tags: Ref<PopupRuleDataItem[]> = ref([]);
const defaultExpandedKeys = reactive([folderId.value]);
const ruleFormData: RuleFormDataItem = reactive(createEmptyRuleFormDataItem());

const skinClass = computed(() => {
  const { darkMode } = config;
  return getSkinClass(darkMode);
});

const heading = computed(() => {
  if (existed.value) {
    return i18n('bookmarkModifyTitle');
  } else {
    return config.disableAutoAdd ? i18n('bookmarkAddingTitle') : i18n('bookmarkAddedTitle');
  }
});

const count = computed(() => rules.length);

/**
 * 书签的添加状态
 * - `true` 表示书签之前已存在，或者是本次已自动添加
 * - `false` 表示书签之前不存在，并且本次还没有自动添加
 */
const bookmarkState = () => {
  return existed.value || !config.disableAutoAdd;
};

function onRename() {
  if (isHandleRules) {
    let result = originalName.value;
    tags.value.forEach(item => {
      const { enable, pattern, flags, replacement } = item;
      if (enable) {
        const reg = new RegOperation(pattern, flags);
        if (reg.test(result)) {
          result = reg.replace(result, replacement);
        }
      }
    });

    name.value = result;
  } else {
    name.value = handleOnceRules(originalName.value);
  }
}

function changeRuleFormData(value: RuleFormDataItem) {
  Object.assign(ruleFormData, value);
}

function restoreName() {
  name.value = originalName.value;
}

function restoreUrl() {
  url.value = originalUrl.value;
}

function getTreeContainer() {
  return document.getElementById('popup-app') || document.body;
}

function newFolderClick() {
  folderVisible.value = true;
}

function handleExpandedKeys(fId?: string) {
  if (fId && !defaultExpandedKeys.includes(fId)) {
    defaultExpandedKeys.push(fId);
  }
}

/**
 * 新建文件夹
 * @param value 文件夹名称
 */
async function onNewFolder(value: string) {
  const newFolder = await createFolder({
    parentId: folderId.value,
    title: value,
    index: config.folderOnTop ? 0 : undefined,
  });
  if (newFolder) {
    // 更新文件夹树
    treeData.value = await foldersTree.getData();
    if (bookmarkState()) {
      const mb = await moveBookmark(id.value, newFolder.id);
      if (mb) {
        folderId.value = newFolder.id;
        handleExpandedKeys(newFolder.parentId);
        successMessage('bookmarkSuccessMoveToNewFolderText');
      } else {
        errorMessage('bookmarkErrorMoveToNewFolderText');
      }
    } else {
      folderId.value = newFolder.id;
      handleExpandedKeys(newFolder.parentId);
      successMessage('bookmarkSuccessCreateFolderText');
    }
  } else {
    // 无法新建文件夹
    errorMessage('bookmarkErrorCreateFolderText');
  }
}

/**
 * 保存书签
 */
async function saveBookmark() {
  if (bookmarkState()) {
    // 先更新名称和网址
    const nb = await updateBookmark(id.value, name.value, url.value || originalUrl.value);
    if (nb) {
      // 后移动书签位置
      const mb = await moveBookmark(nb.id, folderId.value, config.bookmarkOnTop ? 0 : undefined);
      if (mb) {
        // 关闭窗口
        window.close();
      } else {
        // 无法移动书签
        errorMessage('bookmarkErrorMoveText');
      }
    } else {
      // 无法更新书签
      errorMessage('bookmarkErrorUpdateText');
    }
  } else {
    //* 书签之前不存在，并且本次还没有自动添加
    const ab = await addNewBookmark({
      parentId: folderId.value,
      title: name.value,
      url: url.value || originalUrl.value,
      index: config.bookmarkOnTop ? 0 : undefined,
    });
    if (ab) {
      // 关闭窗口
      window.close();
    } else {
      // 无法添加书签
      errorMessage('bookmarkErrorCreateText');
    }
  }
}

/**
 * 移除书签
 */
function deleteBookmark() {
  removeBookmark(id.value);
  window.close();
}

function onTagClick(index: number) {
  for (const tag of tags.value) {
    if (tag.index === index) {
      tag.enable = !tag.enable;
      break;
    }
  }
  onRename();
}

function newRuleClick() {
  const index = count.value + 1;
  changeRuleFormData({
    key: Date.now(),
    flags: [],
    index,
    name: i18n('rulesHandleDefaultNameText', index.toString()),
    pattern: '',
    replacement: '',
    test: '',
    testResult: '',
  });
  ruleVisible.value = true;
}

/**
 * 添加新的规则
 * @param ruleItem 规则对象
 */
function onRuleConfirm(ruleItem: RuleBasicDataItem) {
  const { index: newIndex } = ruleItem;
  const indexMax = count.value + 1;
  if (newIndex !== indexMax) {
    rules.forEach(item => {
      if (item.index >= newIndex) {
        //? 将 >= newIndex 的项的 index 值后移，即相当于将新项插入该位置
        item.index++;
      }
    });
  }
  rules.push(
    Object.assign(ruleItem, {
      enable: true,
    })
  );
  // 存储规则
  saveRules(toRaw(rules));
  // 重命名
  name.value = handleOnceRules(originalName.value);
}

function errorMessage(key: string) {
  message.error(i18n(key), 2);
}

function successMessage(key: string) {
  message.success(i18n(key), 2);
}

/**
 * 根据规则重命名书签名称
 * @param readName 原名称
 * @returns 新的名称
 */
function handleOnceRules(readName: string) {
  let resultName = readName;
  tags.value = [];
  const tempData = toRaw(rules);
  sortRules(tempData);
  tempData.forEach(rule => {
    const { enable, name: ruleName, pattern, flags, replacement, index } = rule;
    if (enable) {
      const reg = new RegOperation(pattern, flags);
      if (reg.test(resultName)) {
        tags.value.push({
          enable,
          name: ruleName,
          index,
          pattern,
          flags,
          replacement,
        });
        resultName = reg.replace(resultName, replacement);
      }
    }
  });
  isHandleRules = true;
  return resultName;
}

onBeforeMount(async () => {
  treeData.value = await foldersTree.getData();
  const { settings, rules: readRules } = await getStorage(['settings', 'rules']);
  Object.assign(config, settings);
  Object.assign(rules, readRules);

  const { name: readName, url: readUrl } = await getCurrentTabInfo();
  originalUrl.value = readUrl;
  url.value = readUrl;
  originalName.value = readName;

  const bookmarkInfo = await getBookmarkInfo(readUrl);
  if (bookmarkInfo) {
    //* 编辑书签
    existed.value = true;
    const { id: readId, title, parentId = '1' } = bookmarkInfo;
    id.value = readId;
    name.value = title;
    folderId.value = parentId;
    handleExpandedKeys(folderId.value);
  } else {
    //* 添加书签
    existed.value = false;

    // 自动根据规则重命名书签名称
    name.value = handleOnceRules(originalName.value);

    // 查找最近添加的书签
    folderId.value = await getRecentBookmarkFolderId();
    handleExpandedKeys(folderId.value);

    // 默认情况下会直接添加书签
    if (!config.disableAutoAdd) {
      id.value = await addNewBookmark({
        parentId: folderId.value,
        title: name.value,
        url: url.value,
        index: config.bookmarkOnTop ? 0 : undefined,
      });
    }
  }

  //! 处理插件图标的夜间模式
  if (config.useFavoritesIcon) {
    isDark().then(dark => {
      const colorScheme = isDarkColorScheme();
      if (dark !== colorScheme) {
        setDark(colorScheme);
        sendDarkMessage(colorScheme);
      }
    });
  }
});
</script>

<style lang="less">
html {
  overflow: hidden;
  width: 500px;
  height: 365px;
}
#popup-app {
  height: 100%;
  overflow: hidden;
  .heading {
    font-size: 1.2rem;
    font-weight: bold;
    padding: 5px 0px 0px 10px;
  }
  .label {
    padding-left: 15px;
  }
  .original-title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .tree-select-row {
    .tree-select-col {
      max-width: 83%;
    }
  }
  .top-button {
    margin: 0px 5px;
  }
  .center-button {
    text-align: center;
  }
  .tags-row {
    padding: 0 24px;
    .tags-col {
      height: 32px;
      display: flex;
      align-items: center;
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
        .tag {
          cursor: pointer;
          user-select: none;
        }
      }
    }
  }
  .footer {
    margin-top: 5px;
  }
}

.dark() {
  background-color: @general-background-color-dark;
  .heading {
    color: @logo-text-color-dark;
  }
  .original-title {
    color: @select-selection-color-dark;
  }
  .ant-dark();
}

#popup-app.dark {
  .dark();
}

@media (prefers-color-scheme: dark) {
  #popup-app.default {
    .dark();
  }
}
</style>
