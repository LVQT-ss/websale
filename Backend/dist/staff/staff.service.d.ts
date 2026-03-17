import { PrismaService } from '../prisma/prisma.service.js';
import type { PaginatedResult } from '../common/dto/pagination.dto.js';
import { CreateStaffDto } from './dto/create-staff.dto.js';
import { UpdateStaffDto } from './dto/update-staff.dto.js';
import { QueryStaffDto } from './dto/query-staff.dto.js';
export declare class StaffService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(query: QueryStaffDto): Promise<PaginatedResult<unknown>>;
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
    private ensureStaffExists;
}
