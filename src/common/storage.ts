function defaultSettings(): StorageConfigInstance {
  return {
    darkMode: 0,
    useFavoritesIcon: false,
    bookmarkOnTop: false,
    folderOnTop: false,
    disableAutoAdd: false,
  };
}

/**
 * 获取是否使用收藏夹图标状态
 * @returns `true` 表示使用收藏夹图标
 */
async function getUseFavoritesIcon() {
  const items = await getSettings();
  const { useFavoritesIcon = false } = items;
  return useFavoritesIcon;
}

/**
 * 获取设定的界面模式
 * @returns 模式值
 */
async function getDarkMode() {
  const items = await getSettings();
  const { darkMode = 0 } = items;
  return darkMode;
}

/**
 * 获取设置的对象值
 * @returns 设置的对象值实例
 */
async function getSettings(): Promise<StorageConfigInstance> {
  const items = (await chrome.storage.local.get('settings').catch(() => {
    return {
      settings: defaultSettings(),
    };
  })) as StorageLocalItems;

  return Object.assign(defaultSettings(), items.settings);
}

/**
 * 保存通用设置
 * @param value 设置的对象值
 */
function saveSettings(value: StorageConfigInstance) {
  chrome.storage.local.set(
    {
      settings: value,
    },
    () => {
      console.info('The settings have been set.');
    }
  );
}

/**
 * 获取保存的规则
 * @returns 规则对象的数组
 */
async function getRules(): Promise<RuleDataItem[]> {
  const items = (await chrome.storage.local.get('rules').catch(() => {
    return {
      rules: [],
    };
  })) as StorageLocalItems;

  const { rules = [] } = items;
  return rules;
}

/**
 * 保存规则
 * @param value 规则对象的数组
 */
function saveRules(value: RuleDataItem[]) {
  chrome.storage.local.set(
    {
      rules: value,
    },
    () => {
      console.info('The rules have been set.');
    }
  );
}

/**
 * 保存存储对象
 * @param value 存储对象
 * @returns 是否保存了数据
 */
async function saveStorage(value: StorageLocalItems): Promise<boolean> {
  const { settings, rules } = value;
  const obj: StorageLocalItems = {};
  if (settings || rules) {
    if (settings) {
      Object.assign(obj, {
        settings,
      });
    }
    if (rules) {
      Object.assign(obj, {
        rules,
      });
    }
    await chrome.storage.local.set(obj);
    console.info('The settings and rules have been set.');
    return true;
  }
  return false;
}

/**
 * 获取存储对象
 * @param keys 键名列表
 * @returns
 */
async function getStorage(keys: StorageKey[]): Promise<StorageLocalItems> {
  const items = (await chrome.storage.local.get(keys).catch(() => {
    return {};
  })) as StorageLocalItems;
  return items;
}

export { getUseFavoritesIcon, getDarkMode, getSettings, saveSettings, getRules, saveRules, saveStorage, getStorage };
