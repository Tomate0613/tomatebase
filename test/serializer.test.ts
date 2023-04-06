import deserialize, { Serializable } from '../src/serializer';

interface TestData {
  name: string;
  address: string;
  anotherData?: TestData;
}

class Person extends Serializable<TestData> {
  get name() {
    return this.data.name;
  }

  get address() {
    return this.data.address;
  }

  get another() {
    return this.data.anotherData;
  }
}

describe('Serializeable', () => {
  it('should serialize to json', () => {
    const tomate = new Person({
      name: 'Tomate0613',
      address: 'somewhere',
    });

    const cortex = new Person({
      name: 'Cortex',
      address: 'somewhere else',
      anotherData: tomate,
    });

    return expect(JSON.parse(JSON.stringify(cortex))).toStrictEqual({
      data: {
        name: 'Cortex',
        address: 'somewhere else',
        anotherData: {
          data: { name: 'Tomate0613', address: 'somewhere' },
          class: 'Person',
        },
      },
      class: 'Person',
    });
  });
  it('should deserialize from json', () => {
    const cortex: Person = deserialize(
      JSON.stringify({
        data: {
          name: 'Cortex',
          address: 'somewhere else',
          anotherData: {
            data: { name: 'Tomate0613', address: 'somewhere' },
            class: 'Person',
          },
        },
        class: 'Person',
      }),
      [Person]
    );

    expect(cortex.another?.name).toBe('Tomate0613');
  });
});
