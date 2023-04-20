import Database, { TomateMap, Reference } from '../src';

type Person = {
  readonly id: string;

  name: string;
  phone: Reference<Phone>;
};

type Phone = {
  readonly id: string;

  number: number;
  name: string;
};
describe('Reference', () => {
  const database = new Database(
    'test/db.json',
    {
      people: new TomateMap<Person>(),
      phones: new TomateMap<Phone>(),
    },
    [TomateMap, Reference]
  );

  const db = database.data;

  const phone = db.phones.add({
    name: 'Phone1',
    number: 1234,
  });

  const phone2 = db.phones.add({
    name: 'Phone2',
    number: 4321,
  });

  const person = db.people.add({
    name: 'Tomate0613',
    phone: new Reference(database, `phones.data.${phone.id}`),
  });

  it('should create a working reference', () => {
    expect(person.phone.value.number).toBe(1234);
  });

  database.save();
  const newDatabase = new Database(
    'test/db.json',
    {
      people: new TomateMap<Person>(),
      phones: new TomateMap<Phone>(),
    },
    [TomateMap, Reference]
  );

  const newDb = newDatabase.data;

  it('should save/load references', () => {
    expect(newDb.people.get(person.id).phone.value.number).toBe(1234);
  });

  it('should be changeable via reference', () => {
    newDb.people.get(person.id).phone.value.number = 123;

    expect(newDb.phones.get(phone.id).number).toBe(123);
  });

  it('should be changeable directly', () => {
    newDb.phones.set(phone.id, {
      number: 12,
      name: 'Phone1b',
    });

    expect(newDb.people.get(person.id).phone.value.number).toBe(12);
  });

  it('should be able to change the reference', () => {
    newDb.people.get(person.id).phone.path = `phones.data.${phone2.id}`;
  });
});
