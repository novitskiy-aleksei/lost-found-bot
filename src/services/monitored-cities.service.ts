import { Connection, Repository } from 'typeorm';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { MonitoredCitiesEntity } from '../entities/monitored-cities.entity';
import { Injectable } from '@nestjs/common';
import { from, Observable } from 'rxjs';

@Injectable()
export class MonitoredCitiesService {

  constructor(@InjectConnection()
              private readonly connection: Connection,
              @InjectRepository(MonitoredCitiesEntity)
              private repository: Repository<MonitoredCitiesEntity>) {}

  add(item: MonitoredCitiesEntity): Observable<MonitoredCitiesEntity> {
    return from(this.connection.manager.save(item));
  }

  findAll(): Observable<MonitoredCitiesEntity[]> {
    return from(this.connection.manager.find(MonitoredCitiesEntity));
  }

  findMonitoredCityItems(): Observable<MonitoredCitiesEntity[]> {
    return from(this.repository.createQueryBuilder('cities')
      .groupBy('city')
      .getMany());
  }

}