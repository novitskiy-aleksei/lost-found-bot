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

  async remove(userId: string, city: string): Promise<MonitoredCitiesEntity> {
    const item = await this.repository.findOne({userId, city});
    if (item) {
      return this.connection.manager.remove(item);
    }
  }

  async find(...args) {
    return await this.repository.find(...args);
  }

  async findOne(...args) {
    return await this.repository.findOne(...args);
  }

  findMonitoredCityItems(): Observable<MonitoredCitiesEntity[]> {
    return from(this.repository.createQueryBuilder('cities')
      .groupBy('city')
      .getMany());
  }

  findCitySubscribers(city: string): Observable<MonitoredCitiesEntity[]> {
    return from(this.repository.createQueryBuilder('subs')
      .where(`subs.city = '${city}'`)
      .groupBy('userId')
      .getMany());
  }

}