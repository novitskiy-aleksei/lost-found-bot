import { WeatherBotService } from './services/weather-bot.service';
import { Module, HttpModule } from '@nestjs/common';
import { ConfigModule } from 'nestjs-config';
import { FrameworkModule } from './framework/framework.module';
import { OpenWeatherService } from 'services/open-weather.service';
import { ProcessorLink } from 'framework/services/processor.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonitoredCitiesService } from './services/monitored-cities.service';

// immediately import dotenv configuration to use it for DB
import { config } from 'dotenv';
import { CronController } from './controllers/cron.controller';
import { MonitoredCitiesEntity } from './entities/monitored-cities.entity';
config();

@Module({
  controllers: [
    CronController,
  ],
  providers: [
    ProcessorLink,
    OpenWeatherService,
    WeatherBotService,
    MonitoredCitiesService,
  ],
  imports: [
    ConfigModule.load(),
    HttpModule,
    FrameworkModule,
    TypeOrmModule.forRoot({
      // @ts-ignore
      type: process.env.DB_TYPE,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_DATABASE_NAME,
      entities: ['src/**/**.entity{.ts,.js}'],
      synchronize: true,
      },
    ),
  ],
})
export class AppModule {
}
