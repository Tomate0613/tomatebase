import Database, { TomateMap, Reference } from '../../src';

type Friend = {
  relation: 'good' | 'bad';
  person: Reference<Person>;
};

type Person = {
  name: string;
  friends: TomateMap<Friend>;
};

type DatabaseData = {
  people: TomateMap<Person>;
};

export const database = new Database<DatabaseData>(
  'database/db.json',
  {
    people: new TomateMap(),
  },
  [TomateMap, Reference]
);

export default database.data;
