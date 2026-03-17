import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { EmailService } from '../email/email.service.js';
import type { PaginatedResult } from '../common/dto/pagination.dto.js';
import { CreateCustomizeDto } from './dto/create-customize.dto.js';
import { QuoteCustomizeDto } from './dto/quote-customize.dto.js';
import { DeliverCustomizeDto } from './dto/deliver-customize.dto.js';
import { MessageDto } from './dto/message.dto.js';
import { QueryCustomizeDto } from './dto/query-customize.dto.js';

@Injectable()
export class CustomizeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
  ) {}

  /* ------------------------------------------------------------------ */
  /*  Create                                                             */
  /* ------------------------------------------------------------------ */

  async create(userId: string, dto: CreateCustomizeDto) {
    // Verify template exists
    const template = await this.prisma.template.findUnique({
      where: { id: dto.templateId },
      select: { id: true },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    // Generate requestNumber: CR-YYYYMMDD-XXX
    const now = new Date();
    const datePart = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('');
    const randomPart = String(Math.floor(Math.random() * 900) + 100);
    const requestNumber = `CR-${datePart}-${randomPart}`;

    return this.prisma.customizeRequest.create({
      data: {
        requestNumber,
        userId,
        templateId: dto.templateId,
        requirements: dto.requirements,
        referenceUrls: dto.referenceUrls ?? [],
        status: 'PENDING',
      },
      include: {
        user: {
          select: { id: true, email: true, fullName: true },
        },
        template: {
          select: { id: true, name: true, slug: true, thumbnail: true },
        },
      },
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Find All (paginated)                                               */
  /* ------------------------------------------------------------------ */

  async findAll(
    userId: string,
    role: string,
    query: QueryCustomizeDto,
  ): Promise<PaginatedResult<unknown>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.CustomizeRequestWhereInput = {};

    // CUSTOMER can only see their own requests
    if (role === 'CUSTOMER') {
      where.userId = userId;
    }

    if (query.status) {
      where.status = query.status;
    }

    const [data, total] = await Promise.all([
      this.prisma.customizeRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: { id: true, email: true, fullName: true },
          },
          template: {
            select: { id: true, name: true, slug: true, thumbnail: true },
          },
        },
      }),
      this.prisma.customizeRequest.count({ where }),
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

  /* ------------------------------------------------------------------ */
  /*  Find One                                                           */
  /* ------------------------------------------------------------------ */

  async findOne(id: string, userId: string, role: string) {
    const request = await this.prisma.customizeRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, email: true, fullName: true },
        },
        template: {
          select: { id: true, name: true, slug: true, thumbnail: true },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!request) {
      throw new NotFoundException('Customize request not found');
    }

    if (role === 'CUSTOMER' && request.userId !== userId) {
      throw new ForbiddenException('You can only view your own requests');
    }

    return request;
  }

  /* ------------------------------------------------------------------ */
  /*  Quote (STAFF/ADMIN)                                                */
  /* ------------------------------------------------------------------ */

  async quote(id: string, dto: QuoteCustomizeDto) {
    const request = await this.prisma.customizeRequest.findUnique({
      where: { id },
      include: { user: { select: { email: true, fullName: true } } },
    });

    if (!request) {
      throw new NotFoundException('Customize request not found');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException(
        `Cannot quote a request with status: ${request.status}`,
      );
    }

    const updated = await this.prisma.customizeRequest.update({
      where: { id },
      data: {
        quotedPrice: new Prisma.Decimal(dto.quotedPrice),
        quotedDays: dto.quotedDays,
        status: 'QUOTED',
      },
    });

    // Send quote notification email (fire-and-forget)
    this.email
      .sendCustomizeQuote({
        to: request.user.email,
        customerName: request.user.fullName,
        requestNumber: request.requestNumber,
        quotedPrice:
          new Intl.NumberFormat('vi-VN').format(dto.quotedPrice) + ' ₫',
        quotedDays: dto.quotedDays,
      })
      .catch(() => {});

    return updated;
  }

  /* ------------------------------------------------------------------ */
  /*  Accept (CUSTOMER)                                                  */
  /* ------------------------------------------------------------------ */

  async accept(id: string, userId: string) {
    const request = await this.prisma.customizeRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException('Customize request not found');
    }

    if (request.userId !== userId) {
      throw new ForbiddenException('You can only accept your own requests');
    }

    if (request.status !== 'QUOTED') {
      throw new BadRequestException(
        `Cannot accept a request with status: ${request.status}`,
      );
    }

    return this.prisma.customizeRequest.update({
      where: { id },
      data: { status: 'ACCEPTED' },
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Deliver (STAFF/ADMIN)                                              */
  /* ------------------------------------------------------------------ */

  async deliver(id: string, dto: DeliverCustomizeDto) {
    const request = await this.prisma.customizeRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException('Customize request not found');
    }

    if (
      request.status !== 'ACCEPTED' &&
      request.status !== 'IN_PROGRESS' &&
      request.status !== 'REVISION'
    ) {
      throw new BadRequestException(
        `Cannot deliver a request with status: ${request.status}`,
      );
    }

    return this.prisma.customizeRequest.update({
      where: { id },
      data: {
        deliveryUrl: dto.deliveryUrl,
        deliveryNote: dto.deliveryNote ?? null,
        status: 'REVIEW',
      },
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Approve (CUSTOMER)                                                 */
  /* ------------------------------------------------------------------ */

  async approve(id: string, userId: string) {
    const request = await this.prisma.customizeRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException('Customize request not found');
    }

    if (request.userId !== userId) {
      throw new ForbiddenException('You can only approve your own requests');
    }

    if (request.status !== 'REVIEW') {
      throw new BadRequestException(
        `Cannot approve a request with status: ${request.status}`,
      );
    }

    return this.prisma.customizeRequest.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Request Revision (CUSTOMER)                                        */
  /* ------------------------------------------------------------------ */

  async requestRevision(id: string, userId: string, content: string) {
    const request = await this.prisma.customizeRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException('Customize request not found');
    }

    if (request.userId !== userId) {
      throw new ForbiddenException(
        'You can only request revisions for your own requests',
      );
    }

    if (request.status !== 'REVIEW') {
      throw new BadRequestException(
        `Cannot request revision for a request with status: ${request.status}`,
      );
    }

    // Update status and add revision message in a transaction
    const [updatedRequest] = await this.prisma.$transaction([
      this.prisma.customizeRequest.update({
        where: { id },
        data: { status: 'REVISION' },
      }),
      this.prisma.customizeMessage.create({
        data: {
          requestId: id,
          senderId: userId,
          senderType: 'CUSTOMER',
          content,
        },
      }),
    ]);

    return updatedRequest;
  }

  /* ------------------------------------------------------------------ */
  /*  Cancel                                                             */
  /* ------------------------------------------------------------------ */

  async cancel(id: string, userId: string, role: string) {
    const request = await this.prisma.customizeRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException('Customize request not found');
    }

    // CUSTOMER can only cancel their own requests
    if (role === 'CUSTOMER' && request.userId !== userId) {
      throw new ForbiddenException('You can only cancel your own requests');
    }

    if (
      request.status === 'COMPLETED' ||
      request.status === 'CANCELLED'
    ) {
      throw new BadRequestException(
        `Cannot cancel a request with status: ${request.status}`,
      );
    }

    return this.prisma.customizeRequest.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Messages                                                           */
  /* ------------------------------------------------------------------ */

  async sendMessage(
    requestId: string,
    senderId: string,
    senderType: string,
    dto: MessageDto,
  ) {
    // Verify request exists
    const request = await this.prisma.customizeRequest.findUnique({
      where: { id: requestId },
      select: { id: true },
    });

    if (!request) {
      throw new NotFoundException('Customize request not found');
    }

    return this.prisma.customizeMessage.create({
      data: {
        requestId,
        senderId,
        senderType,
        content: dto.content,
        attachments: dto.attachments as Prisma.InputJsonValue ?? Prisma.JsonNull,
      },
    });
  }

  async getMessages(requestId: string) {
    // Verify request exists
    const request = await this.prisma.customizeRequest.findUnique({
      where: { id: requestId },
      select: { id: true },
    });

    if (!request) {
      throw new NotFoundException('Customize request not found');
    }

    return this.prisma.customizeMessage.findMany({
      where: { requestId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
