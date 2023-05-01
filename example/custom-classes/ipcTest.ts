import { get } from 'lodash';
import Database, { TomateMap } from '../../src';
import { DbIpcChannels, IpcDbConnection } from '../../src/ipc';
import Boat from './boat';
import { DatabaseData, database as databaseBackend } from './db';

// Normally this data would be send using something like ipcMain and ipcRenderer in electron
async function backendTest(channel: DbIpcChannels, ...data: string[]) {
  if (channel === 'get-db-data') {
    return JSON.stringify(
      data[0] ? get(databaseBackend, data[0]) : databaseBackend
    );
  }
  if (channel === 'db-function') {
    const Class = get(databaseBackend, data[0]);
    const funcReturnValue = await Class[data[1]](...data[2]);

    return funcReturnValue;
  }

  throw new Error('Unknown channel');
}

databaseBackend.data.boats.set('1', new Boat());

async function test() {
  const classes = [Boat, TomateMap];
  const ipc = new IpcDbConnection<Database<DatabaseData>, typeof classes>(
    backendTest,
    classes
  );
  const databaseFrontend = await ipc.getData('');
  const speed = await databaseFrontend.data.boats.get('1').doubleSpeed();
  const speed2 = await databaseFrontend.data.boats.get('1').foo('avc');

  console.log(speed);
  console.log(speed2);

  await databaseFrontend.data.boats.set('2', new Boat());

  console.log(databaseBackend.data.boats.get('2'));
  console.log(databaseFrontend.data.boats.get('2'));
}

test();