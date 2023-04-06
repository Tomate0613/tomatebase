export interface SerializeableClass {
  new (data: never): void;
}

export class Serializable<T> {
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
  serializables: SerializeableClass[]
) {
  return JSON.parse(json, (key, value) => {
    if (value === null) {
      console.error(`The database seems to be broken; ${key} is null`);
      return null;
    }

    if (value && value.class) {
      const Class = serializables.find(
        (serializeable) => serializeable.name === value.class
      );

      if (!Class) {
        throw new Error(
          `Forgot to include class ${value.class} when using deserialize`
        );
      }

      value = new Class(value.data as never);
    }

    return value;
  });
}
