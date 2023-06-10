import { get } from 'lodash';
import Database, { ShadowTomateMap } from '../../src';
import { DbIpcChannels, IpcDbConnection, serialize } from '../../src/ipc';
import Boat from './boat';
import { DatabaseData, database, database as databaseBackend } from './db';
import ShadowBoat from './boat.shadow';
import deserialize from '../../src/serializer';
import { inspect } from 'util';

let p = 0;
// Normally this data would be send using something like ipcMain and ipcRenderer in electron
async function backendTest(channel: DbIpcChannels, ...data: string[]) {
  console.log('Interacted with backend', ++p, 'times')

  if (channel === 'get-db-data') {
    return serialize(
      data[0] ? get(databaseBackend, data[0]) : databaseBackend
    );
  }
  if (channel === 'db-function') {
    const Class = get(databaseBackend, data[0]);

    if (!Class) {
      throw new Error(`Could not find ${data[0]}`)
    }

    const funcReturnValue = await Class[data[1]](...Object.values(deserialize(data[2], [Boat], database)));

    return serialize(funcReturnValue);
  }

  throw new Error('Unknown channel');
}

databaseBackend.data.boats.set('1', new Boat({ name: 'Titanic', speed: 0 }));

async function test() {
  const classes = [ShadowBoat, ShadowTomateMap];
  const ipc = new IpcDbConnection<Database<DatabaseData>, typeof classes>(
    backendTest,
    classes
  );
  const databaseFrontend = await ipc.getData('');
  const speed = await databaseFrontend.data.boats.get('1').doubleSpeed();
  const speed2 = await databaseFrontend.data.boats.get('1').foo('avc');

  console.log(speed);
  console.log(speed2);

  await databaseFrontend.data.boats.set('2', new Boat({ name: 'blub', speed: -1 }));

  console.log(databaseBackend.data.boats.get('2'));
  console.log(databaseFrontend.data.boats.get('2'));

  const newBoat = new ShadowBoat(ipc.ipcCall, { name: 'A name', speed: 20 });
  await databaseFrontend.data.boats.add(newBoat as never);

  console.log(inspect(databaseFrontend, { depth: null }));
  console.log(inspect(databaseBackend, { depth: null }));
}

test();
