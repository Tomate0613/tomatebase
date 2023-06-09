import deserialize from './serializer';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import Database, { IpcCall } from './';

export type FsMappable = { id: string; folder: string };


/**
 * @shadowable
 */
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

  clientConstructor(ipcCall: IpcCall, data: {
    entries: {[key: string]: Value;},
    data: { path: string }
  }) {
    // @ts-expect-error @ipcCall
    this.ipcCall = ipcCall;
    this.entries = data.entries;
    this.data = data.data;
  }

  /**
   * @client
   */
  get(id: string) {
    return this.entries[id];
  }

  /**
   * @shadow custom async set(id: string, value: Omit<Value, 'id' | 'folder'>): Promise<void> {|||await this.ipcCall('db-function', 'FsMap', 'set', [id, value]);|||let entry: any = value;|||entry.folder = `${this.data.path}/${id}`;|||entry.id = id;|||this.entries[id] = entry;|||}
   */
  set(id: string, value: Omit<Value, 'id' | 'folder'>) {
    const folder = `${this.data.path}/${id}`;
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

    let entry: any = value;
    entry.folder = folder;
    entry.id = id;

    this.entries[id] = entry;
  }

  /**
   * @shadow custom async remove(id: string): Promise<void> {|||await this.ipcCall('db-function', 'FsMap', 'remove', [id]);|||delete this.entries[id];|||}
   */
  remove(id: string) {
    const entry = this.entries[id];
    fs.rmSync(`${this.data.path}/${entry.folder}`, { recursive: true });
    delete this.entries[id];
  }
  

  /**
   * @client
   */
  list() {
    return Object.values(this.entries);
  }

  /**
   * @client
   */
  length() {
    return Object.keys(this.entries).length;
  }

  /**
   * @shadow custom async add(value: Omit<Value, 'id'>): Promise<Value> {|||const entry = await this.ipcCall('db-function', 'FsMap', 'add', [value]);|||this.set(entry.id, entry);|||return entry;|||}
   */
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

  toClientJSON() {
    return {
      data: this.data,
      class: this.constructor.name,
    }
  }
}
