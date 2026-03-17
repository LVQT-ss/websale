import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { StorageService } from '../storage/storage.service.js';
import { EmailService } from '../email/email.service.js';
import type { PaginatedResult } from '../common/dto/pagination.dto.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { QueryOrderDto } from './dto/query-order.dto.js';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly email: EmailService,
  ) {}

  async create(userId: string, dto: CreateOrderDto) {
    const templateIds = dto.items.map((item) => item.templateId);

    // Fetch all templates in one query
    const templates = await this.prisma.template.findMany({
      where: { id: { in: templateIds }, isActive: true },
      select: { id: true, name: true, price: true },
    });

    // Validate all templates exist and are active
    if (templates.length !== templateIds.length) {
      const foundIds = new Set(templates.map((t) => t.id));
      const missing = templateIds.filter((id) => !foundIds.has(id));
      throw new BadRequestException(
        `Templates not found or inactive: ${missing.join(', ')}`,
      );
    }

    // Build a lookup map
    const templateMap = new Map(templates.map((t) => [t.id, t]));

    // Calculate total
    const totalAmount = templates.reduce(
      (sum, t) => sum.add(t.price),
      new Prisma.Decimal(0),
    );

    // Generate order number: FT-YYYYMMDD-XXX
    const now = new Date();
    const datePart = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('');
    const randomPart = String(Math.floor(Math.random() * 900) + 100);
    const orderNumber = `FT-${datePart}-${randomPart}`;

    // Fetch user info for snapshot fields
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { email: true, fullName: true },
    });

    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        userId,
        totalAmount,
        customerEmail: user.email,
        customerName: user.fullName,
        items: {
          create: templateIds.map((templateId) => {
            const t = templateMap.get(templateId)!;
            return {
              templateId,
              templateName: t.name,
              unitPrice: t.price,
            };
          }),
        },
      },
      include: { items: true },
    });

    // Send order confirmation email (fire-and-forget)
    this.email
      .sendOrderConfirmation({
        to: user.email,
        customerName: user.fullName,
        orderNumber,
        items: templates.map((t) => ({
          name: t.name,
          price: new Intl.NumberFormat('vi-VN').format(Number(t.price)) + ' ₫',
        })),
        totalAmount:
          new Intl.NumberFormat('vi-VN').format(Number(totalAmount)) + ' ₫',
      })
      .catch(() => {});

    return order;
  }

  async findAll(
    userId: string,
    role: string,
    query: QueryOrderDto,
  ): Promise<PaginatedResult<unknown>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};

    // CUSTOMER can only see their own orders
    if (role === 'CUSTOMER') {
      where.userId = userId;
    }

    if (query.status) {
      where.status = query.status;
    }

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          items: true,
          payments: true,
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId: string, role: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        payments: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (role === 'CUSTOMER' && order.userId !== userId) {
      throw new ForbiddenException('You can only view your own orders');
    }

    return order;
  }

  async getDownloadUrl(
    orderId: string,
    templateId: string,
    userId: string,
    ip: string,
    userAgent: string,
  ): Promise<{ fileUrl: string }> {
    // Fetch the order with items
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Verify ownership
    if (order.userId !== userId) {
      throw new ForbiddenException('You can only download from your own orders');
    }

    // Verify order is PAID or COMPLETED
    if (order.status !== 'PAID' && order.status !== 'COMPLETED') {
      throw new BadRequestException(
        'Downloads are only available for paid or completed orders',
      );
    }

    // Verify the template is part of this order
    const orderItem = order.items.find(
      (item) => item.templateId === templateId,
    );

    if (!orderItem) {
      throw new NotFoundException('Template not found in this order');
    }

    // Fetch the template file URL
    const template = await this.prisma.template.findUnique({
      where: { id: templateId },
      select: { fileUrl: true, slug: true },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    // Log the download
    await this.prisma.downloadLog.create({
      data: {
        userId,
        templateId,
        orderId,
        ipAddress: ip,
        userAgent,
      },
    });

    // If S3/R2 is configured, generate a signed download URL
    if (this.storage.isConfigured && template.fileUrl) {
      const signedUrl = await this.storage.getDownloadUrl({
        key: template.fileUrl,
        filename: `${template.slug}.zip`,
        expiresIn: 3600,
      });
      return { fileUrl: signedUrl };
    }

    return { fileUrl: template.fileUrl };
  }
}
