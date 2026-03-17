import { IsOptional, IsEnum } from 'class-validator';
import { PaymentStatus, PaymentMethod } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto.js';

export class QueryPaymentDto extends PaginationDto {
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;
}
