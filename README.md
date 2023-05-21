# Tomatebase
Propably the worst "database" ever

## Installation
### NPM
`npm install https://github.com/Tomate0613/tomatebase`
### Manual installation
- Download repo
- Install dependencies using `npm i`
- Build using `npm prepare` or `npx tsc`
- Use dist folder

## Getting started
To start using Tomatebase, create a new database instance and define the data structure for your database.

#### db.ts
```TS
import Database, { TomateMap, TomateMappable } from 'tomatebase';

type WorldData = {
  name: string;
  lastPlayed: number;
} & TomateMappable;

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
  [TomateMap],
);

export default database.data;
```

Notice that we had to add 'TomateMap' to the array passed to the constructor of the Database. We will have to do that with every serializable class we want to use.

With your database structure defined, you can start using the database in your code:
#### main.ts
```TS
import db from './db';

// Volume
console.log(`The volume is ${db.settings.volume}%`);

// Add a world to the list
const newWorld = db.worlds.add({
  name: 'A new world',
  lastPlayed: Date.now(),
});

// List all worlds
db.worlds.list().forEach((world) => console.log(world.name));

// Replace the world
db.worlds.set(newWorld.id, {
  name: 'Replacement',
  lastPlayed: Date.now(),
});

// Remove the world
db.worlds.remove(newWorld.id);
```

To save the database we can run 
```TS
database.save()
```
in the db.ts file at any time

## References
If we want to reference another piece of data in the database we can use the Reference class like this

#### db.ts
```TS
import Database, { TomateMap, Reference, TomateMappable } from 'tomatebase';

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
```

#### main.ts
```TS
import { Reference, TomateMap } from 'tomatebase';
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
```
This will change in the future as the current approach can be massively improved

## Own classes
To use your own classes you can do the following

#### boat.ts
```TS
import { Serializable } from 'tomatebase';

type BoatData = {
  name: string;
  speed: number;
};

export default class Boat extends DefaultSerializable<BoatData> {}
```

You can now use the boat data anywhere in your class
```TS
export default class Boat extends DefaultSerializable<BoatData> {
  doubleSpeed() {
    return this.data.speed * 2;
  }
}
```

The constructor for your class will be
```TS
new Boat({
  name: 'BoatName',
  speed: 3,
});
```

But you can also customize this
```TS
export default class Boat extends DefaultSerializable<BoatData> {
  constructor(data?: BoatData) {
    super(data ?? { name: 'DefaultName', speed: 3 });
  }

  doubleSpeed() {
    return this.data.speed * 2;
  }
}
```

Remember to now add `Boat` to the array
```TS
const database = new Database<DatabaseData>(
  'database/db.json',
  {
    boat: new Boat(),
  },
  [Boat] // <--
);
```

You can also not use the Serializeable class and manually implement serializing and deserializing data. For this you need the following

- A constructor that takes the serialized data
- A toJSON function that uses the following format
```TS
  toJSON() {
    return {
      data: 'The serialized data of your class, this will be passed to the constructor. This can be of any type',
      class: this.constructor.name,
    };
  }
```
- If you need a reference to the database in your class, you can change your constructor to also take a Database as the first argument. If you do that your toJSON function has to look like this
```TS
  toJSON() {
    return {
      data: 'The serialized data of your class, this will be passed to the constructor. This can be of any type',
      class: this.constructor.name,
      db: true,
    };
  }
```

## The IPC system
Tomatebase provides an IPC system for interacting with a database in an Electron application. (This system can also be used in any other server/client scenarios but some additional security checks might be needed).
The IpcDbConnection class allows you to make calls to the backend database via IPC from the renderer process.

This system is still in development and should not be used yet.