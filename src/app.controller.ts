import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ConnectApiService } from './connect/api.service';
import { Message } from './connect/message';

@Controller()
export class AppController {
  private logger: Logger;

  constructor(private api: ConnectApiService) {
    this.logger = new Logger('Bot');
  }

  @Post()
  webhook(@Body() message: Message) {
    this.api.call('im', {
      entityName: 'BotSendMessage',
      feedType: message.feedType,
      feedId: message.feedId,
      message: {
        kind: 1,
        payload: 'Echo ' + message.message.payload,
      },
    }).subscribe();
    return '';
  }
}
