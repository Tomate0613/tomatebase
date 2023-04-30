import Database, { TomateMap, Reference, TomateMappable } from '../../src';

type Friend = {
  relation: 'good' | 'bad';
  person: Reference<Person>;
} & TomateMappable;

type Person = {
  name: string;
  friends: TomateMap<Friend>;
} & TomateMappable;

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
