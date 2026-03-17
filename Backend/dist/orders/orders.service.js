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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
const storage_service_js_1 = require("../storage/storage.service.js");
const email_service_js_1 = require("../email/email.service.js");
let OrdersService = class OrdersService {
    prisma;
    storage;
    email;
    constructor(prisma, storage, email) {
        this.prisma = prisma;
        this.storage = storage;
        this.email = email;
    }
    async create(userId, dto) {
        const templateIds = dto.items.map((item) => item.templateId);
        const templates = await this.prisma.template.findMany({
            where: { id: { in: templateIds }, isActive: true },
            select: { id: true, name: true, price: true },
        });
        if (templates.length !== templateIds.length) {
            const foundIds = new Set(templates.map((t) => t.id));
            const missing = templateIds.filter((id) => !foundIds.has(id));
            throw new common_1.BadRequestException(`Templates not found or inactive: ${missing.join(', ')}`);
        }
        const templateMap = new Map(templates.map((t) => [t.id, t]));
        const totalAmount = templates.reduce((sum, t) => sum.add(t.price), new client_1.Prisma.Decimal(0));
        const now = new Date();
        const datePart = [
            now.getFullYear(),
            String(now.getMonth() + 1).padStart(2, '0'),
            String(now.getDate()).padStart(2, '0'),
        ].join('');
        const randomPart = String(Math.floor(Math.random() * 900) + 100);
        const orderNumber = `FT-${datePart}-${randomPart}`;
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
                        const t = templateMap.get(templateId);
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
        this.email
            .sendOrderConfirmation({
            to: user.email,
            customerName: user.fullName,
            orderNumber,
            items: templates.map((t) => ({
                name: t.name,
                price: new Intl.NumberFormat('vi-VN').format(Number(t.price)) + ' ₫',
            })),
            totalAmount: new Intl.NumberFormat('vi-VN').format(Number(totalAmount)) + ' ₫',
        })
            .catch(() => { });
        return order;
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
    async findOne(id, userId, role) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                items: true,
                payments: true,
            },
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (role === 'CUSTOMER' && order.userId !== userId) {
            throw new common_1.ForbiddenException('You can only view your own orders');
        }
        return order;
    }
    async getDownloadUrl(orderId, templateId, userId, ip, userAgent) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true },
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (order.userId !== userId) {
            throw new common_1.ForbiddenException('You can only download from your own orders');
        }
        if (order.status !== 'PAID' && order.status !== 'COMPLETED') {
            throw new common_1.BadRequestException('Downloads are only available for paid or completed orders');
        }
        const orderItem = order.items.find((item) => item.templateId === templateId);
        if (!orderItem) {
            throw new common_1.NotFoundException('Template not found in this order');
        }
        const template = await this.prisma.template.findUnique({
            where: { id: templateId },
            select: { fileUrl: true, slug: true },
        });
        if (!template) {
            throw new common_1.NotFoundException('Template not found');
        }
        await this.prisma.downloadLog.create({
            data: {
                userId,
                templateId,
                orderId,
                ipAddress: ip,
                userAgent,
            },
        });
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
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService,
        storage_service_js_1.StorageService,
        email_service_js_1.EmailService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map