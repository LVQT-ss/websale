import { PaymentsService } from './payments.service.js';
import { CreateMomoPaymentDto } from './dto/create-momo-payment.dto.js';
import { CreateBankTransferDto } from './dto/create-bank-transfer.dto.js';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto.js';
import { QueryPaymentDto } from './dto/query-payment.dto.js';
import type { UserPayload } from '../auth/interfaces/jwt-payload.interface.js';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    createMomoPayment(user: UserPayload, dto: CreateMomoPaymentDto): Promise<{
        paymentId: string;
        redirectUrl: string;
    }>;
    handleMomoCallback(body: Record<string, unknown>): Promise<{
        message: string;
    }>;
    createBankTransfer(user: UserPayload, dto: CreateBankTransferDto): Promise<{
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
    }>;
    confirmPayment(id: string, user: UserPayload, _dto: ConfirmPaymentDto): Promise<{
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
    }>;
}
export declare class AdminPaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    findAll(query: QueryPaymentDto): Promise<import("../common/dto/pagination.dto.js").PaginatedResult<unknown>>;
}
