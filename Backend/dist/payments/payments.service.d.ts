import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { EmailService } from '../email/email.service.js';
import type { PaginatedResult } from '../common/dto/pagination.dto.js';
import { CreateMomoPaymentDto } from './dto/create-momo-payment.dto.js';
import { CreateBankTransferDto } from './dto/create-bank-transfer.dto.js';
import { QueryPaymentDto } from './dto/query-payment.dto.js';
export declare class PaymentsService {
    private readonly prisma;
    private readonly email;
    private readonly logger;
    constructor(prisma: PrismaService, email: EmailService);
    createMomoPayment(userId: string, dto: CreateMomoPaymentDto): Promise<{
        paymentId: string;
        redirectUrl: string;
    }>;
    handleMomoCallback(body: Record<string, unknown>): Promise<{
        message: string;
    }>;
    createBankTransfer(userId: string, dto: CreateBankTransferDto): Promise<{
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
    }>;
    confirmPayment(paymentId: string, adminId: string): Promise<{
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
    }>;
    findAll(query: QueryPaymentDto): Promise<PaginatedResult<unknown>>;
}
