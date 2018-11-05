import { Entity, Column, ObjectIdColumn } from 'typeorm';

@Entity()
export class MonitoredCitiesEntity {

  @ObjectIdColumn()
  id: number;

  @Column()
  feedId: string;

  @Column()
  userId: string;

  @Column()
  city: string;

  @Column('int')
  createdAt: number;
}
