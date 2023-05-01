import { IpcCall } from 'ipc';
import { DefaultSerializable } from './serializer';
import { v4 as uuidv4 } from 'uuid';

export type TomateMappable = { readonly id: string };

export default class TomateMap<
  Value extends TomateMappable
> extends DefaultSerializable<{
  [key: string]: Value;
}> {
  client = ['get', 'list', 'length'] as const;

  // @ts-ignore
  private clientProxyHelper = {
    add: async (ipcCall: IpcCall, path: string, value: Omit<Value, 'id'>) => {
      const added = await ipcCall('db-function', path, 'add', [value]);
      this.data[added.id] = added;

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
      this.data[id] = entry;

      await ipcCall('db-function', path, 'set', [id, value]);
    },
    remove: async (ipcCall: IpcCall, path: string, id: string) => {
      delete this.data[id];

      await ipcCall('db-function', path, 'remove', [id]);
    },
  } as const;

  constructor(data?: { [key: string]: Value }) {
    super(data ?? {});
  }

  get(id: string) {
    return this.data[id];
  }

  set(id: string, value: Omit<Value, 'id'>) {
    let entry: any = value;
    entry.id = id;
    this.data[id] = entry;
  }

  remove(id: string) {
    delete this.data[id];
  }

  list() {
    return Object.values(this.data);
  }

  length() {
    return Object.keys(this.data).length;
  }

  add(value: Omit<Value, 'id'>): Value {
    let entry: any = value;

    this.set(uuidv4(), entry);
    return entry;
  }
}
