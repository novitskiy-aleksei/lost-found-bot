import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class MonitoredCitiesEntity {

  @PrimaryGeneratedColumn()
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
