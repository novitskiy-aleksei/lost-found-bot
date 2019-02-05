import { config } from 'dotenv';
import { LostNFoundService } from './services/lost-n-found.service';
import { Module, HttpModule } from '@nestjs/common';
import { FrameworkModule } from './framework/framework.module';
import { MyPetsService } from './services/my-pets.service';
import { ProcessorLink } from './framework/services/processor.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonitoredCitiesService } from './services/monitored-cities.service';
import { CronController } from './controllers/cron.controller';

config();

@Module({
  controllers: [
    CronController,
  ],
  providers: [
    ProcessorLink,
    MyPetsService,
    LostNFoundService,
    MonitoredCitiesService,
  ],
  imports: [
    HttpModule,
    FrameworkModule,
    TypeOrmModule.forRoot({
      // @ts-ignore
      type: process.env.DB_TYPE,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_DATABASE_NAME,
      entities: [(process.env.NODE_ENV === 'development' ? 'src' : 'dist') + '/**/**.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV === 'development',
    }),
  ],
})
export class AppModule {
}
