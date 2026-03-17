import { SettingsService } from './settings.service.js';
import { UpdateSettingsDto } from './dto/update-settings.dto.js';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    findAll(): Promise<Record<string, unknown>>;
    update(dto: UpdateSettingsDto): Promise<Record<string, unknown>>;
}
