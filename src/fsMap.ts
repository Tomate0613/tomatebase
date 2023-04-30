import deserialize from './serializer';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import Database from 'index';

export type FsMappable = { id: string; folder: string };

export default class FsMap<Value extends FsMappable> {
  data: { path: string };
  entries: {
    [key: string]: Value;
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

    entry.id = uuidv4();
    entry.folder = `${this.data.path}/${entry.id}`;

    this.set(entry.id, entry);
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
