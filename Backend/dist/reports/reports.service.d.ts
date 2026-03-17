import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
export declare class ReportsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getRevenue(from?: string, to?: string): Promise<{
        totalRevenue: Prisma.Decimal;
        orderCount: number;
        daily: {
            date: string;
            revenue: Prisma.Decimal;
            orders: number;
        }[];
    }>;
    getTopTemplates(limit?: number): Promise<{
        id: string;
        name: string;
        slug: string;
        purchaseCount: number;
        revenue: Prisma.Decimal;
    }[]>;
    getTopCustomers(limit?: number): Promise<{
        id: string;
        fullName: string;
        email: string;
        totalSpent: Prisma.Decimal;
        orderCount: number;
    }[]>;
    getDashboardStats(): Promise<{
        totalRevenue: Prisma.Decimal;
        monthlyRevenue: Prisma.Decimal;
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
        })[];
    }>;
}
