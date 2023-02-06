import { isBookmark } from '@/common/operation';
import { FillDarkFavorites, DarkFavorites, FillLightFavorites, LightFavorites, AppIcon } from '@/common/icon';

interface ResultSymbolItem {
  isSymbol: boolean;
  text: string;
  title: string;
  color: string;
}

function i18n(messageName: string, substitutions?: string | string[]): string {
  return chrome.i18n.getMessage(messageName, substitutions);
}

/**
 * 为扩展程序图标添加徽章
 * @param useFavoritesIcon 是否使用收藏夹图标
 * @param darkMode 是否为夜间模式
 * @param tabId 标签页 id
 */
function addBadge(useFavoritesIcon: boolean, darkMode: boolean, tabId: number): void {
  if (useFavoritesIcon) {
    chrome.action.setTitle({
      title: i18n('bookmarkModifyTip'),
      tabId,
    });
    chrome.action.setBadgeText({
      text: '',
      tabId,
    });

    if (darkMode) {
      chrome.action.setIcon({
        path: FillDarkFavorites,
        tabId,
      });
    } else {
      chrome.action.setIcon({
        path: FillLightFavorites,
        tabId,
      });
    }
  } else {
    chrome.action.setTitle({
      title: i18n('bookmarkModifyTip'),
      tabId,
    });
    chrome.action.setBadgeText({
      text: '+',
      tabId,
    });
  }
}

/**
 * 移除扩展程序图标的徽章
 * @param useFavoritesIcon 是否使用收藏夹图标
 * @param darkMode 是否为夜间模式
 * @param tabId 标签页 id
 */
function removeBadge(useFavoritesIcon: boolean, darkMode: boolean, tabId: number): void {
  chrome.action.setTitle({
    title: i18n('bookmarkAddTip'),
    tabId,
  });
  chrome.action.setBadgeText({
    text: '',
    tabId,
  });

  if (useFavoritesIcon) {
    if (darkMode) {
      chrome.action.setIcon({
        path: DarkFavorites,
        tabId,
      });
    } else {
      chrome.action.setIcon({
        path: LightFavorites,
        tabId,
      });
    }
  }
}

/**
 * 还原为默认扩展程序图标
 * @param tabId 标签页 id
 */
function restoreIcon(tabId: number): void {
  chrome.action.setIcon({
    path: AppIcon,
    tabId,
  });
}

/**
 * 设置所有标签页扩展程序图标的徽章
 * @param useFavoritesIcon 是否使用收藏夹图标
 * @param darkMode 是否为夜间模式
 * @param bookmarkUrl 书签网址
 */
async function setTabsBadge(useFavoritesIcon: boolean, darkMode: boolean, bookmarkUrl?: string) {
  if (bookmarkUrl) {
    const tabs = await chrome.tabs.query({
      windowType: 'normal',
    });
    tabs.forEach(tab => {
      const { id, url } = tab;
      if (id !== undefined && bookmarkUrl === url) {
        addBadge(useFavoritesIcon, darkMode, id);
      }
    });
  }
}

/**
 * 移除所有标签页扩展程序图标的徽章
 * @param useFavoritesIcon 是否使用收藏夹图标
 * @param darkMode 是否为夜间模式
 * @param bookmarkUrl 书签网址
 */
async function removeTabsBadge(useFavoritesIcon: boolean, darkMode: boolean, bookmarkUrl?: string) {
  if (bookmarkUrl) {
    //? 处理存在重复的书签的情况
    const res = await chrome.bookmarks.search({
      url: bookmarkUrl,
    });
    if (res.length === 0) {
      const tabs = await chrome.tabs.query({
        windowType: 'normal',
      });
      tabs.forEach(tab => {
        const { id, url } = tab;
        if (id !== undefined && bookmarkUrl === url) {
          removeBadge(useFavoritesIcon, darkMode, id);
        }
      });
    }
  }
}

