import { TextMessage } from '../framework/models/message';
import { AbstractBot } from '../framework/core/abstract-bot';
import { MessageWithKeyboardPush, MessagePush } from '../framework/models/push';
import { ReplyKeyboardMarkup, KeyboardButtonRow, KeyboardButton } from 'framework/models/reply-keyboard-markup';
import { Message } from '../framework/models/message';
import * as Map from '../framework/map.json';
import { OpenWeatherService } from './open-weather.service';
import { Injectable } from '@nestjs/common';
import { ProcessorLink } from '../framework/services/processor.service';
import { Weather } from '../models/weather';
import { InlineKeyboardButton, InlineKeyboardButtonRow, InlineKeyboardMarkup } from '../framework/models/inline-keyboard-markup';
import { Command } from '../framework/core/command';
import { CallbackQuery, Update } from '../framework/models/update';
import { MonitoredCitiesEntity } from '../entities/monitored-cities.entity';
import * as moment from 'moment';
import { MonitoredCitiesService } from './monitored-cities.service';
import { Observable } from 'rxjs';

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
        this.send(new MessageWithKeyboardPush(
          new TextMessage(
            'Hi! My name is Weather. Bot, I tell weather. ☂️☀️⛅️\r\n' +
            'Use the buttonboard to request the weather forecast for your current location or specify a city by name.\r\n' +
            'For better results please narrow your search by adding a postal code or a country.',
          ),
          new ReplyKeyboardMarkup([
            new KeyboardButtonRow([
              new KeyboardButton('🌂 Local forecast', true),
            ]),
          ]),
        ), update).subscribe();
    }
  }

  onCallbackQuery(query: CallbackQuery, update: Update) {
    const botAction: {action: string, city: string} = JSON.parse(query.data);

    switch (botAction.action) {
      case 'monitor': {
        this.addMonitoredCity(botAction.city, update.userId, update.feedId).subscribe(item => {
          this.send(new MessageWithKeyboardPush(
            new TextMessage(
              `${botAction.city} has been added to monitoring list.
              Whenever there is a change which involves rain, storm, snowfall or anything worth attention, I will let you know.`,
            ),
            new ReplyKeyboardMarkup([
              new KeyboardButtonRow([
                new KeyboardButton('🌂 Local forecast', true),
              ]),
            ]),
          ), update).subscribe();
        });
        break;
      }
      case 'unsubscribe': {
        this.monitoredService.remove(update.userId, botAction.city).then(() => {
          this.send(new MessageWithKeyboardPush(
            new TextMessage(
              `You unsubscribed from ${botAction.city} weather notifications`,
              new InlineKeyboardMarkup(
                [new InlineKeyboardButtonRow(
                  [new InlineKeyboardButton(`Monitor ${botAction.city}'s weather`, `{"action": "monitor", "city": "${botAction.city}"}`)],
                )],
              ),
            ),
            new ReplyKeyboardMarkup([
              new KeyboardButtonRow([
                new KeyboardButton('🌂 Local forecast', true),
              ]),
            ]),
          ), update).subscribe();
        });
      }
    }
  }

  onMessage(message: Message, update) {
    switch (message.kind) {
      case Map.MessageKind.text:
        this.api.getForecastByCity(message.payload).subscribe(weather => {
          const text = this.formatCityResponse(weather);
          this.send(new MessagePush(
            new TextMessage(
              text,
              new InlineKeyboardMarkup(
                [new InlineKeyboardButtonRow(
                  [new InlineKeyboardButton(`Monitor ${weather.city}'s weather`, `{"action": "monitor", "city": "${weather.city}"}`)],
                )],
              ),
            ),
          ), update).subscribe();
        });
        break;
      case Map.MessageKind.map:
        this.api.getForecastByGeo(message.geo[0], message.geo[1]).subscribe(weather => {
          const text = this.formatCityResponse(weather);
          this.send(new MessagePush(
            new TextMessage(
              text,
              new InlineKeyboardMarkup(
                [new InlineKeyboardButtonRow(
                  [new InlineKeyboardButton(`Monitor ${weather.city}'s weather`, `{"action": "monitor", "city": "${weather.city}"}`)],
                )],
              ),
            ),
          ), update).subscribe();
        });
        break;
    }
  }

  weatherChangeNotification(weather: Weather, entity: MonitoredCitiesEntity) {
    // console.log(weather, entity);
    if (!weather.now.badConditions()) {
      return;
    }

    const credentials = {
      feedType: 1,
      userId: entity.userId,
      feedId: entity.feedId,
    } as Update;

    this.send(new MessageWithKeyboardPush(
      new TextMessage(
        `Looks like it's ${weather.now.badConditions().description.toLowerCase()} in ${weather.city}. Be careful`,
        new InlineKeyboardMarkup(
          [new InlineKeyboardButtonRow(
            [new InlineKeyboardButton(
              `Unsubscribe from ${weather.city} weather notifications`, `{"action": "unsubscribe", "city": "${weather.city}"}`)],
          )],
        ),
      ),
      new ReplyKeyboardMarkup([
        new KeyboardButtonRow([
          new KeyboardButton('🌂 Local forecast', true),
        ]),
      ]),
    ), credentials).subscribe();
  }

  private addMonitoredCity(city: string, userId: string, feedId: string): Observable<MonitoredCitiesEntity> {
    const item = new MonitoredCitiesEntity();
    item.city = city;
    item.createdAt = moment().unix();
    item.feedId = feedId;
    item.userId = userId;

    return this.monitoredService.add(item);
  }

  private formatCityResponse(weather: Weather): string {
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

    text += `
      To monitor this location for sudden weather changes click the button below:
    `;

    return text;
  }
}
