import { CustomizeStatus } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto.js';
export declare class QueryCustomizeDto extends PaginationDto {
    status?: CustomizeStatus;
}
