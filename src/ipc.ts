import { memoize } from 'lodash';
import Database from './';
import { DbSerializeableClass, SerializeableClass } from './serializer';
import { GetTypeFromPath, PathInto } from './types/path';

export type DbIpcChannels = 'get-db-data' | 'db-function';
export type IpcCall = (channel: DbIpcChannels, ...data: any[]) => Promise<any>;
export type Promisify<T> = {
  [K in keyof T]: T[K] extends (...args: any) => any
    ? K extends ExtractClientFunctionNames<T>
      ? (...args: Parameters<T[K]>) => Promisify<ReturnType<T[K]>>
      : (...args: Parameters<T[K]>) => Promisify<Promise<ReturnType<T[K]>>>
    : T[K] extends object
    ? Promisify<T[K]>
    : T[K];
};

type ExtractClientFunctionNames<U> = U extends {
  client: readonly [...infer V];
}
  ? V[number]
  : never;

function getClassFunctionNames(Class: any): string[] {
  return Object.getOwnPropertyNames(Class.prototype).filter(
    (prop) => prop !== 'constructor'
  );
}

export class IpcDbConnection<
  DB extends Database,
  SerializeableClasses extends (SerializeableClass | DbSerializeableClass)[]
> {
  ipcCall: IpcCall;
  serializeableClasses: SerializeableClasses;

  constructor(ipcCall: IpcCall, classes: SerializeableClasses) {
    this.ipcCall = ipcCall;
    this.serializeableClasses = classes;

    // Memoize the getData function
    this.getData = memoize(this.getData.bind(this), (path) => path);
  }

  /**
   * Gets data from the backend
   *
   * @template Path
   * @param {Path} path
   * @return {*}  {Promise<Promisify<GetTypeFromPath<DB, Path>, FooBar<Classes>>>}
   * @memberof IpcDbConnection
   */
  getData = memoize(
    async <Path extends PathInto<DB> | ''>(
      path: Path
    ): Promise<Promisify<GetTypeFromPath<DB, Path>>> => {
      const db = await this.ipcCall('get-db-data', path);

      return deserialize(db as string, this.serializeableClasses, this.ipcCall);
    }
  );
}

function transformClassToProxy(
  path: string,
  ipcCall: IpcCall,
  Class: SerializeableClass | DbSerializeableClass,
  instance: any
) {
  const functionNames = getClassFunctionNames(Class);

  for (let i = 0; i < functionNames.length; i++) {
    const functionName = functionNames[i];

    if (
      'clientProxyHelper' in instance &&
      functionName in instance.clientProxyHelper
    ) {
      instance[functionName] = (...args: any[]) =>
        instance.clientProxyHelper[functionName](ipcCall, path, ...args);
    } else if (
      !('client' in instance) ||
      (Array.isArray(instance.client) &&
        !instance.client.includes(functionName))
    ) {
      instance[functionName] = function (...args: any[]) {
        return ipcCall('db-function', path, functionName, args);
      };
    }
  }

  return instance;
}

function transform(
  path: string,
  value: any,
  serializables: readonly (SerializeableClass | DbSerializeableClass)[],
  sendToBackend: IpcCall
) {
  if (value === null) {
    return null;
  }

  if (typeof value === 'object') {
    Object.keys(value).forEach((key) => {
      value[key] = transform(
        path ? `${path}.${key}` : key,
        value[key],
        serializables,
        sendToBackend
      );
    });
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

    let instance;
    if (value.db) instance = new Class(null, value.data);
    else instance = new Class(value.data);

    value = transformClassToProxy(path, sendToBackend, Class, instance);
  }

  return value;
}

export default function deserialize(
  json: string,
  serializables: readonly (SerializeableClass | DbSerializeableClass)[],
  sendToBackend: IpcCall
) {
  const parsedJson = JSON.parse(json);
  return transform('', parsedJson, serializables, sendToBackend);
}
