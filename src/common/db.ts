import { IDBPDatabase, openDB, DBSchema } from 'idb/with-async-ittr';

type StoreItemKey = 'isDark';

interface StoreItem {
  readonly name: StoreItemKey;
  value: string;
}

interface StoreDB extends DBSchema {
  store: {
    key: string;
    value: StoreItem;
  };
}

abstract class BasicDB<T extends DBSchema> {
  protected name: string;
  protected version: number | undefined;
  protected db: IDBPDatabase<T> | null;

  constructor(name: string, version?: number) {
    this.name = name;
    this.version = version;
    this.db = null;
  }
}

class TidierStoreDB extends BasicDB<StoreDB> {
  constructor(name = 'TidierStore', version?: number) {
    super(name, version);
  }

  async init(): Promise<TidierStoreDB> {
    this.db = await openDB<StoreDB>(this.name, this.version, {
      upgrade(db) {
        db.createObjectStore('store', { keyPath: 'name' });
      },
    });
    return this;
  }

  async readStore(): Promise<StoreItem[]> {
    if (this.db) {
      return await this.db.getAll('store');
    }
    return [];
  }

  async getStoreItemValue(name: StoreItemKey): Promise<string | undefined> {
    if (this.db) {
      const data = await this.db.get('store', name);
      return data?.value;
    }
    return undefined;
  }

  async setStoreItemValue(name: StoreItemKey, value: string): Promise<string> {
    if (this.db) {
      return this.db.put('store', {
        name,
        value,
      });
    }
    return '';
  }
}

/**
 * 储存的浏览器暗黑模式状态
 * @returns `true` 表示启用
 */
async function isDark(): Promise<boolean> {
  const db = await new TidierStoreDB().init();
  const dark = await db.getStoreItemValue('isDark');
  return dark === '1';
}

/**
 * 设置浏览器暗黑模式状态
 * @param value 状态值；`true` 表示启用
 */
async function setDark(value: boolean): Promise<void> {
  const db = await new TidierStoreDB().init();
  db.setStoreItemValue('isDark', value ? '1' : '0');
}

export { TidierStoreDB, isDark, setDark };
