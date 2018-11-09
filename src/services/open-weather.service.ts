import { catchError, map } from 'rxjs/operators';
import { HttpService, Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import * as querystring from 'querystring';
import { Weather } from '../models/weather';

@Injectable()
export class OpenWeatherService {
  private readonly url = 'http://api.openweathermap.org/data/2.5';
  private apiKey: string;

  constructor(private http: HttpService) {
    this.configureCredentials();
  }

  configureCredentials() {
    this.apiKey = process.env.OPENWEATHER_API_KEY;
    if (!this.apiKey) {
      throw new Error('No key provided for open weather api');
    }
  }

  getForecastByCity(city: string): Observable<Weather | null> {
    return this.call('forecast', {q: city});
  }

  getForecastByGeo(lat: number, lon: number): Observable<Weather | null> {
    return this.call('forecast', {lat, lon});
  }

  private call(method, params): Observable<Weather | null> {
    return this.http
      .get(`${this.url}/${method}?appid=${this.apiKey}&` + querystring.stringify(params))
      .pipe(
        map((response: any) => new Weather(response.data)),
        catchError((err, caught) => of(null)),
      );
  }
}
