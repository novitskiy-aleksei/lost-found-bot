import { HydratorService } from './hydrator.service';
import { NestMiddleware, MiddlewareFunction, Injectable, Logger } from '@nestjs/common';
import { Utils } from './utils';

@Injectable()
export class ConnectProtocolMiddleware implements NestMiddleware {
  private logger: Logger;

  constructor(private hydrator: HydratorService) {
    this.logger = new Logger('API');
  }

  resolve(...args: any[]): MiddlewareFunction {
    return (req, res, next) => {
      const body = [];
      req.on('data', chunk => {
        body.push(chunk);
      });
      req.on('end', () => {
        const rawBody = Buffer.concat(body);
        req.body = this.hydrator.decode(Utils.toArrayBuffer(rawBody));
        this.logger.log('Got message from backend: ' + JSON.stringify(req.body));
        next();
      });
    };
  }
}
