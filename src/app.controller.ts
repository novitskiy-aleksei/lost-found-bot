import { Controller, Post, Body, Logger } from '@nestjs/common';
import { BotResponseService } from './weather/bot-response.service';
import { Subscription } from 'rxjs';
import { ConnectApiService } from './framework/api.service';
import { Message } from './framework/message';
import { BotResponse } from './weather/bot-response';

@Controller()
export class AppController {
  private logger: Logger;
  private sendSub: Subscription;
  private timeCorrection: number = 0;

  constructor(private api: ConnectApiService,
              private botResponses: BotResponseService) {
    this.logger = new Logger('Bot');
    this.api.call('im', {entityName: 'ChatUpdates'})
      .subscribe(response => {
        this.timeCorrection = response.serverTime - Date.now();
      });
  }

  @Post()
  webhook(@Body() message: Message) {
    this.sendSub = this.botResponses.byCommand(message.message.payload, message)
      .subscribe((botResponse: BotResponse) => {
        console.log(this.timeCorrection);
        this.api.call('im', {
          entityName: 'BotSendMessage',
          feedType: message.feedType,
          feedId: message.feedId,
          userId: message.userId,
          message: {
            kind: 1,
            created: Date.now() + this.timeCorrection,
            payload: botResponse.text,
          },
          replyKeyboardMarkup: {
            buttonRows: [
              {buttons: [{text: '🌂 Send location', requestLocation: true}]},
            ],
          },
        }).subscribe(() => this.sendSub.unsubscribe());
    });

    return;
  }
}
