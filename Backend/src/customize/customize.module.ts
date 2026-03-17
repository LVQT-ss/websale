import { Module } from '@nestjs/common';
import { CustomizeService } from './customize.service.js';
import { CustomizeController } from './customize.controller.js';

@Module({
  controllers: [CustomizeController],
  providers: [CustomizeService],
  exports: [CustomizeService],
})
export class CustomizeModule {}
