import { Module } from '@nestjs/common';
import { TemplatesService } from './templates.service.js';
import {
  TemplatesController,
  AdminTemplatesController,
} from './templates.controller.js';

@Module({
  controllers: [TemplatesController, AdminTemplatesController],
  providers: [TemplatesService],
  exports: [TemplatesService],
})
export class TemplatesModule {}
