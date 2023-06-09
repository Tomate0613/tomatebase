import { memoize } from 'lodash';
import deserialize, { DbSerializeableClass, SerializeableClass } from './serializer';
import { GetTypeFromPath, PathInto } from './types/path';
import Database from './database';

export type DbIpcChannels = 'get-db-data' | 'db-function';
export type IpcCall = (channel: DbIpcChannels, ...data: any[]) => Promise<any>;

const getData = async <Path extends string, DB>(
  path: Path,
  ipcCall: IpcCall,
  serializeableClasses: (SerializeableClass | DbSerializeableClass)[]
): Promise<GetTypeFromPath<DB, Path>> => {
  const db = await ipcCall('get-db-data', path);
  return deserialize(db as string, serializeableClasses);
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