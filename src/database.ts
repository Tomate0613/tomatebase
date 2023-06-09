import fs from 'fs';
import path from 'path';
import deserialize, { DbSerializeableClass, SerializeableClass } from './serializer';
export default class Database<Data = unknown> {
  data: Data;
  filepath: string;
  classes: (DbSerializeableClass | SerializeableClass)[];

  constructor(
    filepath: string,
    defaultData: Data,
    classes: (DbSerializeableClass | SerializeableClass)[]
  ) {
    this.filepath = filepath;
    this.classes = classes;

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
    fs.mkdirSync(path.dirname(this.filepath), { recursive: true });
    fs.writeFileSync(this.filepath, JSON.stringify(this.data));
  }
}