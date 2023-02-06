<template>
  <div id="options-app" class="skin" :class="skinClass">
    <a-layout>
      <a-layout-sider v-model:collapsed="collapsed" :trigger="null" collapsible class="layout-height">
        <div class="logo">
          <img src="@/img/icon-24.png" />
          {{ collapsed ? '' : $i18n('extensionName') }}
        </div>
        <a-menu theme="dark" mode="inline" v-model:selectedKeys="selectedKeys" @click="menuClick">
          <a-menu-item key="1">
            <router-link to="/settings">
              <setting-outlined></setting-outlined>
              <span>&nbsp;{{ $i18n('optionsGeneralSettingsText') }}</span>
            </router-link>
          </a-menu-item>
          <a-menu-item key="2">
            <router-link to="/rules">
              <ordered-list-outlined></ordered-list-outlined>
              <span>&nbsp;{{ $i18n('optionsRuleListText') }}</span>
            </router-link>
          </a-menu-item>
          <a-menu-item key="3">
            <router-link to="/batch">
              <file-search-outlined></file-search-outlined>
              <span>&nbsp;{{ $i18n('optionsBatchOperationText') }}</span>
            </router-link>
          </a-menu-item>
          <a-menu-item key="4">
            <router-link to="/about">
              <info-circle-outlined></info-circle-outlined>
              <span>&nbsp;{{ $i18n('optionsAboutText') }}</span>
            </router-link>
          </a-menu-item>
        </a-menu>
      </a-layout-sider>
      <a-layout class="layout-height layout-overflow">
        <a-layout-header class="header">
          <menu-unfold-outlined v-if="collapsed" class="trigger" @click="triggerClick"></menu-unfold-outlined>
          <menu-fold-outlined v-else class="trigger" @click="triggerClick"></menu-fold-outlined>
          <data-management container="options-app"></data-management>
        </a-layout-header>
        <a-layout-content class="content">
          <router-view></router-view>
        </a-layout-content>
      </a-layout>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onBeforeMount } from 'vue';
import type { Ref } from 'vue';
import { getDarkMode } from '@/common/storage';
import { MenuFoldOutlined, MenuUnfoldOutlined, SettingOutlined, OrderedListOutlined, FileSearchOutlined, InfoCircleOutlined } from '@ant-design/icons-vue';
import type { MenuProps } from 'ant-design-vue';
import DataManagement from '@/components/DataManagement.vue';
import { getSkinClass } from '@/common/ui';

type MenuKey = '1' | '2' | '3' | '4';

const collapsed = ref(false);
const selectedKeys: Ref<MenuKey[]> = ref([]);
const config: StorageConfig = reactive({});

/**
 * 界面模式样式类名
 */
const skinClass = computed(() => {
  const { darkMode } = config;
  return getSkinClass(darkMode);
});

//? 处理直接通过网址打开页面时菜单项的高亮项目
const { hash } = location;
if (hash.includes('#/rules')) {
  selectedKeys.value.push('2');
} else if (hash.includes('#/batch')) {
  selectedKeys.value.push('3');
} else if (hash.includes('#/about')) {
  selectedKeys.value.push('4');
} else {
  selectedKeys.value.push('1');
}

function triggerClick() {
  collapsed.value = !collapsed.value;
}

function menuClick(item: MenuProps) {
  const { activeKey } = item;
  if (activeKey && !selectedKeys.value.includes(activeKey as MenuKey)) {
    selectedKeys.value.splice(0, selectedKeys.value.length);
    selectedKeys.value.push(activeKey as MenuKey);
  }
}

onBeforeMount(async () => {
  const value = await getDarkMode();
  config.darkMode = value;
});
</script>

<style lang="less">
#options-app {
  .layout-height {
    height: 100vh;
  }
  .layout-overflow {
    overflow: hidden;
  }
  .trigger {
    font-size: 18px;
    line-height: 64px;
    padding: 0 24px;
    cursor: pointer;
    transition: color 0.3s;
  }
  .file {
    float: right;
    a {
      margin: 0px 20px;
      user-select: none;
    }
  }
  .header {
    padding: 0px;
    background-color: @header-background-color;
  }
  .content {
    margin: 24px 16px;
    padding: 24px;
    min-height: 280px;
    background-color: @content-background-color;
    overflow: auto;
  }
  .logo {
    height: 32px;
    line-height: 32px;
    font-size: 16px;
    color: @logo-text-color;
    text-align: center;
    background-color: @logo-background-color;
    margin: 16px;
  }
  .export-label {
    margin-bottom: 10px;
  }
  #batch-component {
    .top-button-group {
      background-color: @general-background-color;
      width: 100%;
      padding: 10px;
    }
  }
}

.dark() {
  .header {
    background-color: @header-background-color-dark;
    svg {
      color: @logo-text-color-dark;
    }
  }
  .content {
    background-color: @content-background-color-dark;
  }
  .layout-overflow {
    background-color: @layout-background-color-dark;
  }
  .logo {
    color: @logo-text-color-dark;
    background-color: @logo-background-color-dark;
  }
  #batch-component {
    .top-button-group {
      background-color: @content-background-color-dark;
    }
  }
  .about-header,
  .about-label {
    color: @logo-text-color-dark;
  }

  .ant-dark();
}

#options-app.dark {
  .dark();
}

@media (prefers-color-scheme: dark) {
  #options-app.default {
    .dark();
  }
}
</style>
