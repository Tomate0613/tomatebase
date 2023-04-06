import { Serializable } from './serializer';
import { v4 as uuidv4 } from 'uuid';

export class TomateMap<
  Value extends { readonly id: string }
> extends Serializable<{
  [key: string]: Value;
}> {
  constructor(data?: { [key: string]: Value }) {
    super(data ?? {});
  }

  get(id: string) {
    return this.data[id];
  }

  set(id: string, value: Omit<Value, 'id'>) {
    this.data[id] = { ...value, id } as Value;
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

  add(value: Omit<Value, 'id'> & { id?: string }) {
    if (!value.id) value.id = uuidv4();

    this.set(value.id, value);
    return value as Value;
  }
}
