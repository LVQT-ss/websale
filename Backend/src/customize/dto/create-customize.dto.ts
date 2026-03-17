import {
  IsString,
  MinLength,
  IsOptional,
  IsArray,
  IsUrl,
} from 'class-validator';

export class CreateCustomizeDto {
  @IsString()
  templateId!: string;

  @IsString()
  @MinLength(20)
  requirements!: string;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  referenceUrls?: string[];
}
