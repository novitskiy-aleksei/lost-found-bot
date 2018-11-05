import { Controller, Get } from '@nestjs/common';
import { MonitoredCitiesService } from '../services/monitored-cities.service';
import { MonitoredCitiesEntity } from '../entities/monitored-cities.entity';
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
    const list = await this.monitorService.findMonitoredCityItems().toPromise();
    for (const item of list) {
      const forecast = await this.openWeather.getForecastByCity(item.city).toPromise();
      const records = await this.monitorService.findCitySubscribers(item.city).toPromise();
      records.forEach(record => {
        this.botService.weatherChangeNotification(forecast, record);
      });
    }

    return {started: moment().unix()};
  }
}
