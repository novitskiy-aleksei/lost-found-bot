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
      return this.getForCity(command);
    }
  }

  start(message: Message): Observable<BotResponse> {
    this.response.text = 'Hello! Message me any city name and I\'ll show you forecast for it';

    return of(this.response);
  }

  private getForCity(city: string): Observable<BotResponse> {
    return this.weather.nowByCity(city).pipe(
      map((response) => {
        response = response.data;
        this.response.text = 'So, here is the weather in ' + city + ':\n';
        this.response.text += 'Temperature: ' + response.main.temp + 'K\n';
        this.response.text += 'Pressure: ' + response.main.pressure + '\n';
        response.weather.forEach(factor => this.response.text += `\n${factor.description}`);
        this.response.text += '\n';

        return this.response;
      }),
      catchError((err, caught) => {
        this.response.text = err.response.data.message;

        return of(this.response);
      }),
    );
  }
}