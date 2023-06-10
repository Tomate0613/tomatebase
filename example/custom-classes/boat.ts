import { TomateMappable } from '../../src/map';

export type BoatData = {
  name: string;
  speed: number;
};

/**
 * @shadowable
 */
export default class Boat implements TomateMappable {
  id: string;
  data: BoatData;
  static className = 'ThisIsABoat';

  constructor(data: BoatData | { data: BoatData, id: string }) {
    if ('id' in data) {
      this.id = data.id;
      this.data = data.data;
      return;
    }

    this.data = data;
    this.id = 'temp-should-be-replaced-by-map';
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

  /**
   * @client
   */
  toJSON() {
    return { data: { data: this.data, id: this.id }, class: Boat.className }
  }
}
