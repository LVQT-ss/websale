import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateSettingsDto } from './dto/update-settings.dto.js';
export declare class SettingsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<Record<string, unknown>>;
    update(dto: UpdateSettingsDto): Promise<Record<string, unknown>>;
}
