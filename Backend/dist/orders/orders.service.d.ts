import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { StorageService } from '../storage/storage.service.js';
import { EmailService } from '../email/email.service.js';
import type { PaginatedResult } from '../common/dto/pagination.dto.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { QueryOrderDto } from './dto/query-order.dto.js';
export declare class OrdersService {
    private readonly prisma;
    private readonly storage;
    private readonly email;
    constructor(prisma: PrismaService, storage: StorageService, email: EmailService);
    create(userId: string, dto: CreateOrderDto): Promise<{
        items: {
            id: string;
            templateId: string;
            templateName: string;
            unitPrice: Prisma.Decimal;
            orderId: string;
        }[];
    } & {
        id: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        currency: string;
        orderNumber: string;
        totalAmount: Prisma.Decimal;
        customerEmail: string;
        customerName: string;
        paidAt: Date | null;
        completedAt: Date | null;
        cancelledAt: Date | null;
    }>;
    findAll(userId: string, role: string, query: QueryOrderDto): Promise<PaginatedResult<unknown>>;
    findOne(id: string, userId: string, role: string): Promise<{
        payments: {
            id: string;
            status: import("@prisma/client").$Enums.PaymentStatus;
            createdAt: Date;
            userId: string;
            currency: string;
            paidAt: Date | null;
            orderId: string;
            amount: Prisma.Decimal;
            method: import("@prisma/client").$Enums.PaymentMethod;
            momoTransId: string | null;
            bankTransRef: string | null;
            receiptImage: string | null;
            confirmedById: string | null;
            confirmedAt: Date | null;
        }[];
        items: {
            id: string;
            templateId: string;
            templateName: string;
            unitPrice: Prisma.Decimal;
            orderId: string;
        }[];
    } & {
        id: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        currency: string;
        orderNumber: string;
        totalAmount: Prisma.Decimal;
        customerEmail: string;
        customerName: string;
        paidAt: Date | null;
        completedAt: Date | null;
        cancelledAt: Date | null;
    }>;
    getDownloadUrl(orderId: string, templateId: string, userId: string, ip: string, userAgent: string): Promise<{
        fileUrl: string;
    }>;
}
