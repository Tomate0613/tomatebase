import Database from 'index';

export interface DbSerializeableClass {
  new (db: Database, data: never): void;
}

export class DefaultDbSerializable<T> {
  data: T;
  protected db: Database;

  constructor(db: Database, data: T) {
    this.data = data;
    this.db = db;
  }

  toJSON() {
    return {
      data: this.data,
      class: this.constructor.name,
      db: true,
    };
  }
}

export interface SerializeableClass {
  new (data: never): void;
}

export class DefaultSerializable<T> {
  data: T;

  constructor(data: T) {
    this.data = data;
  }

  toJSON() {
    return {
      data: this.data,
      class: this.constructor.name,
    };
  }
}

export default function deserialize(
  json: string,
  serializables: (SerializeableClass | DbSerializeableClass)[],
  db?: Database
) {
  return JSON.parse(json, (_key, value) => {
    if (value === null) {
      return null;
    }

    if (value && value.class) {
      const Class: any = serializables.find(
        (serializeable) => serializeable.name === value.class
      );

      if (!Class) {
        throw new Error(
          `Forgot to include class ${value.class} when using deserialize`
        );
      }

      if (value.db) {
        if (!db) {
          throw new Error(
            `No database provided to deserialize even though ${value.class} is marked as db`
          );
        }

        value = new Class(db, value.data as never);
      } else {
        value = new Class(value.data as never);
      }
    }

    return value;
  });
}
