import deserialize from './serializer';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import Database from 'index';

type FsData<T> = T & { readonly id: string; readonly folder: string };

export default class FsMap<Value> {
  data: { path: string };
  entries: {
    [key: string]: FsData<Value>;
  };

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

  set(id: string, value: Omit<Value, 'id' | 'folder'> & { id?: string }) {
    this.entries[id] = {
      ...value,
      id,
      folder: `${this.data.path}/${id}`,
    } as FsData<Value>;
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

  add(
    value: Omit<Value, 'id' | 'folder'> & { id?: string; folder?: string }
  ): FsData<Value> {
    if (!value.id) value.id = uuidv4();
    value.folder = `${this.data.path}/${value.id}`;

    this.set(value.id, value);
    return value as FsData<Value>;
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
