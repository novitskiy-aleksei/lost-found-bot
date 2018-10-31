import { HttpService, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { InjectConfig } from 'nestjs-config';

@Injectable()
export class ApiService {

  private readonly url = 'http://api.openweathermap.org/data/2.5';
  private readonly apiKey: string;

  constructor(@InjectConfig() private config,
              private http: HttpService) {
    this.apiKey = this.config.get('app.openWeatherApiKey');

    if (!this.apiKey) {
      // throw new Error('No key provided for open weather api');
    }
  }

  nowByCity(city: string): Observable<any> {
    return this.http.get(`${this.url}/weather?appid=${this.apiKey}&q=${city}`);
  }

  nowByGeo(lat: number, lng: number): Observable<any> {
    return this.http.get(`${this.url}/weather?appid=${this.apiKey}&lat=${lat}&lon=${lng}`);
  }

  forecastByCity(city: string): Observable<any> {
    return this.http.get(`${this.url}/forecast?appid=${this.apiKey}&q=${city}`);
  }

}