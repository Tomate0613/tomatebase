import { Serializable } from '../../src/serializer';

type BoatData = {
  name: string;
  speed: number;
};

export default class Boat extends Serializable<BoatData> {
  constructor(data?: BoatData) {
    super(data ?? { name: 'DefaultName', speed: 3 });
  }

  doubleSpeed() {
    return this.data.speed * 2;
  }
}
