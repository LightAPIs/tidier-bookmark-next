import type { DataNode } from 'ant-design-vue/es/tree';

interface BookmarkDataNode extends DataNode {
  key: string;
  newTitle?: string;
  matchIndex?: number[];
  url?: string;
  children?: BookmarkDataNode[];
  isFolder?: boolean;
}

interface FolderDataNode extends DataNode {
  key: string;
  value: string;
  children?: FolderDataNode[];
}

interface OldDataItem {
  key: string;
  title: string;
}

interface TabInfo {
  name: string;
  url: string;
}

class RegOperation {
  private pattern: string;
  private flags: string;
  private re: RegExp | null;
  /**
   * 构造器
   * @param pattern 模式值
   * @param flags 标志值
   */
  constructor(pattern: string, flags: string | string[]) {
    this.pattern = pattern;
    this.flags = Array.isArray(flags) ? flags.join('') : flags;
    try {
      this.re = new RegExp(this.pattern, this.flags);
    } catch (e) {
      console.log(e);
      this.re = null;
    }
  }

  /**
   * 正则表达式替换方法
   * @param str 待替换字符串
   * @param replacement 替换值(默认为空字符串)
   * @returns 替换结果
   */
  replace(str: string, replacement = ''): string {
    if (str && this.re) {
      return str.replace(this.re, replacement);
    }

    return str;
  }

  /**
   * 正则表达式测试方法
   * @param str 测试字符串
   * @returns `true` 表示匹配
   */
  test(str: string): boolean {
    if (str && this.re) {
      return this.re.test(str);
    }
    return false;
  }
}

class BookmarksTree {
  private rules: RuleDataItem[];
  private data: BookmarkDataNode[];
  private oldData: OldDataItem[];
  constructor() {
    this.rules = [];
    this.data = [];
    this.oldData = [];
  }

  setRules(rules: RuleDataItem[]) {
    this.rules = rules;
    sortRules(this.rules);
  }

  async getData() {
    const results = await chrome.bookmarks.getTree();
    if (results[0].children) {
      this.data = this.traverseNodes(results[0].children);
    }
    return this.data;
  }

  getOldData() {
    return this.oldData;
  }

  clearOldData() {
    this.oldData = [];
  }

  changeBookmarks(checkedKeys: string[]): void {
    this.oldData = [];
    this.traverse(this.data, checkedKeys);
  }

  async undo() {
    for (const item of this.oldData) {
      const { key, title } = item;
      await chrome.bookmarks
        .update(key, {
          title,
        })
        .catch(err => {
          console.error(err);
        });
    }
  }

  /**
   * 递归遍历书签节点
   * @param nodes 书签节点数组
   * @returns 树节点数组
   */
  private traverseNodes(nodes: chrome.bookmarks.BookmarkTreeNode[]): BookmarkDataNode[] {
    const treeData: BookmarkDataNode[] = [];
    nodes.forEach(node => {
      if (node.children) {
        const children = this.traverseNodes(node.children);
        if (children.length > 0) {
          const { id, title } = node;
          treeData.push({
            key: id,
            title,
            children,
            isFolder: true,
          });
        }
      } else {
        const { title, id, url } = node;
        const matchIndex: number[] = [];
        let res = title;
        this.rules.forEach(rule => {
          const { enable, pattern, flags, replacement, index } = rule;
          if (enable) {
            const reg = new RegOperation(pattern, flags);
            if (reg.test(res)) {
              matchIndex.push(index);
              res = reg.replace(res, replacement);
            }
          }
        });

        if (matchIndex.length > 0) {
          treeData.push({
            key: id,
            title,
            newTitle: res,
            url,
            matchIndex,
          });
        }
      }
    });
    return treeData;
  }

  /**
   * 递归遍历更改书签
   * @param checkedKeys 选中的节点
   */
  private traverse(data: BookmarkDataNode[], checkedKeys: string[]): void {
    if (checkedKeys.length > 0) {
      data.forEach(item => {
        if (checkedKeys.length > 0) {
          if (item.children) {
            this.traverse(item.children, checkedKeys);
          } else {
            const { key, title, newTitle } = item;
            if (checkedKeys.includes(key)) {
              checkedKeys = checkedKeys.filter(v => v !== key);
              chrome.bookmarks.update(
                key,
                {
                  title: newTitle,
                },
                res => {
                  if (chrome.runtime.lastError) {
                    console.error(res);
                  }
                }
              );
              this.oldData.push({
                key,
                title,
              });
            }
          }
        }
      });
    }
  }
}

class FoldersTree {
  private data: FolderDataNode[];
  constructor() {
    this.data = [];
  }

