import { IsOptional, IsString, IsEnum } from 'class-validator';
import { UserStatus } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto.js';

export class QueryStaffDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
