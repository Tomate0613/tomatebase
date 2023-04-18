import { Reference, TomateMap } from '../../src';
import db, { database } from './db';

const person1 = db.people.add({
  name: 'Person1',
  friends: new TomateMap(),
});

const person2 = db.people.add({
  name: 'Person2',
  friends: new TomateMap(),
});

const person3 = db.people.add({
  name: 'Person3',
  friends: new TomateMap(),
});

person1.friends.add({
  relation: 'good',
  person: new Reference(database, `people.data.${person2.id}`),
});

person2.friends.add({
  relation: 'bad',
  person: new Reference(database, `people.data.${person3.id}`),
});

person1.friends.list().forEach((friend1) => {
  friend1.person.value.friends.list().forEach((friend2) => {
    console.log(friend2.person.value.name);
  });
});
