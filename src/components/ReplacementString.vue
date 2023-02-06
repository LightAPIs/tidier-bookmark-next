<template>
  <span class="replacement-string">
    <template v-if="htmlText.length > 0">
      <a-tag class="replacement-tag">
        <template v-for="({ isSymbol, title, color, text }, _index) in htmlText" :key="_index">
          <template v-if="isSymbol">
            <a-tooltip :title="$i18n(title)">
              <span :class="color" class="replacement-symbol">{{ text }}</span>
            </a-tooltip>
          </template>
          <template v-else>{{ text.replaceAll(' ', '&ensp;') }}</template>
        </template>
      </a-tag>
    </template>
    <template v-else
      ><span class="replacement-clear">{{ $i18n('rulesClear') }}</span></template
    >
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { replacementSymbols } from '@/common/ui';

const props = defineProps<{
  text: string;
}>();

const htmlText = computed(() => {
  return replacementSymbols(props.text);
});
</script>

<style lang="less">
.replacement-string {
  .replacement-tag {
    padding-left: 1px;
    padding-right: 1px;
    .replacement-symbol {
      &.red {
        color: red;
      }
      &.pink {
        color: pink;
      }
      &.green {
        color: green;
      }
    }
  }
  .replacement-clear {
    color: lightgray;
  }
}
</style>
