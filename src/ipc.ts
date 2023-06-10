import { memoize } from 'lodash';
import { GetTypeFromPath, PathInto } from './types/path';
import Database from './database';
import findClass from './findClass';

export type DbIpcChannels = 'get-db-data' | 'db-function' | 'db-create';
export type IpcCall = (channel: DbIpcChannels, ...data: any[]) => Promise<any>;

export interface ShadowSerializeableClass {
  new(ipcCall: IpcCall, data: never): void;
}

export interface ShadowDbSerializeableClass {
  new(ipcCall: IpcCall, db: Database, data: never): void;
}

const getData = async <Path extends string, DB>(
  path: Path,
  ipcCall: IpcCall,
  serializeableClasses: (ShadowSerializeableClass | ShadowDbSerializeableClass)[]
): Promise<GetTypeFromPath<DB, Path>> => {
  const data = await ipcCall('get-db-data', path);

  return deserialize(data, serializeableClasses, ipcCall);
};

const memoizedGetData = memoize(getData, (path) => path);

export class IpcDbConnection<
  DB extends Database,
  SerializeableClasses extends (ShadowSerializeableClass | ShadowDbSerializeableClass)[]
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
  createNew<T>(className: string, ...data: unknown[]): Promise<T> {
    return this.ipcCall('db-create', className, data);
  }
}

function serializeToClientReplacer(_key: string, value: unknown): unknown {
  if (typeof value === 'object' && value !== null && 'toClientJSON' in value && typeof value.toClientJSON === 'function') {
    return value.toClientJSON();
  }

  return value;
}

function serializeToServerReplacer(_key: string, value: unknown): unknown {
  if (typeof value === 'object' && value !== null && 'toServerJSON' in value && typeof value.toServerJSON === 'function') {
    return value.toServerJSON();
  }

  return value;
}

export function serialize(d: unknown) {
  return JSON.stringify(d, serializeToClientReplacer);
}

export function serializeToServer(d: unknown) {
  return JSON.stringify(d, serializeToServerReplacer);
}

function deserialize(json: string, serializeableClasses: readonly (ShadowSerializeableClass | ShadowDbSerializeableClass)[], ipcCall: IpcCall) {
  return transform('', JSON.parse(json), serializeableClasses, ipcCall)
}


function transform(
  path: string,
  value: any,
  serializables: readonly (ShadowSerializeableClass | ShadowDbSerializeableClass)[],
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
    const Class: any = findClass(value.class, serializables);

    if (!Class) {
      throw new Error(
        `Forgot to include class ${value.class} when using deserialize`
      );
    }

    if (value.db)
      throw new Error(
        `Cannot instantiate class ${value.class} because it requires a reference to the database, which is not supported on the client`);

    // TODO Differentiate between IpcCall and ServerIpcCall as they are completely different
    const instance = new Class(async (channel: DbIpcChannels, fnName: string, data: any[]) => {
      const serializedReturnValue = await ipcCall(channel, path, fnName, serializeToServer(data));
      if (serializedReturnValue === undefined)
        return undefined;

      return deserialize(serializedReturnValue, serializables, ipcCall)
    }, value.data);

    value = instance;
  }

  return value;
}
