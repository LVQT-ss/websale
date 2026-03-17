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
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
const email_service_js_1 = require("../email/email.service.js");
let PaymentsService = PaymentsService_1 = class PaymentsService {
    prisma;
    email;
    logger = new common_1.Logger(PaymentsService_1.name);
    constructor(prisma, email) {
        this.prisma = prisma;
        this.email = email;
    }
    async createMomoPayment(userId, dto) {
        const order = await this.prisma.order.findUnique({
            where: { id: dto.orderId },
            include: { items: true },
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (order.userId !== userId) {
            throw new common_1.BadRequestException('Order does not belong to you');
        }
        if (order.status !== 'PENDING') {
            throw new common_1.BadRequestException(`Order is not pending (current status: ${order.status})`);
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
        const mockRedirectUrl = `https://test-payment.momo.vn/pay?token=${payment.id}`;
        return {
            paymentId: payment.id,
            redirectUrl: mockRedirectUrl,
        };
    }
    async handleMomoCallback(body) {
        this.logger.log(`MoMo callback received: ${JSON.stringify(body)}`);
        const paymentId = body['orderId'];
        const resultCode = body['resultCode'];
        const transId = body['transId'];
        if (!paymentId) {
            throw new common_1.BadRequestException('Missing orderId in MoMo callback');
        }
        const payment = await this.prisma.payment.findUnique({
            where: { id: paymentId },
            include: { order: { include: { items: true } } },
        });
        if (!payment) {
            throw new common_1.NotFoundException('Payment not found');
        }
        if (payment.status !== 'PENDING') {
            this.logger.warn(`Payment ${paymentId} already processed (status: ${payment.status})`);
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
                for (const item of payment.order.items) {
                    await tx.template.update({
                        where: { id: item.templateId },
                        data: { purchaseCount: { increment: 1 } },
                    });
                }
            });
            this.email
                .sendPaymentConfirmation({
                to: payment.order.customerEmail,
                customerName: payment.order.customerName,
                orderNumber: payment.order.orderNumber,
                totalAmount: new Intl.NumberFormat('vi-VN').format(Number(payment.order.totalAmount)) + ' ₫',
            })
                .catch(() => { });
            return { message: 'Payment processed successfully' };
        }
        await this.prisma.payment.update({
            where: { id: paymentId },
            data: {
                status: 'FAILED',
                momoTransId: transId ?? null,
            },
        });
        return { message: 'Payment marked as failed' };
    }
    async createBankTransfer(userId, dto) {
        const order = await this.prisma.order.findUnique({
            where: { id: dto.orderId },
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (order.userId !== userId) {
            throw new common_1.BadRequestException('Order does not belong to you');
        }
        if (order.status !== 'PENDING') {
            throw new common_1.BadRequestException(`Order is not pending (current status: ${order.status})`);
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
    async confirmPayment(paymentId, adminId) {
        const payment = await this.prisma.payment.findUnique({
            where: { id: paymentId },
            include: { order: { include: { items: true } } },
        });
        if (!payment) {
            throw new common_1.NotFoundException('Payment not found');
        }
        if (payment.status !== 'PENDING') {
            throw new common_1.BadRequestException(`Payment is not pending (current status: ${payment.status})`);
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
            for (const item of payment.order.items) {
                await tx.template.update({
                    where: { id: item.templateId },
                    data: { purchaseCount: { increment: 1 } },
                });
            }
            return updatedPayment;
        });
        this.email
            .sendPaymentConfirmation({
            to: payment.order.customerEmail,
            customerName: payment.order.customerName,
            orderNumber: payment.order.orderNumber,
            totalAmount: new Intl.NumberFormat('vi-VN').format(Number(payment.order.totalAmount)) + ' ₫',
        })
            .catch(() => { });
        return result;
    }
    async findAll(query) {
        const where = {};
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
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService,
        email_service_js_1.EmailService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map