import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  /* ------------------------------------------------------------------ */
  /*  Revenue Report                                                     */
  /* ------------------------------------------------------------------ */

  async getRevenue(from?: string, to?: string) {
    const where: Prisma.PaymentWhereInput = {
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

    let totalRevenue = new Prisma.Decimal(0);
    const dailyMap = new Map<string, { revenue: Prisma.Decimal; orders: number }>();

    for (const payment of payments) {
      totalRevenue = totalRevenue.add(payment.amount);

      const dateKey = payment.paidAt
        ? payment.paidAt.toISOString().slice(0, 10)
        : 'unknown';

      const existing = dailyMap.get(dateKey);
      if (existing) {
        existing.revenue = existing.revenue.add(payment.amount);
        existing.orders += 1;
      } else {
        dailyMap.set(dateKey, {
          revenue: new Prisma.Decimal(payment.amount.toString()),
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

  /* ------------------------------------------------------------------ */
  /*  Top Templates                                                      */
  /* ------------------------------------------------------------------ */

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
      const revenue = t.orderItems.reduce(
        (sum, item) => sum.add(item.unitPrice),
        new Prisma.Decimal(0),
      );

      return {
        id: t.id,
        name: t.name,
        slug: t.slug,
        purchaseCount: t.purchaseCount,
        revenue,
      };
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Top Customers                                                      */
  /* ------------------------------------------------------------------ */

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
        const totalSpent = c.orders.reduce(
          (sum, o) => sum.add(o.totalAmount),
          new Prisma.Decimal(0),
        );

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
        // Sort descending by totalSpent
        if (b.totalSpent.greaterThan(a.totalSpent)) return 1;
        if (a.totalSpent.greaterThan(b.totalSpent)) return -1;
        return 0;
      })
      .slice(0, limit);

    return ranked;
  }

  /* ------------------------------------------------------------------ */
  /*  Dashboard Stats                                                    */
  /* ------------------------------------------------------------------ */

  async getDashboardStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      allTimePayments,
      monthlyPayments,
      totalOrders,
      pendingOrders,
      totalTemplates,
      totalCustomers,
      recentOrders,
    ] = await Promise.all([
      // Total revenue (all time)
      this.prisma.payment.findMany({
        where: { status: 'SUCCESS' },
        select: { amount: true },
      }),
      // Monthly revenue
      this.prisma.payment.findMany({
        where: {
          status: 'SUCCESS',
          paidAt: { gte: startOfMonth },
        },
        select: { amount: true },
      }),
      // Total orders
      this.prisma.order.count(),
      // Pending orders
      this.prisma.order.count({ where: { status: 'PENDING' } }),
      // Total templates
      this.prisma.template.count(),
      // Total customers
      this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
      // Recent orders (last 5)
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

    const totalRevenue = allTimePayments.reduce(
      (sum, p) => sum.add(p.amount),
      new Prisma.Decimal(0),
    );

    const monthlyRevenue = monthlyPayments.reduce(
      (sum, p) => sum.add(p.amount),
      new Prisma.Decimal(0),
    );

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
}
