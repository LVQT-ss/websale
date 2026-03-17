import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    const port = this.config.get<number>('SMTP_PORT');
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: port ?? 587,
        secure: port === 465,
        auth: { user, pass },
      });
      this.logger.log(`SMTP configured: ${host}:${port ?? 587}`);
    } else {
      this.logger.warn(
        'SMTP not configured — emails will be logged to console only',
      );
    }
  }

  async send(options: SendMailOptions): Promise<void> {
    const from =
      this.config.get<string>('SMTP_FROM') ?? 'noreply@flavortemplate.com';

    if (!this.transporter) {
      this.logger.log(`[DEV EMAIL] To: ${options.to}`);
      this.logger.log(`[DEV EMAIL] Subject: ${options.subject}`);
      this.logger.log(`[DEV EMAIL] Body:\n${options.text ?? options.html}`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      this.logger.log(`Email sent to ${options.to}: ${options.subject}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}`, error);
      // Don't throw — email failures should not break business flows
    }
  }

  // ─── Transactional Email Templates ────────────────────────────────

  async sendOrderConfirmation(params: {
    to: string;
    customerName: string;
    orderNumber: string;
    items: { name: string; price: string }[];
    totalAmount: string;
  }): Promise<void> {
    const itemRows = params.items
      .map(
        (item) =>
          `<tr><td style="padding:8px;border-bottom:1px solid #e5e7eb">${item.name}</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right">${item.price}</td></tr>`,
      )
      .join('');

    await this.send({
      to: params.to,
      subject: `Xác nhận đơn hàng #${params.orderNumber}`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#1e40af">Cảm ơn bạn đã đặt hàng!</h2>
          <p>Xin chào <strong>${params.customerName}</strong>,</p>
          <p>Đơn hàng <strong>#${params.orderNumber}</strong> của bạn đã được tạo thành công.</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0">
            <thead>
              <tr style="background:#f9fafb">
                <th style="padding:8px;text-align:left;border-bottom:2px solid #e5e7eb">Template</th>
                <th style="padding:8px;text-align:right;border-bottom:2px solid #e5e7eb">Giá</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
            <tfoot>
              <tr>
                <td style="padding:8px;font-weight:bold">Tổng cộng</td>
                <td style="padding:8px;font-weight:bold;text-align:right">${params.totalAmount}</td>
              </tr>
            </tfoot>
          </table>
          <p>Vui lòng thanh toán để hoàn tất đơn hàng.</p>
          <p style="color:#6b7280;font-size:14px">— Flavor Template</p>
        </div>
      `,
      text: `Xin chào ${params.customerName}, đơn hàng #${params.orderNumber} đã được tạo. Tổng: ${params.totalAmount}. Vui lòng thanh toán.`,
    });
  }

  async sendPaymentConfirmation(params: {
    to: string;
    customerName: string;
    orderNumber: string;
    totalAmount: string;
  }): Promise<void> {
    await this.send({
      to: params.to,
      subject: `Thanh toán thành công — Đơn hàng #${params.orderNumber}`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#16a34a">Thanh toán thành công!</h2>
          <p>Xin chào <strong>${params.customerName}</strong>,</p>
          <p>Đơn hàng <strong>#${params.orderNumber}</strong> đã được thanh toán thành công với số tiền <strong>${params.totalAmount}</strong>.</p>
          <p>Bạn có thể tải template ngay tại trang <a href="${this.config.get('CORS_ORIGIN') ?? 'http://localhost:3000'}/account/downloads" style="color:#1e40af">Downloads</a>.</p>
          <p style="color:#6b7280;font-size:14px">— Flavor Template</p>
        </div>
      `,
      text: `Xin chào ${params.customerName}, đơn hàng #${params.orderNumber} đã thanh toán ${params.totalAmount}. Vào /account/downloads để tải template.`,
    });
  }

  async sendCustomizeQuote(params: {
    to: string;
    customerName: string;
    requestNumber: string;
    quotedPrice: string;
    quotedDays: number;
  }): Promise<void> {
    await this.send({
      to: params.to,
      subject: `Báo giá yêu cầu tuỳ chỉnh #${params.requestNumber}`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#1e40af">Báo giá yêu cầu tuỳ chỉnh</h2>
          <p>Xin chào <strong>${params.customerName}</strong>,</p>
          <p>Yêu cầu <strong>#${params.requestNumber}</strong> đã được báo giá:</p>
          <ul>
            <li><strong>Giá:</strong> ${params.quotedPrice}</li>
            <li><strong>Thời gian:</strong> ${params.quotedDays} ngày</li>
          </ul>
          <p>Vui lòng vào tài khoản để xác nhận hoặc từ chối báo giá.</p>
          <p style="color:#6b7280;font-size:14px">— Flavor Template</p>
        </div>
      `,
      text: `Yêu cầu #${params.requestNumber} đã được báo giá ${params.quotedPrice}, ${params.quotedDays} ngày. Vào tài khoản để xác nhận.`,
    });
  }

  async sendWelcome(params: { to: string; fullName: string }): Promise<void> {
    await this.send({
      to: params.to,
      subject: 'Chào mừng đến với Flavor Template!',
      html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#1e40af">Chào mừng!</h2>
          <p>Xin chào <strong>${params.fullName}</strong>,</p>
          <p>Cảm ơn bạn đã đăng ký tài khoản tại <strong>Flavor Template</strong>.</p>
          <p>Khám phá các template chất lượng cao tại <a href="${this.config.get('CORS_ORIGIN') ?? 'http://localhost:3000'}/templates" style="color:#1e40af">đây</a>.</p>
          <p style="color:#6b7280;font-size:14px">— Flavor Template</p>
        </div>
      `,
      text: `Xin chào ${params.fullName}, cảm ơn bạn đã đăng ký. Khám phá templates tại /templates.`,
    });
  }
}
