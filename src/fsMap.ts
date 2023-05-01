import deserialize from './serializer';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import Database from 'index';
import { IpcCall } from 'ipc';

export type FsMappable = { id: string; folder: string };

export default class FsMap<Value extends FsMappable> {
  data: { path: string };
  entries: {
    [key: string]: Value;
  };
  client = ['get', 'list', 'length'] as const;

  // @ts-ignore
  private clientProxyHelper = {
    add: async (ipcCall: IpcCall, path: string, value: Omit<Value, 'id'>) => {
      const added = await ipcCall('db-function', path, 'add', [value]);
      this.entries[added.id] = added;

      return added;
    },
    set: async (
      ipcCall: IpcCall,
      path: string,
      id: string,
      value: Omit<Value, 'id'>
    ) => {
      let entry: any = value;
      entry.id = id;
      entry.folder = `${this.data.path}/${id}`;
      this.entries[id] = entry;

      await ipcCall('db-function', path, 'set', [id, value]);
    },
    remove: async (ipcCall: IpcCall, path: string, id: string) => {
      delete this.entries[id];

      await ipcCall('db-function', path, 'remove', [id]);
    },
  } as const;

  constructor(db: Database | null, data: { path: string }) {
    this.entries = {};
    this.data = data;

    if (!db) {
      return;
    } else {
      if (!fs.existsSync(data.path)) return;

      fs.readdirSync(data.path).forEach((folder) => {
        const json = fs.readFileSync(
          `${data.path}/${folder}/data.json`,
          'utf8'
        );
        this.entries[folder] = deserialize(json, db.classes, db);
      });
    }
  }

  get(id: string) {
    return this.entries[id];
  }

  set(id: string, value: Omit<Value, 'id' | 'folder'>) {
    const folder = `${this.data.path}/${id}`;
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

    let entry: any = value;
    entry.folder = folder;
    entry.id = id;

    this.entries[id] = entry;
  }

  remove(id: string) {
    delete this.entries[id];
  }

  list() {
    return Object.values(this.entries);
  }

  length() {
    return Object.keys(this.entries).length;
  }

  add(value: Omit<Value, 'id' | 'folder'>): Value {
    let entry: any = value;

    this.set(uuidv4(), entry);
    return entry;
  }

  toJSON() {
    this.list().forEach((entry) => {
      if (!fs.existsSync(entry.folder))
        fs.mkdirSync(entry.folder, { recursive: true });

      fs.writeFileSync(`${entry.folder}/data.json`, JSON.stringify(entry));
    });

    return {
      data: this.data,
      class: this.constructor.name,
      db: true,
    };
  }
}
