import { TomateMappable } from '../../src/map';
import { DefaultSerializable } from '../../src/serializer';

export type BoatData = {
  name: string;
  speed: number;
};

/**
 * @shadowable
 */
export default class Boat extends DefaultSerializable<BoatData> implements TomateMappable {
  id: string;
  static className = 'ThisIsABoat';

  constructor(data?: BoatData) {
    super(data ?? { name: 'DefaultName', speed: 3 });
    this.id = '';
  }

  /**
   * @client
   */
  doubleSpeed() {
    return this.data.speed * 2;
  }

  foo(bar: string) {
    return Math.round(this.data.speed * Math.random() * 100) + bar.toString();
  }
}
