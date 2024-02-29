import { Module } from '@nestjs/common';
import { LineService } from './line.service';
import { LineController } from './line.controller';
import { HttpModule, HttpService } from '@nestjs/axios';

@Module({
  imports: [HttpModule, HttpService],
  providers: [LineService, HttpService],
  controllers: [LineController],
})
export class LineModule {}
