import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { EmailService } from '../email/email.service.js';
import type { PaginatedResult } from '../common/dto/pagination.dto.js';
import { CreateMomoPaymentDto } from './dto/create-momo-payment.dto.js';
import { CreateBankTransferDto } from './dto/create-bank-transfer.dto.js';
import { QueryPaymentDto } from './dto/query-payment.dto.js';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
  ) {}

  /* ------------------------------------------------------------------ */
  /*  MoMo Payment                                                      */
  /* ------------------------------------------------------------------ */

  async createMomoPayment(userId: string, dto: CreateMomoPaymentDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== userId) {
      throw new BadRequestException('Order does not belong to you');
    }

    if (order.status !== 'PENDING') {
      throw new BadRequestException(
        `Order is not pending (current status: ${order.status})`,
      );
    }

    const payment = await this.prisma.payment.create({
      data: {
        orderId: order.id,
        userId,
        amount: order.totalAmount,
        currency: order.currency,
        method: 'MOMO',
        status: 'PENDING',
      },
    });

    // TODO: Replace with real MoMo API integration
    const mockRedirectUrl = `https://test-payment.momo.vn/pay?token=${payment.id}`;

    return {
      paymentId: payment.id,
      redirectUrl: mockRedirectUrl,
    };
  }

  async handleMomoCallback(body: Record<string, unknown>) {
    this.logger.log(`MoMo callback received: ${JSON.stringify(body)}`);

    // MoMo sends orderId (our paymentId) and resultCode
    const paymentId = body['orderId'] as string | undefined;
    const resultCode = body['resultCode'] as number | undefined;
    const transId = body['transId'] as string | undefined;

    if (!paymentId) {
      throw new BadRequestException('Missing orderId in MoMo callback');
    }

    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: { include: { items: true } } },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== 'PENDING') {
      this.logger.warn(
        `Payment ${paymentId} already processed (status: ${payment.status})`,
      );
      return { message: 'Payment already processed' };
    }

    const isSuccess = resultCode === 0;

    if (isSuccess) {
      await this.prisma.$transaction(async (tx) => {
        const now = new Date();

        await tx.payment.update({
          where: { id: paymentId },
          data: {
            status: 'SUCCESS',
            momoTransId: transId ?? null,
            paidAt: now,
          },
        });

        await tx.order.update({
          where: { id: payment.orderId },
          data: {
            status: 'PAID',
            paidAt: now,
          },
        });

        // Increment purchaseCount for each template in the order
        for (const item of payment.order.items) {
          await tx.template.update({
            where: { id: item.templateId },
            data: { purchaseCount: { increment: 1 } },
          });
        }
      });

      // Send payment confirmation email (fire-and-forget)
      this.email
        .sendPaymentConfirmation({
          to: payment.order.customerEmail,
          customerName: payment.order.customerName,
          orderNumber: payment.order.orderNumber,
          totalAmount:
            new Intl.NumberFormat('vi-VN').format(
              Number(payment.order.totalAmount),
            ) + ' ₫',
        })
        .catch(() => {});

      return { message: 'Payment processed successfully' };
    }

    // Payment failed
    await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'FAILED',
        momoTransId: transId ?? null,
      },
    });

    return { message: 'Payment marked as failed' };
  }

  /* ------------------------------------------------------------------ */
  /*  Bank Transfer                                                     */
  /* ------------------------------------------------------------------ */

  async createBankTransfer(userId: string, dto: CreateBankTransferDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== userId) {
      throw new BadRequestException('Order does not belong to you');
    }

    if (order.status !== 'PENDING') {
      throw new BadRequestException(
        `Order is not pending (current status: ${order.status})`,
      );
    }

    const payment = await this.prisma.payment.create({
      data: {
        orderId: order.id,
        userId,
        amount: order.totalAmount,
        currency: order.currency,
        method: 'BANK_TRANSFER',
        status: 'PENDING',
        bankTransRef: dto.bankTransRef,
        receiptImage: dto.receiptImage,
      },
    });

    return payment;
  }

  /* ------------------------------------------------------------------ */
  /*  Admin: Confirm bank transfer                                      */
  /* ------------------------------------------------------------------ */

  async confirmPayment(paymentId: string, adminId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: { include: { items: true } } },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== 'PENDING') {
      throw new BadRequestException(
        `Payment is not pending (current status: ${payment.status})`,
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const now = new Date();

      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: 'SUCCESS',
          confirmedById: adminId,
          confirmedAt: now,
          paidAt: now,
        },
      });

      await tx.order.update({
        where: { id: payment.orderId },
        data: {
          status: 'PAID',
          paidAt: now,
        },
      });

      // Increment purchaseCount for each template in the order
      for (const item of payment.order.items) {
        await tx.template.update({
          where: { id: item.templateId },
          data: { purchaseCount: { increment: 1 } },
        });
      }

      return updatedPayment;
    });

    // Send payment confirmation email (fire-and-forget)
    this.email
      .sendPaymentConfirmation({
        to: payment.order.customerEmail,
        customerName: payment.order.customerName,
        orderNumber: payment.order.orderNumber,
        totalAmount:
          new Intl.NumberFormat('vi-VN').format(
            Number(payment.order.totalAmount),
          ) + ' ₫',
      })
      .catch(() => {});

    return result;
  }

  /* ------------------------------------------------------------------ */
  /*  Admin: List all payments                                          */
  /* ------------------------------------------------------------------ */

  async findAll(query: QueryPaymentDto): Promise<PaginatedResult<unknown>> {
    const where: Prisma.PaymentWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.method) {
      where.method = query.method;
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              totalAmount: true,
              status: true,
            },
          },
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
            },
          },
        },
      }),
      this.prisma.payment.count({ where }),
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
}
