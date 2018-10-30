import * as Hydrator from './hydrator';
import * as Erl from './erlb';
import { Injectable } from '@nestjs/common';
import { Message } from './message';

@Injectable()
export class HydratorService {
  encode(message: Message) {
    // console.log('GENERATE: ' + JSON.stringify(Hydrator.generateEntity(message.entityName, message)));
    // console.log('ENCODE: ' + term);
    // const buffer = Erl.encode(term);
    // const arr = new Uint8Array(buffer);
    // let str = '';
    // for (let x = 0; x < arr.length; x++) {
    //   str += arr[x] + ',';
    // }
    // console.log('BINARY: ', str);
    const term = Hydrator.encode(message.entityName, Hydrator.generateEntity(message.entityName, message));
    return Erl.encode(term);
  }

  decode(data) {
    const term = Erl.decode(data);
    return Hydrator.decode(term);
  }
}
