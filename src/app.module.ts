import { Module, HttpModule, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from 'nestjs-config';
import { BotResponseService } from './weather/bot-response.service';
import { ApiService } from './weather/api.service';
import { ConnectApiService } from './framework/api.service';
import { HydratorService } from './framework/hydrator.service';
import { ConnectProtocolMiddleware } from './framework/protocol.middleware';

@Module({
  controllers: [AppController],
  providers: [
    ConnectApiService,
    BotResponseService,
    ApiService,
    HydratorService,
  ],
  imports: [
    ConfigModule.load(),
    HttpModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ConnectProtocolMiddleware)
      .forRoutes(AppController);
  }
}
