/// <reference types="vite/client" />

type ConfigKey = 'darkMode' | 'useFavoritesIcon' | 'bookmarkOnTop' | 'folderOnTop' | 'disableAutoAdd';
type StorageKey = 'settings' | 'rules';

interface StorageLocalItems {
  settings?: StorageConfig;
  rules?: RuleDataItem[];
}

interface StorageConfig {
  darkMode?: number;
  useFavoritesIcon?: boolean;
  bookmarkOnTop?: boolean;
  folderOnTop?: boolean;
  disableAutoAdd?: boolean;
}

interface StorageConfigInstance extends Record<ConfigKey, number | boolean> {
  darkMode: number;
  useFavoritesIcon: boolean;
  bookmarkOnTop: boolean;
  folderOnTop: boolean;
  disableAutoAdd: boolean;
}

interface SettingsListDataItem {
  key: ConfigKey;
  type: 'select' | 'switch';
  value: number | boolean;
  title: string;
  options?: {
    name: string;
    value: number;
  }[];
}

type FlagType = 'i' | 'g' | 'u';

interface RuleTagDataItem {
  index: number;
  name: string;
  flags: FlagType[];
  pattern: string;
  replacement: string;
}

interface RuleBasicDataItem extends RuleTagDataItem {
  key: number;
}

interface RuleDataItem extends RuleBasicDataItem {
  enable: boolean;
}

interface PopupRuleDataItem extends RuleTagDataItem {
  enable: boolean;
}

interface RuleFormDataItem extends RuleBasicDataItem {
  test: string;
  testResult: string;
}

interface ListItem {
  title: string;
  url: string;
}
