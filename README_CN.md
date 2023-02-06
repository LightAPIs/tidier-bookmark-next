# Tidier Bookmark

[![Release](https://img.shields.io/github/v/release/LightAPIs/tidier-bookmark-next.svg?color=orange)](https://github.com/LightAPIs/tidier-bookmark-next/releases/latest) [![Chrome Web Store](https://img.shields.io/chrome-web-store/v/ecdhgoljkpghgkdcbejhepnkhnogmklj.svg?maxAge=86400)](https://chrome.google.com/webstore/detail/tidier-bookmark/ecdhgoljkpghgkdcbejhepnkhnogmklj) [![GPLv3](https://img.shields.io/github/license/LightAPIs/tidier-bookmark-next.svg)](/LICENSE.md)

> 帮助实现更整洁的书签名称

- [English](/README.md)
- 中文版

## 功能

允许在添加书签时自动根据用户定义的正则表达式规则对书签名称进行修改，以获得更整洁的书签，同时还提供了批量修改已存在书签名称的功能。

## 安装方法

1. 前往 [Chrome 网上应用店](https://chrome.google.com/webstore/detail/tidier-bookmark/ecdhgoljkpghgkdcbejhepnkhnogmklj)进行下载安装。
2. 点击[此处](https://github.com/LightAPIs/tidier-bookmark/releases/latest)下载扩展程序压缩包并进行解压，启动浏览器在地址栏内输入 `chrome://extensions/` 进入扩展程序管理页面，点击网页右上角的开关以开启"开发者模式"，然后点击"加载已解压的扩展程序"按钮，选择加载先前解压所得目录即可完成扩展程序的安装。

## 使用方法

> 注意: 本扩展程序所汲及到的规则均采用正则表达式进行编写，如果您不了解或不熟悉正则表达式的使用方法，可以参考[此处](https://github.com/ziishaned/learn-regex/blob/master/translations/README-cn.md)。

初始情况下，鼠标点击扩展程序图标的行为类似地址栏内添加书签按钮，可进行添加或修改书签及新建文件夹等操作，同时支持搜索文件夹功能。

然后可以右键点击扩展程序图标进入选项并切换到规则列表页面，或直接点击菜单中的"创建新的规则"，随即可以编写用于替换书签名称的正则表达式规则。

若在点击扩展程序按钮新建书签时其名称匹配该规则，则会自动替换内容。

同时在选项页面还提供了批量修改已存在书签的功能。

## 开发编译

### 环境需求

- 安装 [Node.js](https://nodejs.org/) 16 及以上 (*新版本已集成 npm*)

### 初始化指令

```bash
# 安装依赖
npm install
```

### 构建

- 构建扩展程序：`npm run build`

## 项目依赖

本项目基于以下开源项目进行构建：

- [ant-design/ant-design-icons](https://github.com/ant-design/ant-design-icons) ([MIT License](https://github.com/ant-design/ant-design-icons/blob/master/LICENSE))
- [brix/crypto-js](https://github.com/brix/crypto-js) ([MIT License](https://github.com/brix/crypto-js/blob/develop/LICENSE))
- [jakearchibald/idb](https://github.com/jakearchibald/idb) ([ISC License](https://github.com/jakearchibald/idb/blob/main/LICENSE))
- [vueComponent/ant-design-vue](https://github.com/vueComponent/ant-design-vue) ([MIT License](https://github.com/vueComponent/ant-design-vue/blob/main/LICENSE))
- [vuejs/core](https://github.com/vuejs/core) ([MIT License](https://github.com/vuejs/core/blob/main/LICENSE))
- [vuejs/router](https://github.com/vuejs/router) ([MIT License](https://github.com/vuejs/router/blob/main/LICENSE))

## 许可证

[GPL-3.0](/LICENSE.md) License
