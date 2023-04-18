import fs from 'fs';
import deserialize, {
  DbSerializeableClass,
  SerializeableClass,
} from './serializer';

export default class Database<Data = unknown> {
  data: Data;

  filepath: string;

  constructor(
    filepath: string,
    defaultData: Data,
    classes: (DbSerializeableClass | SerializeableClass)[]
  ) {
    this.filepath = filepath;

    if (fs.existsSync(filepath)) {
      this.data = {
        ...defaultData,
        ...deserialize(fs.readFileSync(filepath).toString(), classes, this),
      };
    } else {
      this.data = defaultData;
    }
  }

  save() {
    fs.writeFileSync(this.filepath, JSON.stringify(this.data));
  }
}

export { default as TomateMap } from './map';
export { default as Reference } from './ref';
