import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ConnectApiService } from './connect/api.service';
import { Message } from './connect/message';
import { BotResponseService } from './weather/bot-response.service';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

@Controller()
export class AppController {
  private logger: Logger;
  private sendSub: Subscription;

  constructor(private api: ConnectApiService,
              private botResponses: BotResponseService) {
    this.logger = new Logger('Bot');
  }

  @Post()
  webhook(@Body() message: Message) {
    this.sendSub = this.botResponses.byCommand(message.message.payload, message)
      .subscribe(botResponse => {
        this.api.call('im', {
          entityName: 'BotSendMessage',
          feedType: message.feedType,
          feedId: message.feedId,
          message: {
            kind: 1,
            payload: botResponse,
            created: moment().unix(),
          },
        }).subscribe(() => this.sendSub.unsubscribe());
    });

    return;
  }
}