  async getData() {
    const results = await chrome.bookmarks.getTree();
    if (results[0].children) {
      this.data = this.getFolders(results[0].children);
    }
    return this.data;
  }

  /**
   * 递归获取书签文件夹数组
   * @param nodes 书签数组
   * @returns 书签文件夹数组
   */
  private getFolders(nodes: chrome.bookmarks.BookmarkTreeNode[]): FolderDataNode[] {
    const treeData: FolderDataNode[] = [];
    nodes.forEach(node => {
      if (node.children) {
        const children = this.getFolders(node.children);
        const { id, title } = node;
        if (children.length > 0) {
          treeData.push({
            key: id,
            value: id,
            title,
            children,
          });
        } else {
          treeData.push({
            key: id,
            value: id,
            title,
          });
        }
      }
    });
    return treeData;
  }
}

/**
 * 按索引排序规则
 * @param rules 规则对象数组
 */
function sortRules(rules: RuleDataItem[]): void {
  rules.sort((a, b) => a.index - b.index);
}

/**
 * 获取当前标签页的信息
 * @returns 当前标签页的信息
 */
async function getCurrentTabInfo(): Promise<TabInfo> {
  const tabs = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  if (tabs.length > 0) {
    const { title, url } = tabs[0];
    return {
      name: title || '',
      url: url || '',
    };
  }
  return {
    name: '',
    url: '',
  };
}

/**
 * 查找最近添加的书签文件夹 id
 * @returns 书签文件夹 id
 */
async function getRecentBookmarkFolderId(): Promise<string> {
  const res = await chrome.bookmarks.getRecent(1);
  if (res.length > 0) {
    return res[0].parentId || '1';
  }
  return '1';
}

/**
 * 添加新书签
 * @param bookmark 书签信息
 * @returns 新书签的 id
 */
async function addNewBookmark(bookmark: chrome.bookmarks.BookmarkCreateArg): Promise<string> {
  const res = await chrome.bookmarks.create(bookmark);
  return res.id;
}

/**
 * 获取指定网址的书签信息
 * @param url 网址
 * @returns 书签对象
 */
async function getBookmarkInfo(url?: string): Promise<chrome.bookmarks.BookmarkTreeNode | null> {
  if (url) {
    const res = await chrome.bookmarks.search({
      url,
    });
    if (res.length > 0) {
      return res[0];
    }
  }
  return null;
}

/**
 * 判断网址是否为书签
 * @param url 网址
 * @returns `true` 表示是一个书签
 */
async function isBookmark(url?: string): Promise<boolean> {
  if (url) {
    const res = await getBookmarkInfo(url);
    if (res) {
      return true;
    }
  }
  return false;
}

/**
 * 更新书签
 * @param id 书签 id
 * @param title 书签名称
 * @param url 书签网址
 * @returns 书签对象
 */
async function updateBookmark(id: string, title: string, url: string): Promise<chrome.bookmarks.BookmarkTreeNode | null> {
  return await chrome.bookmarks
    .update(id, {
      title,
      url,
    })
    .catch(() => null);
}

/**
 * 移动书签
 * @param id 书签 id
 * @param folderId 文件夹 id
 * @param index 索引位置
 * @returns 书签对象
 */
async function moveBookmark(id: string, folderId: string, index?: number): Promise<chrome.bookmarks.BookmarkTreeNode | null> {
  return await chrome.bookmarks
    .move(id, {
      parentId: folderId,
      index,
    })
    .catch(() => null);
}

/**
 * 移除书签
 * @param id 书签 id
 */
function removeBookmark(id: string): void {
  if (id) {
    chrome.bookmarks.remove(id);
  }
}

/**
 * 创建书签文件夹
 * @param folder 文件夹对象
 * @returns 书签节点
 */
async function createFolder(folder: chrome.bookmarks.BookmarkCreateArg): Promise<chrome.bookmarks.BookmarkTreeNode | null> {
  return await chrome.bookmarks.create(folder).catch(() => null);
}

/**
 * 获取版本号
 * @returns 版本号
 */
function getVersion(): string {
  const res = chrome.runtime.getManifest();
  return res.version;
}

/**
 * 发送夜间模式的更改消息
 * @param dark 夜间模式状态
 */
function sendDarkMessage(dark: boolean): void {
  chrome.runtime.sendMessage({
    type: 'dark',
    data: dark,
  });
}

export {
  RegOperation,
  BookmarksTree,
  FoldersTree,
  sortRules,
  getCurrentTabInfo,
  getBookmarkInfo,
  getRecentBookmarkFolderId,
  addNewBookmark,
  isBookmark,
  updateBookmark,
  moveBookmark,
  removeBookmark,
  createFolder,
  getVersion,
  sendDarkMessage,
};
export type { BookmarkDataNode, FolderDataNode };
