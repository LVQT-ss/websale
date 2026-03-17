import {
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsIn,
  Min,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { TemplateCategory, TemplateTech } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto.js';

export class QueryTemplateDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(TemplateCategory)
  category?: TemplateCategory;

  @IsOptional()
  @IsEnum(TemplateTech)
  tech?: TemplateTech;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsIn(['price', 'newest', 'popular', 'rating'])
  sortBy?: 'price' | 'newest' | 'popular' | 'rating';
}
