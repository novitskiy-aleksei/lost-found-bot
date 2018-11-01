import { WeatherBot } from './weather-bot';
import { Module, HttpModule } from '@nestjs/common';
import { ConfigModule } from 'nestjs-config';
import { FrameworkModule } from './framework/framework.module';
import { OpenWeatherService } from 'services/open-weather.service';
import { ProcessorLink } from 'framework/services/processor.service';

@Module({
  controllers: [],
  providers: [
    ProcessorLink,
    OpenWeatherService,
    WeatherBot,
  ],
  imports: [
    ConfigModule.load(),
    HttpModule,
    FrameworkModule,
  ],
})
export class AppModule {
}
