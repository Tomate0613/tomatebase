import Database, { TomateMap } from '../../src';

type WorldData = {
  name: string;
  lastPlayed: number;
};

type DatabaseData = {
  settings: {
    volume: number;
  };
  worlds: TomateMap<WorldData>;
};

const database = new Database<DatabaseData>(
  'database/db.json',
  {
    settings: {
      volume: 100,
    },
    worlds: new TomateMap(),
  },
  [TomateMap]
);

export default database.data;
