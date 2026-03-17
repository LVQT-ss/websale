import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateSettingsDto } from './dto/update-settings.dto.js';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Record<string, unknown>> {
    const settings = await this.prisma.setting.findMany();

    const result: Record<string, unknown> = {};
    for (const setting of settings) {
      result[setting.key] = setting.value;
    }
    return result;
  }

  async update(dto: UpdateSettingsDto): Promise<Record<string, unknown>> {
    await this.prisma.$transaction(
      dto.settings.map((item) =>
        this.prisma.setting.upsert({
          where: { key: item.key },
          update: { value: item.value as never },
          create: { key: item.key, value: item.value as never },
        }),
      ),
    );

    return this.findAll();
  }
}
