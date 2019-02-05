import { Controller, Get, Logger } from '@nestjs/common';
import { MonitoredCitiesService } from '../services/monitored-cities.service';
import { MyPetsService } from '../services/my-pets.service';
import { LostNFoundService } from '../services/lost-n-found.service';
import * as moment from 'moment';

@Controller()
export class CronController {
  constructor(private monitorService: MonitoredCitiesService,
              private openWeather: MyPetsService,
              private botService: LostNFoundService) {}

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
