import { TomateMap } from '../src';
import Boat from '../example/custom-classes/boat';

type ExampleData = { value: string; readonly id: string };

describe('TomateMap', () => {
  it('should allow getting a value by ID', () => {
    const map = new TomateMap<ExampleData>();
    map.add({ value: 'foo' });
    const id = map.list()[0].id;
    expect(map.get(id)).toEqual({ id, value: 'foo' });
  });

  it('should allow setting a value by ID', () => {
    const map = new TomateMap<ExampleData>();
    map.add({ value: 'foo' });
    const id = map.list()[0].id;
    map.set(id, { value: 'bar' });
    expect(map.get(id)).toEqual({ id, value: 'bar' });
  });

  it('should allow removing a value by ID', () => {
    const map = new TomateMap<ExampleData>();
    map.add({ value: 'foo' });
    const id = map.list()[0].id;
    map.remove(id);
    expect(map.get(id)).toBeUndefined();
  });

  it('should allow listing all values', () => {
    const map = new TomateMap<ExampleData>();
    map.add({ value: 'foo' });
    map.add({ value: 'bar' });
    expect(map.list()).toEqual([
      { id: expect.any(String), value: 'foo' },
      { id: expect.any(String), value: 'bar' },
    ]);
  });

  it('should return the correct length', () => {
    const map = new TomateMap<ExampleData>();
    map.add({ value: 'foo' });
    map.add({ value: 'bar' });
    expect(map.length()).toBe(2);
  });

  it('should generate an ID when adding a value without an ID', () => {
    const map = new TomateMap<ExampleData>();
    map.add({ value: 'foo' });
    expect(map.list()[0].id).toEqual(expect.any(String));
  });

  it('should be able to use serializeable classes', () => {
    const map = new TomateMap<Boat>();
    const boat = map.add(new Boat());

    expect(map.get(boat.id).id).toBe(boat.id);
    expect(map.get(boat.id).doubleSpeed()).toBe(boat.data.speed * 2);
  });
});
