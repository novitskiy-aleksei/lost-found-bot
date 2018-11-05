import { Controller, Get, Logger } from '@nestjs/common';
import { MonitoredCitiesService } from '../services/monitored-cities.service';
import { OpenWeatherService } from '../services/open-weather.service';
import { WeatherBotService } from '../services/weather-bot.service';
import * as moment from 'moment';

@Controller()
export class CronController {
  constructor(private monitorService: MonitoredCitiesService,
              private openWeather: OpenWeatherService,
              private botService: WeatherBotService) {}

  @Get('/cron/checkAll')
  async checkAll() {
    const cities = await this.monitorService.findMonitoredCityItems().toPromise();
    for (const city of cities) {
      const forecast = await this.openWeather.getForecastByCity(city).toPromise();
      const records = await this.monitorService.findCitySubscribers(city).toPromise();
      records.forEach(record => {
        this.botService.weatherChangeNotification(forecast, record);
      });
    }

    return {started: moment().unix()};
  }
}
