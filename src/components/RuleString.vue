<template>
  <div>
    <p>
      <b>{{ $i18n('rulesTableNameText') }}:&nbsp;</b>
      <span>{{ name }}</span>
    </p>
    <p>
      <b>{{ $i18n('optionsExportRulesValue') }}:&nbsp;</b>
      <span>/{{ pattern }}/{{ flags.join('') }}</span>
    </p>
    <p>
      <b>{{ $i18n('rulesTableReplacementText') }}:&nbsp;</b>
      <span>{{ replacement }}</span>
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  name: string;
  pattern: string;
  flags: FlagType[];
  replacement: string;
}>();
</script>
