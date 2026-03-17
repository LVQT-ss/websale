import { OrdersService } from './orders.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { QueryOrderDto } from './dto/query-order.dto.js';
import type { UserPayload } from '../auth/interfaces/jwt-payload.interface.js';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(user: UserPayload, dto: CreateOrderDto): Promise<{
        items: {
            id: string;
            templateId: string;
            templateName: string;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
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
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        customerEmail: string;
        customerName: string;
        paidAt: Date | null;
        completedAt: Date | null;
        cancelledAt: Date | null;
    }>;
    findAll(user: UserPayload, query: QueryOrderDto): Promise<import("../common/dto/pagination.dto.js").PaginatedResult<unknown>>;
    findOne(user: UserPayload, id: string): Promise<{
        payments: {
            id: string;
            status: import("@prisma/client").$Enums.PaymentStatus;
            createdAt: Date;
            userId: string;
            currency: string;
            paidAt: Date | null;
            orderId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
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
            unitPrice: import("@prisma/client/runtime/library").Decimal;
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
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        customerEmail: string;
        customerName: string;
        paidAt: Date | null;
        completedAt: Date | null;
        cancelledAt: Date | null;
    }>;
    getDownloadUrl(user: UserPayload, orderId: string, templateId: string, ip: string, userAgent: string): Promise<{
        fileUrl: string;
    }>;
}
