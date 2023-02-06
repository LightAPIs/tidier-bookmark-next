<template>
  <a-list item-layout="horizontal" :data-source="data">
    <template #header>
      <h3>{{ title }}</h3>
    </template>
    <template #renderItem="{ item }">
      <a-list-item>
        <div v-if="(item as SettingsListDataItem).type === 'select'" class="align-items-center">
          <span class="label">{{ (item as SettingsListDataItem).title }}</span>
          <a-select
            :value="(item as SettingsListDataItem).value"
            class="select"
            @change="onSelectChange((item as SettingsListDataItem).key, $event)"
            :get-popup-container="getComponent"
          >
            <a-select-option v-for="{name, value} in (item as SettingsListDataItem).options" :key="value" :value="value">{{ name }}</a-select-option>
          </a-select>
        </div>
        <div v-else class="align-items-center">
          <a-switch :checked="(item as SettingsListDataItem).value" @change="onSwitchChange((item as SettingsListDataItem).key, $event)" />
          <span class="item-text">{{ (item as SettingsListDataItem).title }}</span>
        </div>
      </a-list-item>
    </template>
  </a-list>
</template>

<script setup lang="ts">
const props = defineProps<{
  data: SettingsListDataItem[];
  title: string;
  containerId: string;
}>();

const emit = defineEmits<{
  (e: 'switch', id: ConfigKey, checked: boolean): void;
  (e: 'select', id: ConfigKey, value: number): void;
}>();

function getComponent() {
  return document.getElementById(props.containerId) || document.body;
}

function onSwitchChange(id: ConfigKey, checked: boolean) {
  emit('switch', id, checked);
}

function onSelectChange(id: ConfigKey, value: number) {
  emit('select', id, value);
}
</script>
