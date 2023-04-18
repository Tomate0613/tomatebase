import Database from '../../src';
import Boat from './boat';

type DatabaseData = {
  boat: Boat;
};

const database = new Database<DatabaseData>(
  'db.json',
  {
    boat: new Boat(),
  },
  [Boat]
);

export default database.data;
