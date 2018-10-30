import { Injectable } from '@nestjs/common';
import { ApiService } from './api.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { empty } from 'rxjs/internal/Observer';
import { Message } from '../framework/message';

@Injectable()
export class BotResponseService {

  constructor(private weather: ApiService) {
  }

  byCommand(command: string, message: Message): Observable<any> {
    command = command.trim();

    if (command.startsWith('/start')) {
      return this.start(message);
    } else {
      return this.getForCity(command);
    }
  }

  start(message: Message): Observable<string> {
    return of('Hello! Message me any city name and I\'ll show you forecast for it');
  }

  getForCity(city: string): Observable<any> {
    return this.weather.nowByCity(city).pipe(
      map((response) => {
        response = response.data;
        let r = 'So, here is the weather in ' + city + ':\n';
        r += 'Temperature: ' + response.main.temp + 'K\n';
        r += 'Pressure: ' + response.main.pressure + '\n';
        response.weather.forEach(factor => r += `\n${factor.description}`);
        r += '\n';
        return r;
      }),
      catchError((err, caught) => {
        return of(err.response.data.message);
      }),
    );
  }
}