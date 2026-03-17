import { StaffService } from './staff.service.js';
import { CreateStaffDto } from './dto/create-staff.dto.js';
import { UpdateStaffDto } from './dto/update-staff.dto.js';
import { QueryStaffDto } from './dto/query-staff.dto.js';
export declare class StaffController {
    private readonly staffService;
    constructor(staffService: StaffService);
    findAll(query: QueryStaffDto): Promise<import("../common/dto/pagination.dto.js").PaginatedResult<unknown>>;
    create(dto: CreateStaffDto): Promise<{
        email: string;
        fullName: string;
        phone: string | null;
        id: string;
        role: import("@prisma/client").$Enums.UserRole;
        status: import("@prisma/client").$Enums.UserStatus;
        createdAt: Date;
    }>;
    update(id: string, dto: UpdateStaffDto): Promise<{
        email: string;
        fullName: string;
        phone: string | null;
        id: string;
        role: import("@prisma/client").$Enums.UserRole;
        status: import("@prisma/client").$Enums.UserStatus;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        email: string;
        fullName: string;
        id: string;
        status: import("@prisma/client").$Enums.UserStatus;
    }>;
}
