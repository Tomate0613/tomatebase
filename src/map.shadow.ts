// Automatically generated by tomatebase-cli

import { IpcCall } from "index";
import { TomateMappable, KVP } from "map";
import { DefaultSerializable } from "serializer";

export default class ShadowTomateMap<
  Value extends TomateMappable
> extends DefaultSerializable<KVP<Value>> {
  static className = 'TomateMap';
  ipcCall: IpcCall;
  constructor(ipcCall: IpcCall, data?: { [key: string]: Value }) {
    super(data ?? {});
    this.ipcCall = ipcCall;
  }
  get(id: string) {
    return this.data[id];
  }

  set(id: string, value: Omit<Value, 'id'>) {
    this.ipcCall('db-function', 'TomateMap', 'set', arguments);
    let entry: any = value;
    entry.id = id;
    this.data[id] = entry;
  }

  remove(id: string) {
    this.ipcCall('db-function', 'TomateMap', 'remove', arguments);
    delete this.data[id];
  }

  list() {
    return Object.values(this.data);
  }

  length() {
    return Object.keys(this.data).length;
  }

  async add(value: Omit<Value, 'id'>): Promise<Value> {
    const entry = await this.ipcCall('db-function', 'TomateMap', 'add', [
      value,
    ]);
    this.set(entry.id, entry);
    return entry;
  }
}