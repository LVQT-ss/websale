import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service.js';
import {
  SettingsController,
  PublicSettingsController,
} from './settings.controller.js';

@Module({
  controllers: [PublicSettingsController, SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
