import Database, { TomateMap } from '../../src';
import Boat from './boat';

type DatabaseData = {
  boats: TomateMap<Boat>;
};

const database = new Database<DatabaseData>(
  'database/db.json',
  {
    boats: new TomateMap(),
  },
  [Boat]
);

database.data.boats.add(new Boat());

export default database.data;
