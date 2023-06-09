// Automatically generated by tomatebase-cli
import { IpcCall, TomateMappable } from '../../src';
import { DefaultSerializable } from '../../src/serializer';
import { BoatData } from './boat';

export default class ShadowBoat
  extends DefaultSerializable<BoatData>
  implements TomateMappable
{
  ipcCall: IpcCall;
  id: string;
  static className = 'ThisIsABoat';
  constructor(ipcCall: IpcCall, data?: BoatData) {
    super(data ?? { name: 'DefaultName', speed: 3 });
    this.id = '';
    this.ipcCall = ipcCall;
  }
  doubleSpeed() {
    return this.data.speed * 2;
  }

  foo(bar: string) {
    this.ipcCall('db-function', 'Boat', 'foo', arguments);
  }
}