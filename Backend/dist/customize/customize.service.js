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
exports.CustomizeService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
const email_service_js_1 = require("../email/email.service.js");
let CustomizeService = class CustomizeService {
    prisma;
    email;
    constructor(prisma, email) {
        this.prisma = prisma;
        this.email = email;
    }
    async create(userId, dto) {
        const template = await this.prisma.template.findUnique({
            where: { id: dto.templateId },
            select: { id: true },
        });
        if (!template) {
            throw new common_1.NotFoundException('Template not found');
        }
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
    async findAll(userId, role, query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const skip = (page - 1) * limit;
        const where = {};
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
    async findOne(id, userId, role) {
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
            throw new common_1.NotFoundException('Customize request not found');
        }
        if (role === 'CUSTOMER' && request.userId !== userId) {
            throw new common_1.ForbiddenException('You can only view your own requests');
        }
        return request;
    }
    async quote(id, dto) {
        const request = await this.prisma.customizeRequest.findUnique({
            where: { id },
            include: { user: { select: { email: true, fullName: true } } },
        });
        if (!request) {
            throw new common_1.NotFoundException('Customize request not found');
        }
        if (request.status !== 'PENDING') {
            throw new common_1.BadRequestException(`Cannot quote a request with status: ${request.status}`);
        }
        const updated = await this.prisma.customizeRequest.update({
            where: { id },
            data: {
                quotedPrice: new client_1.Prisma.Decimal(dto.quotedPrice),
                quotedDays: dto.quotedDays,
                status: 'QUOTED',
            },
        });
        this.email
            .sendCustomizeQuote({
            to: request.user.email,
            customerName: request.user.fullName,
            requestNumber: request.requestNumber,
            quotedPrice: new Intl.NumberFormat('vi-VN').format(dto.quotedPrice) + ' ₫',
            quotedDays: dto.quotedDays,
        })
            .catch(() => { });
        return updated;
    }
    async accept(id, userId) {
        const request = await this.prisma.customizeRequest.findUnique({
            where: { id },
        });
        if (!request) {
            throw new common_1.NotFoundException('Customize request not found');
        }
        if (request.userId !== userId) {
            throw new common_1.ForbiddenException('You can only accept your own requests');
        }
        if (request.status !== 'QUOTED') {
            throw new common_1.BadRequestException(`Cannot accept a request with status: ${request.status}`);
        }
        return this.prisma.customizeRequest.update({
            where: { id },
            data: { status: 'ACCEPTED' },
        });
    }
    async deliver(id, dto) {
        const request = await this.prisma.customizeRequest.findUnique({
            where: { id },
        });
        if (!request) {
            throw new common_1.NotFoundException('Customize request not found');
        }
        if (request.status !== 'ACCEPTED' &&
            request.status !== 'IN_PROGRESS' &&
            request.status !== 'REVISION') {
            throw new common_1.BadRequestException(`Cannot deliver a request with status: ${request.status}`);
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
    async approve(id, userId) {
        const request = await this.prisma.customizeRequest.findUnique({
            where: { id },
        });
        if (!request) {
            throw new common_1.NotFoundException('Customize request not found');
        }
        if (request.userId !== userId) {
            throw new common_1.ForbiddenException('You can only approve your own requests');
        }
        if (request.status !== 'REVIEW') {
            throw new common_1.BadRequestException(`Cannot approve a request with status: ${request.status}`);
        }
        return this.prisma.customizeRequest.update({
            where: { id },
            data: {
                status: 'COMPLETED',
                completedAt: new Date(),
            },
        });
    }
    async requestRevision(id, userId, content) {
        const request = await this.prisma.customizeRequest.findUnique({
            where: { id },
        });
        if (!request) {
            throw new common_1.NotFoundException('Customize request not found');
        }
        if (request.userId !== userId) {
            throw new common_1.ForbiddenException('You can only request revisions for your own requests');
        }
        if (request.status !== 'REVIEW') {
            throw new common_1.BadRequestException(`Cannot request revision for a request with status: ${request.status}`);
        }
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
    async cancel(id, userId, role) {
        const request = await this.prisma.customizeRequest.findUnique({
            where: { id },
        });
        if (!request) {
            throw new common_1.NotFoundException('Customize request not found');
        }
        if (role === 'CUSTOMER' && request.userId !== userId) {
            throw new common_1.ForbiddenException('You can only cancel your own requests');
        }
        if (request.status === 'COMPLETED' ||
            request.status === 'CANCELLED') {
            throw new common_1.BadRequestException(`Cannot cancel a request with status: ${request.status}`);
        }
        return this.prisma.customizeRequest.update({
            where: { id },
            data: {
                status: 'CANCELLED',
                cancelledAt: new Date(),
            },
        });
    }
    async sendMessage(requestId, senderId, senderType, dto) {
        const request = await this.prisma.customizeRequest.findUnique({
            where: { id: requestId },
            select: { id: true },
        });
        if (!request) {
            throw new common_1.NotFoundException('Customize request not found');
        }
        return this.prisma.customizeMessage.create({
            data: {
                requestId,
                senderId,
                senderType,
                content: dto.content,
                attachments: dto.attachments ?? client_1.Prisma.JsonNull,
            },
        });
    }
    async getMessages(requestId) {
        const request = await this.prisma.customizeRequest.findUnique({
            where: { id: requestId },
            select: { id: true },
        });
        if (!request) {
            throw new common_1.NotFoundException('Customize request not found');
        }
        return this.prisma.customizeMessage.findMany({
            where: { requestId },
            orderBy: { createdAt: 'asc' },
        });
    }
};
exports.CustomizeService = CustomizeService;
exports.CustomizeService = CustomizeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService,
        email_service_js_1.EmailService])
], CustomizeService);
//# sourceMappingURL=customize.service.js.map