import { TextMessage } from './framework/models/message';
import { AbstractBot } from './framework/core/abstract-bot';
import { MessageWithKeyboardPush, MessagePush } from './framework/models/push';
import { ReplyKeyboardMarkup, KeyboardButtonRow, KeyboardButton } from 'framework/models/reply-keyboard-markup';
import { Message } from './framework/models/message';
import * as Map from './framework/map.json';
import { OpenWeatherService } from './services/open-weather.service';
import { Injectable } from '@nestjs/common';
import { ProcessorLink } from './framework/services/processor.service';

@Injectable()
export class WeatherBot extends AbstractBot {
  constructor(processorLink: ProcessorLink, private api: OpenWeatherService) {
    super(processorLink);
  }

  onCommand(command, update) {
    switch (command) {
      case 'start':
        this.send(new MessageWithKeyboardPush(
          new TextMessage(
            'Hi! My name is Weather. Bot, I tell weather. ☂️☀️⛅️\r\n' +
            'Use the buttonboard to request the weather forecast for your current location or specify a city by name.\r\n' +
            'For better results please narrow your search by adding a postal code or a country.'
          ),
          new ReplyKeyboardMarkup([
            new KeyboardButtonRow([
              new KeyboardButton('🌂 Local forecast'),
            ]),
          ])
        ), update).subscribe();
    }
  }

  onMessage(message: Message, update) {
    switch (message.kind) {
      case Map.MessageKind.text:
        this.api.getCurrentByCity(message.payload).subscribe(weather => {
          const text = `Currently in ${weather.city}, ${weather.country}:\n` +
            `${weather.tempInCelsius}°C / ${weather.tempInFahrenheit}F, ${weather.description}`;
          this.send(new MessagePush(new TextMessage(text)), update).subscribe();
        });
        break;
      case Map.MessageKind.map:
        this.send(new MessagePush(new TextMessage('Weather in Cherkassy: shit')), update).subscribe();
        break;
    }
  }

}
