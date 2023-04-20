import { DbSerializable } from './serializer';
import { get } from 'lodash';
import Database from '.';

export default class Reference<T> extends DbSerializable<string> {
  constructor(db: Database, path: string) {
    super(db, path);
  }

  get value(): T {
    return get(this.db.data, this.data);
  }

  set path(path: string) {
    this.data = path;
  }

  get path() {
    return this.data;
  }
}