/**
 * 重置扩展程序图标状态
 * @param state 是否使用收藏夹图标
 * @param darkMode 夜间模式状态
 */
async function resetIconState(state: boolean, darkMode: boolean) {
  const tabs = await chrome.tabs.query({
    windowType: 'normal',
  });
  tabs.forEach(async tab => {
    const { id, url } = tab;
    if (id !== undefined) {
      const ib = await isBookmark(url);
      if (ib) {
        //* 是书签
        if (state) {
          addBadge(true, darkMode, id);
        } else {
          restoreIcon(id);
          addBadge(false, darkMode, id);
        }
      } else {
        if (state) {
          removeBadge(true, darkMode, id);
        } else {
          restoreIcon(id);
        }
      }
    }
  });
}

/**
 * 设置一次性扩展程序图标状态
 * * _用于更换图标或浏览器启动时_
 * @param state 是否使用收藏夹图标
 * @param darkMode 夜间模式状态
 */
async function setOnceIconState(state: boolean, darkMode: boolean) {
  if (state) {
    if (darkMode) {
      await chrome.action.setIcon({
        path: DarkFavorites,
      });
    } else {
      await chrome.action.setIcon({
        path: LightFavorites,
      });
    }
  } else {
    await chrome.action.setIcon({
      path: AppIcon,
    });
  }
}

/**
 * 注册右键菜单项
 */
function createContextMenu() {
  const menus = [
    {
      key: 'tidierCreateRule',
      title: 'contextMenusBrowserRulesTitle',
    },
  ];

  menus.forEach(menu => {
    const { key, title } = menu;
    chrome.contextMenus.create({
      id: key,
      type: 'normal',
      title: i18n(title),
      contexts: ['action'],
    });
  });
}

/**
 * 检索特殊符号
 * @param text 文本内容
 * @returns 标记对象
 */
function checkSymbols(text: string): ResultSymbolItem {
  if (text === '$$') {
    return {
      isSymbol: true,
      text,
      title: 'rulesEditReplacementSymbol',
      color: 'red',
    };
  } else if (text === '$&') {
    return {
      isSymbol: true,
      text,
      title: 'rulesEditReplacementMatched',
      color: 'pink',
    };
  }
  return {
    isSymbol: true,
    text,
    title: 'rulesEditReplacementSub',
    color: 'green',
  };
}

/**
 * 标记替换值特殊符号
 * @param text 文本内容
 * @returns 标记对象的数组
 */
function replacementSymbols(text: string): ResultSymbolItem[] {
  if (text) {
    const reg = new RegExp('\\$[$&\\d]', 'g');
    const items: ResultSymbolItem[] = [];
    let res,
      pos = 0;
    while ((res = reg.exec(text)) !== null) {
      if (pos !== res.index) {
        items.push({
          isSymbol: false,
          text: text.substring(pos, res.index),
          title: '',
          color: '',
        });
      }
      items.push(checkSymbols(res[0]));
      pos = reg.lastIndex;
    }

    const len = text.length;
    if (pos < len) {
      items.push({
        isSymbol: false,
        text: text.substring(pos, len),
        title: '',
        color: '',
      });
    }
    return items;
  }
  return [];
}

/**
 * 获取界面模式的类名
 * @param mode 模式值
 * @returns 类名
 */
function getSkinClass(mode?: number): string {
  switch (mode) {
    case 1:
      return 'dark';
    case -1:
      return 'light';
    case 0:
    default:
      return 'default';
  }
}

/**
 * 浏览器自身是否启用夜间模式方案
 * @returns `true` 表示启用
 */
function isDarkColorScheme(): boolean {
  return matchMedia('(prefers-color-scheme: dark)').matches;
}

export {
  i18n,
  addBadge,
  removeBadge,
  restoreIcon,
  setTabsBadge,
  removeTabsBadge,
  resetIconState,
  createContextMenu,
  replacementSymbols,
  getSkinClass,
  isDarkColorScheme,
  setOnceIconState,
};
