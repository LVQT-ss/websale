import { IsOptional, IsEnum } from 'class-validator';
import { CustomizeStatus } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto.js';

export class QueryCustomizeDto extends PaginationDto {
  @IsOptional()
  @IsEnum(CustomizeStatus)
  status?: CustomizeStatus;
}
