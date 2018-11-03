import * as moment from 'moment';

export class Weather {
  city: string;
  country: string;
  description: string;

  now: WeatherItem;
  forecast: WeatherItem[] = [];

  constructor(data) {
    this.city = data.city.name;
    this.country = data.city.country;
    this.now = new WeatherItem(data.list.shift());
    this.forecast = data.list.map(item => new WeatherItem(item));
  }

  forecastForTomorrow(time: string = '12:00'): WeatherItem {
    const hour = parseInt(time.slice(0, 2), 0);
    const tomorrow = moment().add(1, 'day')
      .hour(hour)
      .minute(parseInt(time.slice(3, 5), 0))
      .second(0)
      .millisecond(0);

    // @ts-ignore
    return this.forecast.find((v: WeatherItem) => {
      if (v.date.dayOfYear() === tomorrow.dayOfYear() && (v.date.hour() === hour - 1)) {
        return v;
      }
    });
  }
}

interface WeatherDescription {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export class WeatherItem {
  date: moment.Moment;
  temp: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  sea_level: number;
  grnd_level: number;
  humidity: number;
  temp_kf: number;
  weather: WeatherDescription[];

  clouds: {all: number};
  wind: {speed: number, deg: number};
  sys: {pod: string};

  constructor(props) {
    Object.keys(props).forEach(prop => {
      this[prop] = props[prop];
    });
    // set base information in root
    Object.keys(props.main).forEach(prop => {
      this[prop] = props.main[prop];
    });
    this.date = moment.unix(props.dt);
    this.weather = props.weather.map(w => {
      w.description = w.description.charAt(0).toUpperCase() + w.description.slice(1);
      return w as WeatherDescription;
    });
  }

  tempInCelsius(): number {
    return this.convertToCelsius(this.temp);
  }

  tempInFahrenheit(): number {
    return this.convertToFahrenheit(this.temp);
  }

  private convertToCelsius(tempInK: number): number {
    return Math.round(tempInK - 273.15);
  }

  private convertToFahrenheit(tempInK: number): number {
    return Math.round(tempInK * 9 / 5 - 459.67);
  }
}
