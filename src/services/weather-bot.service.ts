import { Push } from 'framework/models/push';
import { AbstractBot } from '../framework/core/abstract-bot';
import { Message } from '../framework/models/message';
import * as Map from '../framework/map.json';
import { OpenWeatherService } from './open-weather.service';
import { Injectable } from '@nestjs/common';
import { ProcessorLink } from '../framework/services/processor.service';
import { Weather } from '../models/weather';
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
    return [];
  }

  onCommand(command, update) {
    switch (command) {
      case '/start':
        const text = 'Hi! My name is WeatherBot, I tell weather. ☂️☀️⛅️\r\n' +
          'Use the buttonboard to request the weather forecast for your current location or specify a city by name.\r\n' +
          'For better results please narrow your search by adding a postal code or a country.';
        const push = this.createPush()
          .setTextMessage(text)
          .setReplyKeyboard([
            [{text: '🌂 Local forecast', requestLocation: true}],
          ])
        ;
        this.send(push, update).subscribe();
    }
  }

  async onCallbackQuery(query: CallbackQuery, update: Update) {
    const botAction: {action: string, city: string} = JSON.parse(query.data);

    switch (botAction.action) {
      case 'monitor': {
        const text = `${botAction.city} has been added to monitoring list.
            Whenever there is a change which involves rain, storm, snowfall or anything worth attention, I will let you know.`;

        this.monitoredService.findSubscription(botAction.city, update.userId).subscribe(subscription => {
          if (!subscription) {
            const item = new MonitoredCitiesEntity();
            item.city = botAction.city;
            item.createdAt = moment().unix();
            item.feedId = update.feedId;
            item.userId = update.userId;
            this.monitoredService.add(item).subscribe();
          }
        });

        const push = this.createPush().setTextMessage(text);
        this.send(push, update).subscribe();
        break;
      }

      case 'unsubscribe': {
        this.monitoredService.remove(botAction.city, update.userId).subscribe(() => {
          const push = this.createPush()
          .setTextMessage(`\r\nYou unsubscribed from ${botAction.city} weather notifications\r\n`, [
            [{text: `Monitor ${botAction.city}'s weather`, callbackData: `{"action": "monitor", "city": "${botAction.city}"}`}],
          ]);
          this.send(push, update).subscribe();
        });
      }
    }
  }

  async onMessage(message: Message, update) {
    let push: Push;
    switch (message.kind) {
      case Map.MessageKind.text:
        const weather = await this.api.getForecastByCity(message.payload).toPromise();
        push = this.createPush();

        if (weather) {
          const isSubscribed = await this.monitoredService.findSubscription(weather.city, update.userId);
          if (!isSubscribed) {
            push.setTextMessage(this.formatCityResponse(weather), [
              [{text: `Monitor ${weather.city}'s weather`, callbackData: `{"action": "monitor", "city": "${weather.city}"}`}],
            ]);
          } else {
            push.setTextMessage(this.formatCityResponse(weather, false));
          }
        } else {
          push.setTextMessage('City not found');
        }

        this.send(push, update).subscribe();
        break;

      case Map.MessageKind.map:
        const weather1 = await this.api.getForecastByGeo(message.geo[0], message.geo[1]).toPromise();
        push = this.createPush().setTextMessage(this.formatCityResponse(weather1), [
          [{text: `Monitor ${weather1.city}'s weather`, callbackData: `{"action": "monitor", "city": "${weather1.city}"}`}],
        ]);
        this.send(push, update).subscribe();
        break;
    }
  }

  weatherChangeNotification(weather: Weather, entity: MonitoredCitiesEntity) {
    // if (!weather.now.badConditions()) {
    //   return;
    // }

    const credentials = {feedType: 1, userId: entity.userId, feedId: entity.feedId} as Update;
    const description = weather.now.badConditions().description.toLowerCase();
    const buttonTitle = `Unsubscribe from ${weather.city} weather notifications`;
    const text = `
      We expecting ${description} in ${weather.city}. Please, pay attention.
      Temperature in ${weather.city}: ${weather.now.tempInCelsius()}°C / ${weather.now.tempInFahrenheit()}F
    `;

    const push = this.createPush()
      .setTextMessage(text, [
        [{text: buttonTitle, callbackData: `{"action": "unsubscribe", "city": "${weather.city}"}`}],
      ])
      .setReplyKeyboard([
        [{text: '🌂 Local forecast', requestLocation: true}],
      ]);

    this.send(push, credentials).subscribe();
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
