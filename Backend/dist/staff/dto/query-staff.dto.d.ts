import { UserStatus } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto.js';
export declare class QueryStaffDto extends PaginationDto {
    search?: string;
    status?: UserStatus;
}
