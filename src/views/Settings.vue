<template>
  <div id="settings-component">
    <settings-list :data="bookmarkData" :title="$i18n('settingsBookmarkLabel')" container-id="settings-component" @switch="onSwitch"></settings-list>
    <settings-list :data="skinData" :title="$i18n('settingsSkinLabel')" container-id="settings-component" @switch="onSwitch" @select="onSelect"></settings-list>
    <a-list item-layout="horizontal">
      <template #header>
        <h3>{{ $i18n('settingsShortcutsLabel') }}</h3>
      </template>
      <a-list-item>
        <a-list-item-meta :description="$i18n('settingsShortcutsDescription')">
          <template #title>
            <span>{{ $i18n('settingsShortcutsGoText') }}&nbsp;</span>
            <a class="shortcuts" target="_blank" @click="onShortcuts">{{ $i18n('settingsShortcutsPageText') }}</a>
          </template>
        </a-list-item-meta>
      </a-list-item>
    </a-list>
  </div>
</template>

<script setup lang="ts">
import { reactive, onBeforeMount } from 'vue';
import { i18n, resetIconState, getSkinClass, setOnceIconState } from '@/common/ui';
import { isDark } from '@/common/db';
import { getSettings, saveSettings } from '@/common/storage';
import SettingsList from '@/components/SettingsList.vue';

const bookmarkData: SettingsListDataItem[] = reactive([
  {
    key: 'bookmarkOnTop',
    type: 'switch',
    value: false,
    title: i18n('settingsBookmarkOnTopText'),
  },
  {
    key: 'folderOnTop',
    type: 'switch',
    value: false,
    title: i18n('settingsFolderOnTopText'),
  },
  {
    key: 'disableAutoAdd',
    type: 'switch',
    value: false,
    title: i18n('settingsDisableAutoAddText'),
  },
]);

const skinData: SettingsListDataItem[] = reactive([
  {
    key: 'darkMode',
    type: 'select',
    value: 0,
    title: i18n('settingsDarkModeText', ':'),
    options: [
      {
        name: i18n('settingsDarkModeOptionsDefault'),
        value: 0,
      },
      {
        name: i18n('settingsDarkModeOptionsEnabled'),
        value: 1,
      },
      {
        name: i18n('settingsDarkModeOptionsDisabled'),
        value: -1,
      },
    ],
  },
  {
    key: 'useFavoritesIcon',
    type: 'switch',
    value: false,
    title: i18n('settingsUseFavoritesIconText'),
  },
]);

/**
 * 设置存储值
 */
function save() {
  const config: StorageConfig = {};
  bookmarkData.forEach(data => {
    const { key, value } = data;
    (config[key] as boolean | number) = value;
  });
  skinData.forEach(data => {
    const { key, value } = data;
    (config[key] as boolean | number) = value;
  });

  saveSettings(config as StorageConfigInstance);
}

async function onSwitch(id: ConfigKey, checked: boolean) {
  let state = false;
  bookmarkData.forEach(data => {
    if (data.key === id && data.value !== checked) {
      data.value = checked;
      state = true;
    }
  });
  skinData.forEach(data => {
    if (data.key === id && data.value !== checked) {
      data.value = checked;
      state = true;
    }
  });

  state && save();

  //? 修改图标
  if (id === 'useFavoritesIcon') {
    const darkMode = await isDark();
    setOnceIconState(checked, darkMode).then(() => {
      resetIconState(checked, darkMode);
    });
  }
}

function onSelect(id: ConfigKey, value: number) {
  let state = false;
  skinData.forEach(data => {
    if (data.key === id && data.value !== value) {
      data.value = value;
      state = true;
    }
  });

  if (state) {
    save();

    if (id === 'darkMode') {
      const skin = document.querySelector('.skin');
      const newClassName = getSkinClass(value);
      skin?.classList.remove('default', 'light', 'dark');
      skin?.classList.add(newClassName);
    }
  }
}

function onShortcuts(e: Event) {
  e.stopPropagation();
  chrome.tabs.create({
    url: 'chrome://extensions/shortcuts#:~:text=Tidier%20bookmark',
  });
}

onBeforeMount(() => {
  //* 异步加载
  getSettings().then(items => {
    const { bookmarkOnTop, folderOnTop, darkMode, useFavoritesIcon, disableAutoAdd } = items;
    bookmarkData.forEach(data => {
      if (data.key === 'bookmarkOnTop') {
        data.value = bookmarkOnTop;
      } else if (data.key === 'folderOnTop') {
        data.value = folderOnTop;
      } else if (data.key === 'disableAutoAdd') {
        data.value = disableAutoAdd;
      }
    });
    skinData.forEach(data => {
      if (data.key === 'darkMode') {
        data.value = darkMode;
      } else if (data.key === 'useFavoritesIcon') {
        data.value = useFavoritesIcon;
      }
    });
  });
});
</script>

<style lang="less">
#settings-component {
  .align-items-center {
    display: flex;
    align-items: center;
    .item-text {
      margin-left: 15px;
    }
  }
  .select {
    width: 120px;
  }
  .label {
    margin-right: 15px;
  }
  .shortcuts {
    color: @link-color;
  }
}
</style>
