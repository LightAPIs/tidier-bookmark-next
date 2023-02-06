# Tidier Bookmark

[![Release](https://img.shields.io/github/v/release/LightAPIs/tidier-bookmark-next.svg?color=orange)](https://github.com/LightAPIs/tidier-bookmark-next/releases/latest) [![Chrome Web Store](https://img.shields.io/chrome-web-store/v/ecdhgoljkpghgkdcbejhepnkhnogmklj.svg?maxAge=86400)](https://chrome.google.com/webstore/detail/tidier-bookmark/ecdhgoljkpghgkdcbejhepnkhnogmklj) [![GPLv3](https://img.shields.io/github/license/LightAPIs/tidier-bookmark-next.svg)](/LICENSE.md)

> Helps achieve cleaner bookmark names

- English
- [中文版](/README_CN.md)

## Feature

Allows you to automatically modify the bookmark name according to the user-defined regular expression rules when adding bookmarks, so as to obtain a cleaner bookmark. At the same time, it also provides the function of batch modifying the existing bookmark name.

## Installation

1. Go to the [Chrome Web Store](https://chrome.google.com/webstore/detail/tidier-bookmark/ecdhgoljkpghgkdcbejhepnkhnogmklj) to download and install.
2. Start the browser and type `chrome://extensions/` in the address bar to enter Extensions Page, click the switch in the upper right corner of the webpage to turn on "Developer mode":
  - a. Go to the [Releases](https://github.com/LightAPIs/tidier-bookmark-next/releases/latest) to download the extension `crx` file. Drag to Extensions Page to install.
  - b. Go to the [Releases](https://github.com/LightAPIs/tidier-bookmark-next/releases/latest) to download the extension package `zip` file and unzip it. And click "Load unpacked" button, select the root directory of the previously unzipped file to complete the installation of the extension.

## Usage

> Note: The rules for this extension are regular expression, so if you are not familiar with the use of regular expression, you can refer to them [here](https://github.com/ziishaned/learn-regex/blob/master/README.md).

Initially, the behavior of clicking the extension icon with the mouse is similar to adding a bookmark button in the address bar. You can add or modify bookmark and create new folder. It also supports the search folder function.

Then you can right-click the extension icon to enter the options and switch to the rule list page, or directly click "Create a new rule" in the menu, and then you can write a regular expression rule to replace the bookmark name.

If its name matches the rule when you click the extension button to create a bookmark, the content will be replaced automatically.

At the same time, the option page also provides the function of batch editing existing bookmarks.

## Development

### Environment

- Install [Node.js](https://nodejs.org/) 16 and above (*new version has integrated npm*)

### Initialization

```bash
# Installation dependency
npm install
```
### Build

- Build the extension: `npm run build`

## Project dependency

The project is based on the following open source projects:

- [ant-design/ant-design-icons](https://github.com/ant-design/ant-design-icons) ([MIT License](https://github.com/ant-design/ant-design-icons/blob/master/LICENSE))
- [brix/crypto-js](https://github.com/brix/crypto-js) ([MIT License](https://github.com/brix/crypto-js/blob/develop/LICENSE))
- [jakearchibald/idb](https://github.com/jakearchibald/idb) ([ISC License](https://github.com/jakearchibald/idb/blob/main/LICENSE))
- [vueComponent/ant-design-vue](https://github.com/vueComponent/ant-design-vue) ([MIT License](https://github.com/vueComponent/ant-design-vue/blob/main/LICENSE))
- [vuejs/core](https://github.com/vuejs/core) ([MIT License](https://github.com/vuejs/core/blob/main/LICENSE))
- [vuejs/router](https://github.com/vuejs/router) ([MIT License](https://github.com/vuejs/router/blob/main/LICENSE))
## License

[GPL-3.0](/LICENSE.md) License
