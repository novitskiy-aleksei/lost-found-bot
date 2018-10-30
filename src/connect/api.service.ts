import { Injectable, HttpService, Logger } from '@nestjs/common';
import * as querystring from 'querystring';
import { AxiosRequestConfig } from 'axios';
import { InjectConfig } from 'nestjs-config';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HydratorService } from './hydrator.service';
import { Message } from './message';
import { Utils } from './utils';

@Injectable()
export class ConnectApiService {
  private logger: Logger;

  constructor(@InjectConfig() private config,
              private hydrator: HydratorService,
              private http: HttpService) {
    this.logger = new Logger('API');
  }

  call(server: 'im' | 'id', message: Message): Observable<any> {
    this.logger.log('Send message to backend: ' + JSON.stringify(message));

    const body = Buffer.from(this.hydrator.encode(message));
    const params = {
      version: this.config.get('connect.version'),
      token: this.config.get('connect.accessToken'),
    };
    const baseUrl = this.config.get('connect.protocol') + '://' + this.config.get('connect.url') + '/api/v1';
    const url = baseUrl + (server === 'id' ? '/id' : '') + '?' + querystring.stringify(params);
    const config: AxiosRequestConfig = {
      responseType: 'arraybuffer',
      headers: {'Content-Type': 'application/binary'},
    };

    return this.http.post(url, body, config).pipe(map(response => {
      return this.hydrator.decode(Utils.toArrayBuffer(response.data));
    }));
  }
}
