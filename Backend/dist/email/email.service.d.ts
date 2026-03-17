import { ConfigService } from '@nestjs/config';
export interface SendMailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}
export declare class EmailService {
    private readonly config;
    private readonly logger;
    private transporter;
    constructor(config: ConfigService);
    send(options: SendMailOptions): Promise<void>;
    sendOrderConfirmation(params: {
        to: string;
        customerName: string;
        orderNumber: string;
        items: {
            name: string;
            price: string;
        }[];
        totalAmount: string;
    }): Promise<void>;
    sendPaymentConfirmation(params: {
        to: string;
        customerName: string;
        orderNumber: string;
        totalAmount: string;
    }): Promise<void>;
    sendCustomizeQuote(params: {
        to: string;
        customerName: string;
        requestNumber: string;
        quotedPrice: string;
        quotedDays: number;
    }): Promise<void>;
    sendWelcome(params: {
        to: string;
        fullName: string;
    }): Promise<void>;
}
