import { Controller, Get } from '@nestjs/common';
import { MonitoredCitiesService } from '../services/monitored-cities.service';
import { MonitoredCitiesEntity } from '../entities/monitored-cities.entity';
import { OpenWeatherService } from '../services/open-weather.service';
import { WeatherBotService } from '../services/weather-bot.service';

@Controller()
export class CronController {

  constructor(private monitorService: MonitoredCitiesService,
              private openWeather: OpenWeatherService,
              private botService: WeatherBotService) {}

  @Get('/cron/checkAll')
  checkAll() {
    this.monitorService.findMonitoredCityItems().subscribe((list: MonitoredCitiesEntity[]) => {
      list.map(item =>
        this.openWeather.getForecastByCity(item.city)
          .subscribe(forecast => this.botService.weatherChangeNotification(forecast, item)),
      );
    });

    return 'Update started';
  }
}
