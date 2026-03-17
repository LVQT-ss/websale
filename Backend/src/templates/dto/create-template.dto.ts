import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
  IsArray,
  IsBoolean,
  IsInt,
  IsUrl,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TemplateCategory, TemplateTech } from '@prisma/client';

export class CreateTemplateDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  slug!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  shortDesc!: string;

  @IsEnum(TemplateCategory)
  category!: TemplateCategory;

  @IsEnum(TemplateTech)
  tech!: TemplateTech;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  originalPrice?: number;

  @IsString()
  @IsNotEmpty()
  thumbnail!: string;

  @IsArray()
  @IsString({ each: true })
  images!: string[];

  @IsUrl()
  demoUrl!: string;

  @IsString()
  @IsNotEmpty()
  fileUrl!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  fileSize!: number;

  @IsOptional()
  @IsString()
  version?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  metaTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  metaDesc?: string;

  @IsArray()
  @IsString({ each: true })
  features!: string[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pages?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
