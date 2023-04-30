import Database, { FsMap } from '../src';
import fs from 'fs';

const createDb = () => {
  return new Database<{
    test: FsMap<{ data: string; readonly id: string; readonly folder: string }>;
  }>(
    'test/fsMapTest/db.json',
    {
      test: new FsMap(null, {
        path: 'test/fsMapTest/something',
      }),
    },
    [FsMap]
  );
};

describe('FsMap', () => {
  it('should be serializeable and deserializable', () => {
    fs.rmSync('test/fsMapTest', { recursive: true });

    const db1 = createDb();

    db1.data.test.set('test', { data: 'test' });
    const test2 = db1.data.test.add({ data: 'test2' });

    db1.save();

    const db2 = createDb();

    expect(db2.data.test.get('test')).toStrictEqual({
      id: 'test',
      data: 'test',
      folder: 'test/fsMapTest/something/test',
    });
    expect(db2.data.test.get(test2.id)).toStrictEqual({
      id: test2.id,
      data: 'test2',
      folder: `test/fsMapTest/something/${test2.id}`,
    });
  });
});
