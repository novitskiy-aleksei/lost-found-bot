import { AbstractBot } from '../framework/core/abstract-bot';
import { MessageWithKeyboardPush, MessagePush } from '../framework/models/push';
import { KeyboardButton } from 'framework/models/reply-keyboard-markup';
import { Message } from '../framework/models/message';
import * as Map from '../framework/map.json';
import { OpenWeatherService } from './open-weather.service';
import { Injectable } from '@nestjs/common';
import { ProcessorLink } from '../framework/services/processor.service';
import { Weather } from '../models/weather';
import { InlineKeyboardButton } from '../framework/models/inline-keyboard-markup';
import { Command } from '../framework/core/command';
import { CallbackQuery, Update } from '../framework/models/update';
import { MonitoredCitiesEntity } from '../entities/monitored-cities.entity';
import * as moment from 'moment';
import { MonitoredCitiesService } from './monitored-cities.service';

@Injectable()
export class WeatherBotService extends AbstractBot {

  constructor(processorLink: ProcessorLink,
              private api: OpenWeatherService,
              private monitoredService: MonitoredCitiesService) {
    super(processorLink);
  }

  getCommands(): Command[] {
    return [
      new Command('/start', ''),
    ];
  }

  onCommand(command, update) {
    switch (command) {
      case '/start':
        const msg = new MessageWithKeyboardPush();
        const text = 'Hi! My name is WeatherBot, I tell weather. ☂️☀️⛅️\r\n' +
          'Use the buttonboard to request the weather forecast for your current location or specify a city by name.\r\n' +
          'For better results please narrow your search by adding a postal code or a country.';

        msg.textMessage(text);
        msg.replyKeyboard()
          .addRow([
            new KeyboardButton('🌂 Local forecast', true),
          ])
        ;
        this.send(msg, update).subscribe();
    }
  }

  async onCallbackQuery(query: CallbackQuery, update: Update) {
    const botAction: {action: string, city: string} = JSON.parse(query.data);

    switch (botAction.action) {
      case 'monitor': {
        const item = new MonitoredCitiesEntity();
        item.city = botAction.city;
        item.createdAt = moment().unix();
        item.feedId = update.feedId;
        item.userId = update.userId;

        this.monitoredService.add(item).subscribe(() => {
          const text = `${botAction.city} has been added to monitoring list.
              Whenever there is a change which involves rain, storm, snowfall or anything worth attention, I will let you know.`;
          const message = new MessageWithKeyboardPush();
          message.textMessage(text);
          message.replyKeyboard()
            .addRow([new KeyboardButton('🌂 Local forecast', true)]);

          this.send(message, update);
        });
        break;
      }

      case 'unsubscribe': {
        await this.monitoredService.remove(update.userId, botAction.city);
        const message = new MessageWithKeyboardPush();
        message.textMessage(`You unsubscribed from ${botAction.city} weather notifications`)
          .inlineKeyboard()
            .addRow([
              new InlineKeyboardButton(`Monitor ${botAction.city}'s weather`, `{"action": "monitor", "city": "${botAction.city}"}`),
            ]);
        message.replyKeyboard()
          .addRow([new KeyboardButton('🌂 Local forecast', true)]);

        this.send(message, update);
      }
    }
  }

  async onMessage(message: Message, update) {
    switch (message.kind) {
      case Map.MessageKind.text:
        const weather = await this.api.getForecastByCity(message.payload).toPromise();
        const msg = new MessagePush();
        const text404 = 'City not found';
        const text = weather ? this.formatCityResponse(weather) : text404;
        msg.textMessage(text);

        if (weather) {
          // if already subscribed - don't show button
          const exist = await this.monitoredService.findOne({city: weather.city, userId: update.userId});
          if (!exist) {
            msg.textMessage().inlineKeyboard()
              .addRow([
                new InlineKeyboardButton(`Monitor ${weather.city}'s weather`,
                  `{"action": "monitor", "city": "${weather.city}"}`),
              ]);
          } else {
            msg.textMessage().text(this.formatCityResponse(weather, false));
          }
        }

        this.send(msg, update).subscribe();
        break;

      case Map.MessageKind.map:
        const weather1 = await this.api.getForecastByGeo(message.geo[0], message.geo[1]).toPromise();
        const msg1 = new MessagePush();
        msg1.textMessage(this.formatCityResponse(weather1))
          .inlineKeyboard()
          .addRow([
            new InlineKeyboardButton(`Monitor ${weather1.city}'s weather`,
              `{"action": "monitor", "city": "${weather1.city}"}`),
          ]);
        this.send(msg1, update).subscribe();
        break;
    }
  }

  weatherChangeNotification(weather: Weather, entity: MonitoredCitiesEntity) {
    if (!weather.now.badConditions()) {
      return;
    }

    const credentials = {feedType: 1, userId: entity.userId, feedId: entity.feedId} as Update;
    const msg = new MessageWithKeyboardPush();
    const description = weather.now.badConditions().description.toLowerCase();
    const buttonTitle = `Unsubscribe from ${weather.city} weather notifications`;

    msg.textMessage(`Looks like it's ${description} in ${weather.city}. Be careful`)
      .inlineKeyboard()
        .addRow([new InlineKeyboardButton(buttonTitle, `{"action": "unsubscribe", "city": "${weather.city}"}`)]);
    msg.replyKeyboard()
      .addRow([new KeyboardButton('🌂 Local forecast', true)]);

    this.send(msg, credentials).subscribe();
  }

  private formatCityResponse(weather: Weather, subscribeNote = true): string {
    let text =
      `Currently in ${weather.city}, ${weather.country}:
      ${weather.now.tempInCelsius()}°C / ${weather.now.tempInFahrenheit()}F`;
    text += weather.now.weather.map(w => ', ' + w.description);

    const tomorrow = weather.forecastForTomorrow();
    if (tomorrow) {
      text += `\n
        Tommorow at noon:
        ${tomorrow.tempInCelsius()}°C / ${tomorrow.tempInFahrenheit()}F`;
      text += tomorrow.weather.map(w => ', ' + w.description);
    }

    if (subscribeNote) {
      text += `\n\nTo monitor this location for sudden weather changes click the button below:`;
    }

    return text;
  }
}
