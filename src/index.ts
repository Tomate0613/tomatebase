import fs from 'fs';
import deserialize, { Serializable, SerializeableClass } from './serializer';

export default class Database<Data = Serializable<unknown>> {
  data: Data;

  filepath: string;

  constructor(
    filepath: string,
    defaultData: Data,
    classes: SerializeableClass[]
  ) {
    this.filepath = filepath;

    if (fs.existsSync(filepath)) {
      this.data = {
        ...defaultData,
        ...deserialize(fs.readFileSync(filepath).toString(), classes),
      };
    } else {
      this.data = defaultData;
    }
  }

  save() {
    fs.writeFileSync(this.filepath, JSON.stringify(this.data));
  }
}

export * from './map';
