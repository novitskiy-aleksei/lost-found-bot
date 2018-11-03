import { Controller, Get } from '@nestjs/common';
import { MonitoredCitiesService } from '../services/monitored-cities.service';

@Controller()
export class CronController {

  constructor(private monitorService: MonitoredCitiesService) {}

  @Get('/cron/checkAll')
  checkAll() {
    let response = [];
    this.monitorService.findAll().subscribe(result => {
      // console.log(result);
      response = result;
    });

    return this.monitorService.findMonitoredCityItems();
  }
}
