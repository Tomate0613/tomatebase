import deserialize from './serializer';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import Database from 'index';

type TomateData<T> = T & { readonly id: string };

export default class FsMap<Value> {
  data: { path: string };
  entries: {
    [key: string]: TomateData<Value>;
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

  set(id: string, value: Omit<Value, 'id'> & { id?: string }) {
    this.entries[id] = { ...value, id } as TomateData<Value>;
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

  add(value: Omit<Value, 'id'> & { id?: string }): TomateData<Value> {
    if (!value.id) value.id = uuidv4();

    this.set(value.id, value);
    return value as TomateData<Value>;
  }

  toJSON() {
    Object.keys(this.entries).forEach((folder) => {
      if (!fs.existsSync(`${this.data.path}/${folder}`))
        fs.mkdirSync(`${this.data.path}/${folder}`, { recursive: true });

      fs.writeFileSync(
        `${this.data.path}/${folder}/data.json`,
        JSON.stringify(this.entries[folder])
      );
    });

    return {
      data: this.data,
      class: this.constructor.name,
      db: true,
    };
  }
}
