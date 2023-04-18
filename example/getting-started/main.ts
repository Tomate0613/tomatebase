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
