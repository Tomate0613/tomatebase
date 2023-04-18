import { Serializable } from './serializer';
import { v4 as uuidv4 } from 'uuid';

type TomateData<T> = T & { readonly id: string };

export default class TomateMap<Value> extends Serializable<{
  [key: string]: TomateData<Value>;
}> {
  constructor(data?: { [key: string]: TomateData<Value> }) {
    super(data ?? {});
  }

  get(id: string) {
    return this.data[id];
  }

  set(id: string, value: Value) {
    this.data[id] = { ...value, id };
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

  add(value: Value & { id?: string }): TomateData<Value> {
    if (!value.id) value.id = uuidv4();

    this.set(value.id, value);
    return value as TomateData<Value>;
  }
}
