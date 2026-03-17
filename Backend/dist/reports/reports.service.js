"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
let ReportsService = class ReportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getRevenue(from, to) {
        const where = {
            status: 'SUCCESS',
        };
        if (from || to) {
            where.paidAt = {};
            if (from) {
                where.paidAt.gte = new Date(from);
            }
            if (to) {
                where.paidAt.lte = new Date(to);
            }
        }
        const payments = await this.prisma.payment.findMany({
            where,
            select: {
                amount: true,
                paidAt: true,
            },
            orderBy: { paidAt: 'asc' },
        });
        let totalRevenue = new client_1.Prisma.Decimal(0);
        const dailyMap = new Map();
        for (const payment of payments) {
            totalRevenue = totalRevenue.add(payment.amount);
            const dateKey = payment.paidAt
                ? payment.paidAt.toISOString().slice(0, 10)
                : 'unknown';
            const existing = dailyMap.get(dateKey);
            if (existing) {
                existing.revenue = existing.revenue.add(payment.amount);
                existing.orders += 1;
            }
            else {
                dailyMap.set(dateKey, {
                    revenue: new client_1.Prisma.Decimal(payment.amount.toString()),
                    orders: 1,
                });
            }
        }
        const daily = Array.from(dailyMap.entries()).map(([date, data]) => ({
            date,
            revenue: data.revenue,
            orders: data.orders,
        }));
        return {
            totalRevenue,
            orderCount: payments.length,
            daily,
        };
    }
    async getTopTemplates(limit = 10) {
        const templates = await this.prisma.template.findMany({
            orderBy: { purchaseCount: 'desc' },
            take: limit,
            select: {
                id: true,
                name: true,
                slug: true,
                purchaseCount: true,
                orderItems: {
                    where: {
                        order: { status: { in: ['PAID', 'COMPLETED'] } },
                    },
                    select: {
                        unitPrice: true,
                    },
                },
            },
        });
        return templates.map((t) => {
            const revenue = t.orderItems.reduce((sum, item) => sum.add(item.unitPrice), new client_1.Prisma.Decimal(0));
            return {
                id: t.id,
                name: t.name,
                slug: t.slug,
                purchaseCount: t.purchaseCount,
                revenue,
            };
        });
    }
    async getTopCustomers(limit = 10) {
        const customers = await this.prisma.user.findMany({
            where: { role: 'CUSTOMER' },
            select: {
                id: true,
                fullName: true,
                email: true,
                orders: {
                    where: { status: { in: ['PAID', 'COMPLETED'] } },
                    select: { totalAmount: true },
                },
            },
        });
        const ranked = customers
            .map((c) => {
            const totalSpent = c.orders.reduce((sum, o) => sum.add(o.totalAmount), new client_1.Prisma.Decimal(0));
            return {
                id: c.id,
                fullName: c.fullName,
                email: c.email,
                totalSpent,
                orderCount: c.orders.length,
            };
        })
            .filter((c) => c.orderCount > 0)
            .sort((a, b) => {
            if (b.totalSpent.greaterThan(a.totalSpent))
                return 1;
            if (a.totalSpent.greaterThan(b.totalSpent))
                return -1;
            return 0;
        })
            .slice(0, limit);
        return ranked;
    }
    async getDashboardStats() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const [allTimePayments, monthlyPayments, totalOrders, pendingOrders, totalTemplates, totalCustomers, recentOrders,] = await Promise.all([
            this.prisma.payment.findMany({
                where: { status: 'SUCCESS' },
                select: { amount: true },
            }),
            this.prisma.payment.findMany({
                where: {
                    status: 'SUCCESS',
                    paidAt: { gte: startOfMonth },
                },
                select: { amount: true },
            }),
            this.prisma.order.count(),
            this.prisma.order.count({ where: { status: 'PENDING' } }),
            this.prisma.template.count(),
            this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
            this.prisma.order.findMany({
                orderBy: { createdAt: 'desc' },
                take: 5,
                include: {
                    user: {
                        select: { id: true, email: true, fullName: true },
                    },
                    items: true,
                },
            }),
        ]);
        const totalRevenue = allTimePayments.reduce((sum, p) => sum.add(p.amount), new client_1.Prisma.Decimal(0));
        const monthlyRevenue = monthlyPayments.reduce((sum, p) => sum.add(p.amount), new client_1.Prisma.Decimal(0));
        return {
            totalRevenue,
            monthlyRevenue,
            totalOrders,
            pendingOrders,
            totalTemplates,
            totalCustomers,
            recentOrders,
        };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map