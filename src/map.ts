import { DefaultSerializable } from './serializer';
import { v4 as uuidv4 } from 'uuid';

export type TomateMappable = { readonly id: string };

export default class TomateMap<
  Value extends TomateMappable
> extends DefaultSerializable<{
  [key: string]: Value;
}> {
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
    entry.id = uuidv4();

    this.set(entry.id, entry);
    return entry;
  }
}
