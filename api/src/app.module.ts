import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { HttpService } from '@nestjs/axios';
import { AppController } from './app.controller';
import { LineController } from './line/line.controller';
import { AppService } from './app.service';
import { LineService } from './line/line.service';

@Module({
  imports: [EventEmitterModule.forRoot(), CacheModule.register()],
  controllers: [AppController, LineController],
  providers: [
    AppService,
    {
      provide: HttpService,
      useFactory: () => new HttpService(),
    },
    LineService,
  ],
})
export class AppModule {}
