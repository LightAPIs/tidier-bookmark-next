<template>
  <a-timeline>
    <a-timeline-item v-for="({ title, url }, index) in list" :key="index">
      <template #dot>
        <github-outlined></github-outlined>
      </template>
      <a :href="url" target="_blank">{{ title }}</a>
    </a-timeline-item>
  </a-timeline>
</template>

<script setup lang="ts">
import { GithubOutlined } from '@ant-design/icons-vue';

defineProps<{
  list: ListItem[];
}>();
</script>
