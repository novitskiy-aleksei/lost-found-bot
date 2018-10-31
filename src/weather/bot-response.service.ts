import { Injectable } from '@nestjs/common';
import { ApiService } from './api.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Message } from '../framework/message';
import { BotResponse } from './bot-response';

@Injectable()
export class BotResponseService {

  private response: BotResponse;

  constructor(private weather: ApiService) {}

  byCommand(command: string, message: Message): Observable<any> {
    command = command.trim();
    this.response = new BotResponse();

    if (command.startsWith('/start')) {
      return this.start(message);
    } else {
      if (message.message.geo && message.message.geo.length) {
        return this.getForLocation(message.message.geo[0], message.message.geo[1]);
      } else {
        if (command.length >= 3) {
          return this.getForCity(command);
        } else {
          return this.start(message);
        }
      }
    }
  }

  start(message: Message): Observable<BotResponse> {
    this.response.text = 'Hello! Send me city name or you location to get current weather and forecast';

    return of(this.response);
  }

  private getForLocation(lat: number, lng: number) {
    return this.weather.nowByGeo(lat, lng).pipe(
      map((weatherResponse) => {
        const weather = weatherResponse.data;
        this.response.text = `
          So, your city detected as ${weather.name}\n
          Temperature: ${weather.main.temp}K\n
          Pressure: ${weather.main.pressure}\n
        `;
        weather.weather.forEach(factor => this.response.text += `\n${factor.description}`);
        this.response.text += '\n';

        return this.response;
      }),
      catchError((err, caught) => {
        return this.openWeatherErrorHandler(err, caught);
      }),
    );
  }

  private getForCity(city: string): Observable<BotResponse> {
    return this.weather.nowByCity(city).pipe(
      map((response) => {
        response = response.data;
        this.response.text = `So, here is the weather in ${city}:\n`;
        this.response.text += `Temperature: ${response.main.temp}K\n`;
        this.response.text += `Pressure: ${response.main.pressure}\n`;
        response.weather.forEach(factor => this.response.text += `\n${factor.description}`);
        this.response.text += '\n';

        return this.response;
      }),
      catchError((err, caught) => {
        return this.openWeatherErrorHandler(err, caught);
      }),
    );
  }

  private openWeatherErrorHandler(err, caught) {
    // console.log(err);
    console.log();
    this.response.text = err.response.data.message;

    return of(this.response);
  }
}