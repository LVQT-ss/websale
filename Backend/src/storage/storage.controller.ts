import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { StorageService } from './storage.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';

class GetUploadUrlDto {
  key!: string;
  contentType!: string;
}

class GetDownloadUrlDto {
  key!: string;
  filename?: string;
}

@Controller('admin/storage')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'STAFF')
export class StorageController {
  constructor(private readonly storage: StorageService) {}

  @Post('upload-url')
  async getUploadUrl(@Body() dto: GetUploadUrlDto) {
    if (!dto.key || !dto.contentType) {
      throw new BadRequestException('key and contentType are required');
    }
    const url = await this.storage.getUploadUrl({
      key: dto.key,
      contentType: dto.contentType,
    });
    return { uploadUrl: url, key: dto.key };
  }

  @Post('download-url')
  async getDownloadUrl(@Body() dto: GetDownloadUrlDto) {
    if (!dto.key) {
      throw new BadRequestException('key is required');
    }
    const url = await this.storage.getDownloadUrl({
      key: dto.key,
      filename: dto.filename,
    });
    return { downloadUrl: url, key: dto.key };
  }

  @Get('status')
  status() {
    return {
      configured: this.storage.isConfigured,
      message: this.storage.isConfigured
        ? 'S3/R2 storage is configured and ready'
        : 'S3/R2 storage is not configured — using mock URLs',
    };
  }
}
