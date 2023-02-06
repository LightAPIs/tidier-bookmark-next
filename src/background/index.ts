import { isDark } from '@/common/db';
import { getUseFavoritesIcon } from '@/common/storage';
import { setTabsBadge, removeTabsBadge, addBadge, removeBadge, resetIconState, createContextMenu, setOnceIconState } from '@/common/ui';
import { isBookmark } from '@/common/operation';

interface DarkMessage {
  type: 'dark';
  data: boolean;
}

function traverseNode(node: chrome.bookmarks.BookmarkTreeNode, useFavoritesIcon: boolean, darkMode: boolean) {
  const { url, children } = node;
  if (url !== undefined) {
    //* is a bookmark
    removeTabsBadge(useFavoritesIcon, darkMode, url);
  } else {
    //* maybe a folder
    if (children) {
      for (const child of children) {
        traverseNode(child, useFavoritesIcon, darkMode);
      }
    }
  }
}

chrome.bookmarks.onCreated.addListener(async (_id, bookmark) => {
  const useFavoritesIcon = await getUseFavoritesIcon();
  const darkMode = await isDark();
  setTabsBadge(useFavoritesIcon, darkMode, bookmark.url);
});

chrome.bookmarks.onRemoved.addListener(async (_id, removeInfo) => {
  const useFavoritesIcon = await getUseFavoritesIcon();
  const darkMode = await isDark();
  traverseNode(removeInfo.node, useFavoritesIcon, darkMode);
});

chrome.bookmarks.onChanged.addListener(async (_id, changeInfo) => {
  const useFavoritesIcon = await getUseFavoritesIcon();
  const darkMode = await isDark();
  setTabsBadge(useFavoritesIcon, darkMode, changeInfo.url);
  //! 注：无法获取到更改前的书签网址，所以需要侦听 tabs.onActivated 事件来处理旧书签网址

  //? 处理当前活动标签页，针对在本插件上更改书签网址后移除图标状态
  const tabs = await chrome.tabs.query({
    windowType: 'normal',
    active: true,
  });
  for (const tab of tabs) {
    const { id, url } = tab;
    if (id !== undefined) {
      const ib = await isBookmark(url);
      if (!ib) {
        removeBadge(useFavoritesIcon, darkMode, id);
      }
    }
  }
});

//! 主要处理更改书签网址后旧书签网址的情况
chrome.tabs.onActivated.addListener(async activeInfo => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  const { id, url, pendingUrl } = tab;
  const destUrl = url || pendingUrl;
  if (id !== undefined && destUrl) {
    const ib = await isBookmark(destUrl);
    if (!ib) {
      const useFavoritesIcon = await getUseFavoritesIcon();
      const darkMode = await isDark();
      removeBadge(useFavoritesIcon, darkMode, id);
    }
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  const { url, status } = changeInfo;
  //? 刷新页面时图标状态会被重置，且 `changeInfo` 中不会包含 url 信息，所以需要额外处理 'complete' 状态
  if (url || status === 'complete') {
    const destUrl = url || tab.url || tab.pendingUrl;
    const ib = await isBookmark(destUrl);
    const useFavoritesIcon = await getUseFavoritesIcon();
    const darkMode = await isDark();
    if (ib) {
      addBadge(useFavoritesIcon, darkMode, tabId);
    } else {
      removeBadge(useFavoritesIcon, darkMode, tabId);
    }
  }
});

chrome.commands.onCommand.addListener(cmd => {
  if (cmd === 'activate') {
    //! Chrome 99+
    chrome.action.openPopup();
  }
});

chrome.runtime.onInstalled.addListener(async details => {
  const { reason } = details;
  if (reason === 'install' || reason === 'update') {
    const useFavoritesIcon = await getUseFavoritesIcon();
    const darkMode = await isDark();
    resetIconState(useFavoritesIcon, darkMode);
    createContextMenu();
  }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'tidierCreateRule') {
    let url = './src/options/index.html#/rules?operation=add';
    if (tab && tab.title) {
      try {
        url += '&test=' + encodeURIComponent(tab.title);
      } catch {}
    }
    chrome.tabs.create({
      url,
    });
  }
});

//? 处理存储的图标夜间模式状态变化
chrome.runtime.onMessage.addListener((message: DarkMessage) => {
  const { type, data } = message;
  if (type === 'dark') {
    resetIconState(true, data);
  }
});

chrome.runtime.onStartup.addListener(async () => {
  //? 优化如果设置更换扩展程序图标时创建新标签页的显示效果
  const useFavoritesIcon = await getUseFavoritesIcon();
  if (useFavoritesIcon) {
    const darkMode = await isDark();
    await setOnceIconState(useFavoritesIcon, darkMode);
  }
});
