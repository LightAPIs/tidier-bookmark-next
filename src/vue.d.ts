import { ComponentCustomProperties } from 'vue';
import { i18n } from '@/common/ui';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $i18n: typeof i18n;
  }
}
