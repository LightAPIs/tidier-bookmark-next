import AES from 'crypto-js/aes';
import encUtf8 from 'crypto-js/enc-utf8';
import { AES_SECRET_KEY } from '@/common/key';

type OpenedTip = 'optionsImportNoFileText' | 'optionsImportNotATextFile' | 'optionsImportValidText' | 'optionsImportCannotFindFile' | 'opened';

type OpenedFlag = {
  state: boolean;
  tip: OpenedTip;
};

/**
 * 打开文件的回调
 * @param flag 打开状态
 * @param content 返回内容
 */
type OpenedCallback = (flag: OpenedFlag, content?: string) => void;

/**
 * 下载文本文件至本地的方法
 * @param content 文件内容
 * @param filename 文件名 - 需要带扩展名
 * @param completed 在下载完成后调用的回调函数
 */
function downloadTextFile(content: string, filename: string, completed?: () => void): void {
  const exportBlob = new Blob([content]);
  const saveLink = document.createElementNS('http://www.w3.org/1999/xhtml', 'a') as HTMLAnchorElement;
  saveLink.href = URL.createObjectURL(exportBlob);
  saveLink.download = filename;

  /** MouseEvent 鼠标事件构造器 */
  const ev = new MouseEvent('click', {
    bubbles: true,
    cancelable: false,
    screenX: 0,
    screenY: 0,
    clientX: 0,
    clientY: 0,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    button: 0,
    relatedTarget: null,
  });
  saveLink.dispatchEvent(ev);

  typeof completed === 'function' && completed();
}

/**
 * 打开并读取文本文件的方法
 * @param opened 打开文件的回调函数
 */
function openTextFile(opened: OpenedCallback): void {
  const fileInput = document.createElementNS('http://www.w3.org/1999/xhtml', 'input') as HTMLInputElement;
  fileInput.type = 'file';
  fileInput.accept = '.txt, .text, .json, .conf, .config';
  fileInput.style.display = 'none';

  fileInput.addEventListener('change', () => {
    if (!fileInput.value) {
      console.warn('No file selected.');
      opened({
        state: false,
        tip: 'optionsImportNoFileText',
      });
      return;
    }

    const file = fileInput.files?.[0];
    if (file) {
      const { type } = file;
      if (['application/json', 'application/xml', 'text/plain'].includes(type)) {
        const reader = new FileReader();
        reader.onload = e => {
          const { target } = e;
          if (target) {
            const data = target.result;
            if (typeof data === 'string') {
              opened(
                {
                  state: true,
                  tip: 'opened',
                },
                data
              );
            } else {
              console.warn('Not a text file.');
              opened({
                state: false,
                tip: 'optionsImportNotATextFile',
              });
            }
            return;
          }
        };
        reader.readAsText(file);
      } else {
        console.warn('Invalid file.');
        opened({
          state: false,
          tip: 'optionsImportValidText',
        });
        return;
      }
    } else {
      console.warn('Cannot find file.');
      opened({
        state: false,
        tip: 'optionsImportCannotFindFile',
      });
      return;
    }
  });

  fileInput.click();
}

/**
 * 解码内容
 * @param content 内容
 * @returns 存储对象
 */
function decodeContent(content: string): StorageLocalItems | undefined {
  const bytes = AES.decrypt(content, AES_SECRET_KEY);
  const originalText = bytes.toString(encUtf8);
  try {
    const obj = JSON.parse(originalText);
    if (typeof obj === 'object' && obj) {
      const { settings, rules } = obj as StorageLocalItems;
      return {
        settings,
        rules,
      };
    }
  } catch (err) {
    console.error(err);
  }
  return undefined;
}

/**
 * 编码对象
 * @param obj 存储对象
 * @returns 编码字符串
 */
function encodeObj(obj: StorageLocalItems): string {
  const json = JSON.stringify(obj);
  const cipherText = AES.encrypt(json, AES_SECRET_KEY).toString();
  return cipherText;
}

export { downloadTextFile, openTextFile, decodeContent, encodeObj };
