import { DefaultSerializable } from './serializer';
import { v4 as uuidv4 } from 'uuid';

export type TomateMappable = { readonly id: string };

export type KVP<V> = { [key: string]: V };

/**
 * @shadowable
 */
export default class TomateMap<Value extends TomateMappable> extends DefaultSerializable<KVP<Value>> {
  constructor(data?: { [key: string]: Value }) {
    super(data ?? {});
  }

  /**
   * Returns an element
   * @client
   */
  get(id: string) {
    return this.data[id];
  }

  /**
   * @shadow both
   */
  set(id: string, value: Omit<Value, 'id'>) {
    let entry: any = value;
    entry.id = id;
    this.data[id] = entry;
  }

  /**
   * @shadow both
   */
  remove(id: string) {
    delete this.data[id];
  }

  /**
   * Returns all entries/values
   * @client
   */
  list() {
    return Object.values(this.data);
  }

  /**
   * Returns the length of the map
   * @client
   */
  length() {
    return Object.keys(this.data).length;
  }

  /**
   * @shadow custom async add(value: Omit<Value, 'id'>): Promise<Value> {|||const entry = await this.ipcCall('db-function', 'TomateMap', 'add', [value]);|||this.set(entry.id, entry);|||return entry;|||}
   */
  add(value: Omit<Value, 'id'>): Value {
    let entry: any = value;

    this.set(uuidv4(), entry);
    return entry;
  }
}
