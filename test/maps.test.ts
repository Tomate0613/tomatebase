import { TomateMap } from '../src';

describe('TomateMap', () => {
  it('should allow getting a value by ID', () => {
    const map = new TomateMap<{ id: string; value: string }>();
    map.add({ value: 'foo' });
    const id = map.list()[0].id;
    expect(map.get(id)).toEqual({ id, value: 'foo' });
  });

  it('should allow setting a value by ID', () => {
    const map = new TomateMap<{ id: string; value: string }>();
    map.add({ value: 'foo' });
    const id = map.list()[0].id;
    map.set(id, { value: 'bar' });
    expect(map.get(id)).toEqual({ id, value: 'bar' });
  });

  it('should allow removing a value by ID', () => {
    const map = new TomateMap<{ id: string; value: string }>();
    map.add({ value: 'foo' });
    const id = map.list()[0].id;
    map.remove(id);
    expect(map.get(id)).toBeUndefined();
  });

  it('should allow listing all values', () => {
    const map = new TomateMap<{ id: string; value: string }>();
    map.add({ value: 'foo' });
    map.add({ value: 'bar' });
    expect(map.list()).toEqual([
      { id: expect.any(String), value: 'foo' },
      { id: expect.any(String), value: 'bar' },
    ]);
  });

  it('should return the correct length', () => {
    const map = new TomateMap<{ id: string; value: string }>();
    map.add({ value: 'foo' });
    map.add({ value: 'bar' });
    expect(map.length()).toBe(2);
  });

  it('should allow adding a value with an ID', () => {
    const map = new TomateMap<{ id: string; value: string }>();
    map.add({ id: '123', value: 'foo' });
    expect(map.list()).toEqual([{ id: '123', value: 'foo' }]);
  });

  it('should generate an ID when adding a value without an ID', () => {
    const map = new TomateMap<{ id: string; value: string }>();
    map.add({ value: 'foo' });
    expect(map.list()[0].id).toEqual(expect.any(String));
  });
});
