import { memoize } from 'lodash';
import { DbSerializeableClass, SerializeableClass } from './serializer';
import { GetTypeFromPath, PathInto } from './types/path';
import Database from './database';

export type DbIpcChannels = 'get-db-data' | 'db-function' | 'db-create';
export type IpcCall = (channel: DbIpcChannels, ...data: any[]) => Promise<any>;



const getData = async <Path extends string, DB>(
  path: Path,
  ipcCall: IpcCall,
  serializeableClasses: (SerializeableClass | DbSerializeableClass)[]
): Promise<GetTypeFromPath<DB, Path>> => {
  const data = await ipcCall('get-db-data', path);

  const parsedJson = JSON.parse(data);
  return transform('', parsedJson, serializeableClasses, ipcCall);
};

const memoizedGetData = memoize(getData, (path) => path);

export class IpcDbConnection<
  DB extends Database,
  SerializeableClasses extends (SerializeableClass | DbSerializeableClass)[]
> {
  ipcCall: IpcCall;
  serializeableClasses: SerializeableClasses;

  constructor(ipcCall: IpcCall, classes: SerializeableClasses) {
    this.ipcCall = ipcCall;
    this.serializeableClasses = classes;
  }

  /**
   * Gets data from the backend
   */
  getData = async <Path extends PathInto<DB> | ''>(
    path: Path,
    memoizeResult = true
  ): Promise<GetTypeFromPath<DB, Path>> => {
    if (!memoizeResult) {
      return getData(path, this.ipcCall, this.serializeableClasses);
    }

    return memoizedGetData(path, this.ipcCall, this.serializeableClasses);
  };

  // TODO ts
  async createNew(className: string, ...data: unknown[]) {
    await this.ipcCall('db-create', className, data);
  }
}

function serializeReplacer(_key: string, value: unknown): unknown {
  if (typeof value === 'object' && value !== null && 'toClientJSON' in value && typeof value.toClientJSON === 'function') {
    return value.toClientJSON();
  }
  
  return value;
}

export function serialize(d: unknown) {
  return JSON.stringify(d, serializeReplacer);
}



function transform(
  path: string,
  value: any,
  serializables: readonly (SerializeableClass | DbSerializeableClass)[],
  ipcCall: IpcCall
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
        ipcCall
      );
    });
  }

  if (value && value.class) {
    const Class: any = serializables.find(
      (serializeable) => ('className' in serializeable
      ? serializeable.className === value.class
      : serializeable.name === value.class)
    );

    if (!Class) {
      throw new Error(
        `Forgot to include class ${value.class} when using deserialize`
      );
    }

    if (value.db)
      throw new Error(
        `Cannot instantiate class ${value.class} because it requires a reference to the database, which is not supported on the client`);

    const instance = new Class((channel: DbIpcChannels, ...data: any[]) => {ipcCall(channel, path, ...data)}, value.data);

    value = instance;
  }

  return value;
}