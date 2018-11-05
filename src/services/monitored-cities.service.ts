import { map } from 'rxjs/operators';
import { Connection, MongoEntityManager } from 'typeorm';
import { InjectConnection } from '@nestjs/typeorm';
import { MonitoredCitiesEntity } from '../entities/monitored-cities.entity';
import { Injectable } from '@nestjs/common';
import { from, Observable } from 'rxjs';

@Injectable()
export class MonitoredCitiesService {
  private manager: MongoEntityManager;

  constructor(@InjectConnection() connection: Connection) {
    this.manager = connection.manager as MongoEntityManager;
  }

  add(item: MonitoredCitiesEntity): Observable<MonitoredCitiesEntity> {
    return from(this.manager.save(item));
  }

  remove(city: string, userId: string): Observable<any> {
    return from(this.manager.delete(MonitoredCitiesEntity, {city, userId}))
  }

  findSubscription(city, userId): Observable<MonitoredCitiesEntity> {
    return from(this.manager.findOne(MonitoredCitiesEntity, {city, userId}));
  }

  findMonitoredCityItems(): Observable<string[]> {
    return from(this.manager.distinct(MonitoredCitiesEntity, 'city', {}));
  }

  findCitySubscribers(city: string): Observable<MonitoredCitiesEntity[]> {
    return from(this.manager.find(MonitoredCitiesEntity, {city}));
  }
}
