import Database, { TomateMap } from '../../src';
import Boat from './boat';

export type DatabaseData = {
  boats: TomateMap<Boat>;
};

export const database = new Database<DatabaseData>(
  'database/db.json',
  {
    boats: new TomateMap(),
  },
  [Boat]
);

database.data.boats.add(new Boat());

export default database.data;
