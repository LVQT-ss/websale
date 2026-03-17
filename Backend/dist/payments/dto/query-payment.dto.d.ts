import { PaymentStatus, PaymentMethod } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto.js';
export declare class QueryPaymentDto extends PaginationDto {
    status?: PaymentStatus;
    method?: PaymentMethod;
}
