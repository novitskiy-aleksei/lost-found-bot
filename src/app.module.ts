import { Module, HttpModule, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from 'nestjs-config';
import { HydratorService } from './connect/hydrator.service';
import { ConnectProtocolMiddleware } from './connect/protocol.middleware';
import { ConnectApiService } from './connect/api.service';
import { BotResponseService } from './weather/bot-response.service';
import { ApiService } from './weather/api.service';

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
