import { Push } from 'framework/models/push';
import { AbstractBot } from '../framework/core/abstract-bot';
import { Message } from '../framework/models/message';
import * as Map from '../framework/map.json';
import { MyPetsService } from './my-pets.service';
import { Injectable } from '@nestjs/common';
import { ProcessorLink } from '../framework/services/processor.service';
import { Pet } from '../models/pet';
import { Command } from '../framework/core/command';
import { CallbackQuery, ChosenInlineResult, InlineQuery, Update } from '../framework/models/update';
import { MonitoredCitiesEntity } from '../entities/monitored-cities.entity';
import * as moment from 'moment';
import { MonitoredCitiesService } from './monitored-cities.service';
import { InlineQueryResultArticle } from '../framework/models/inline-query-result';
import { text } from 'body-parser';

@Injectable()
export class LostNFoundService extends AbstractBot {

  // todo: remove this!
  private lost = false;

  constructor(processorLink: ProcessorLink,
              private api: MyPetsService,
              private monitoredService: MonitoredCitiesService) {
    super(processorLink);
  }

  getCommands(): Command[] {
    return [new Command('/start', '')];
  }

  onCommand(command, update) {
    switch (command) {
      case '/start':
        const txt = 'Hi! My name is Lost\'n\'Found bot, I will help find to your pet️\r\n';
        const push = this.createPush()
          .setTextMessage(txt, [
            [{text: 'Select which pet is lost', callbackData: `{"action": "pet_list"}`}],
            // [{text: 'I found/saw pet', callbackData: `{"action": "pet_found"}`}],
          ])
        ;
        this.send(push, update).subscribe();
    }
  }

  async onCallbackQuery(query: CallbackQuery, update: Update) {
    const botAction: {action: string, value: string} = JSON.parse(query.data);

    switch (botAction.action) {
      case 'pet_list': {
        this.lost = false;
        const petList = await this.api.getMyPets().toPromise();
        const push = this.createPush()
        .setTextMessage(
          `\r\nOh no! I hope we will find him. Please, select lost pet card\r\n`,
          [
            petList.map(pet => ({
              text: pet.name,
              callbackData: `{"action": "pet_select", "value": "${pet.id}"}`,
            })),
          ],
        );
        this.send(push, update).subscribe();
        break;
      }

      case 'pet_select': {
        const petId = botAction.value;
        // todo: save petId

        const push = this.createPush()
          .setTextMessage(`\r\nThank you. Where it was? Please send me map location\r\n`);
        this.send(push, update).subscribe();
        break;
      }

      case 'pet_found': {
        this.lost = true;
        const push = this.createPush()
          .setTextMessage(`\r\nGreat! Thank you! How it looks like? Send his picture, please\r\n`);
        this.send(push, update).subscribe();
        break;
      }

      // case 'pet_found': {
      //   const push = this.createPush()
      //     .setTextMessage(`\r\nThank you. Where it was? Please send me map location\r\n`);
      //   this.send(push, update).subscribe();
      //   break;
      // }
    }
  }

  async onMessage(message: Message, update) {
    let push: Push;
    // console.log(message, update);
    switch (message.kind) {
      // case Map.MessageKind.text:
        // if (message.payload === 'Select which pet is lost') {
        //   const pets = await this.api.getMyPets();
        // }
        // push = this.createPush();

        // if (weather) {
        //   const isSubscribed = await this.monitoredService.findSubscription(weather.city, update.userId);
        //   if (!isSubscribed) {
        //     push.setTextMessage(this.formatCityResponse(weather), [
        //       [{text: `Monitor ${weather.city}'s weather`, callbackData: `{"action": "monitor", "city": "${weather.city}"}`}],
        //     ]);
          // } else {
          //   push.setTextMessage(this.formatCityResponse(weather, false));
          // }
        // } else {
        //   push.setTextMessage('City not found');
        // }

        // this.send(push, update).subscribe();
        // break;
      // case Map.MessageKind.image: {
      //   push = this.createPush().setTextMessage(
      //     'Thank you. Where do you find him? Send me map location',
      //   );
      //   this.send(push, update).subscribe();
      //   break;
      // }

      case Map.MessageKind.map:
        const messageText = 'Ok, I will send notifications to users in that area. Together we will find him!';
        // if (!this.lost) {
        //   messageText = 'Thx for helping! We will try to contact his owners';
        // }

        // todo: save message.geo
        push = this.createPush().setTextMessage(messageText);
        this.send(push, update).subscribe();
        break;
    }
  }

}
