<template>
  <div id="about-view">
    <div class="about-header">
      <img src="@/img/icon-32.png" />
      {{ $i18n('extensionName') + ' v' + version }}
    </div>
    <div class="about-content">
      <a-divider orientation="left">
        {{ $i18n('aboutSupportDividerText') }}
      </a-divider>
      <div class="about-label">
        {{ $i18n('aboutSupportLabel') }}
      </div>
      <link-list :list="supports"></link-list>
      <a-divider orientation="left">
        {{ $i18n('aboutDependencyDividerText') }}
      </a-divider>
      <div class="about-label">
        {{ $i18n('aboutDependencyLabel') }}
      </div>
      <link-list :list="dependency"></link-list>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getVersion } from '@/common/operation';
import { i18n } from '@/common/ui';
import LinkList from '@/components/LinkList.vue';

const version = getVersion();

const supports: ListItem[] = [
  {
    title: i18n('aboutSourceCodeText'),
    url: 'https://github.com/LightAPIs/tidier-bookmark-next',
  },
  {
    title: i18n('aboutFeedbackText'),
    url: 'https://github.com/LightAPIs/tidier-bookmark-next/issues',
  },
  {
    title: i18n('aboutRegexText'),
    url: i18n('rulesEditRegexUrl'),
  },
];

const dependency: ListItem[] = [
  {
    title: 'ant-design/ant-design-icons (MIT License)',
    url: 'https://github.com/ant-design/ant-design-icons',
  },
  {
    title: 'brix/crypto-js (MIT License)',
    url: 'https://github.com/brix/crypto-js',
  },
  {
    title: 'jakearchibald/idb (ISC License)',
    url: 'https://github.com/jakearchibald/idb',
  },
  {
    title: 'vueComponent/ant-design-vue (MIT License)',
    url: 'https://github.com/vueComponent/ant-design-vue',
  },
  {
    title: 'vuejs/core (MIT License)',
    url: 'https://github.com/vuejs/core',
  },
  {
    title: 'vuejs/router (MIT License)',
    url: 'https://github.com/vuejs/router',
  },
];
</script>

<style lang="less">
#about-view {
  .about-header {
    text-align: center;
    font-size: 28px;
  }
  .about-label {
    margin-bottom: 25px;
  }
}
</style>
