import { Type } from 'class-transformer';
import { IsArray, IsString, ValidateNested, IsDefined } from 'class-validator';

class SettingItemDto {
  @IsString()
  key!: string;

  @IsDefined()
  value!: unknown;
}

export class UpdateSettingsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SettingItemDto)
  settings!: SettingItemDto[];
}
