import { OrderStatus } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto.js';
export declare class QueryOrderDto extends PaginationDto {
    status?: OrderStatus;
}
