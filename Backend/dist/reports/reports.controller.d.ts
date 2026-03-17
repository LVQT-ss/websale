import { ReportsService } from './reports.service.js';
import { QueryReportDto } from './dto/query-report.dto.js';
declare class LimitQueryDto {
    limit?: number;
}
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getRevenue(query: QueryReportDto): Promise<{
        totalRevenue: import("@prisma/client/runtime/library").Decimal;
        orderCount: number;
        daily: {
            date: string;
            revenue: import("@prisma/client/runtime/library").Decimal;
            orders: number;
        }[];
    }>;
    getTopTemplates(query: LimitQueryDto): Promise<{
        id: string;
        name: string;
        slug: string;
        purchaseCount: number;
        revenue: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    getTopCustomers(query: LimitQueryDto): Promise<{
        id: string;
        fullName: string;
        email: string;
        totalSpent: import("@prisma/client/runtime/library").Decimal;
        orderCount: number;
    }[]>;
    getDashboardStats(): Promise<{
        totalRevenue: import("@prisma/client/runtime/library").Decimal;
        monthlyRevenue: import("@prisma/client/runtime/library").Decimal;
        totalOrders: number;
        pendingOrders: number;
        totalTemplates: number;
        totalCustomers: number;
        recentOrders: ({
            user: {
                email: string;
                fullName: string;
                id: string;
            };
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
        })[];
    }>;
}
export {};
