import { catchError, map } from 'rxjs/operators';
import { HttpService, Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { InjectConfig } from 'nestjs-config';
import * as querystring from 'querystring';

export class Weather {
  city: string;
  country: string;
  tempInCelsius: number;
  tempInFahrenheit: number;
  description: string;
}

@Injectable()
export class OpenWeatherService {
  private readonly url = 'http://api.openweathermap.org/data/2.5';
  private apiKey: string;

  constructor(@InjectConfig() private config, private http: HttpService) {
    this.configureCredentials();
  }

  configureCredentials() {
    this.apiKey = this.config.get('app.openWeatherApiKey');
    if (!this.apiKey) {
      throw new Error('No key provided for open weather api');
    }
  }

  getCurrentByCity(city: string): Observable<Weather> {
    return this.getForecastByCity(city).pipe(
      map(response => {
        const data = response.data;
        return {
          city: data.city.name,
          country: data.city.country,
          tempInCelsius: this.kelvinToCelsius(data.list[0].main.temp),
          tempInFahrenheit: this.kelvinToFahrenheit(data.list[0].main.temp),
          description: data.list[0].weather[0].main,
        } as Weather;
      }),
      catchError((err, caught) => {
        return of(null);
      }),
    );
  }

  private getForecastByCity(city: string): Observable<any> {
    return this.call('forecast', {q: city});
  }

  private getWeatherByGeo(lat: number, lon: number): Observable<any> {
    return this.call('weather', {lat, lon});
  }

  private call(method, params) {
    return this.http.get(`${this.url}/${method}?appid=${this.apiKey}&` + querystring.stringify(params));
  }

  private kelvinToCelsius(temp) {
    return Math.round(temp - 273.15);
  }

  private kelvinToFahrenheit(temp) {
    return Math.round(temp * 9.5 - 459.67);
  }
}
