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
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
let ReviewsService = class ReviewsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByTemplate(templateId, query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const skip = (page - 1) * limit;
        const where = { templateId, isApproved: true };
        const [data, total] = await Promise.all([
            this.prisma.templateReview.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                include: {
                    user: {
                        select: { fullName: true, avatar: true },
                    },
                },
            }),
            this.prisma.templateReview.count({ where }),
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
    async findAllAdmin(query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.isApproved !== undefined) {
            where.isApproved = query.isApproved;
        }
        const [data, total] = await Promise.all([
            this.prisma.templateReview.findMany({
                where,
                orderBy: [{ isApproved: 'asc' }, { createdAt: 'desc' }],
                skip,
                take: limit,
                include: {
                    user: { select: { id: true, fullName: true, email: true, avatar: true } },
                    template: { select: { id: true, name: true, slug: true } },
                },
            }),
            this.prisma.templateReview.count({ where }),
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
    async create(userId, templateId, dto) {
        const order = await this.prisma.order.findFirst({
            where: {
                userId,
                status: { in: ['PAID', 'COMPLETED'] },
                items: { some: { templateId } },
            },
            select: { id: true },
        });
        if (!order) {
            throw new common_1.ForbiddenException('You must purchase this template before leaving a review');
        }
        try {
            return await this.prisma.templateReview.create({
                data: {
                    userId,
                    templateId,
                    rating: dto.rating,
                    content: dto.content,
                },
            });
        }
        catch (error) {
            if (error instanceof Object &&
                'code' in error &&
                error.code === 'P2002') {
                throw new common_1.ConflictException('You have already reviewed this template');
            }
            throw error;
        }
    }
    async approve(reviewId) {
        const review = await this.ensureReviewExists(reviewId);
        const updated = await this.prisma.templateReview.update({
            where: { id: reviewId },
            data: { isApproved: true },
        });
        await this.recalculateRating(review.templateId);
        return updated;
    }
    async remove(reviewId) {
        const review = await this.ensureReviewExists(reviewId);
        await this.prisma.templateReview.delete({
            where: { id: reviewId },
        });
        await this.recalculateRating(review.templateId);
        return { deleted: true };
    }
    async recalculateRating(templateId) {
        const result = await this.prisma.templateReview.aggregate({
            where: { templateId, isApproved: true },
            _avg: { rating: true },
        });
        const avgRating = result._avg.rating ?? 0;
        await this.prisma.template.update({
            where: { id: templateId },
            data: { avgRating },
        });
    }
    async ensureReviewExists(reviewId) {
        const review = await this.prisma.templateReview.findUnique({
            where: { id: reviewId },
            select: { id: true, templateId: true },
        });
        if (!review) {
            throw new common_1.NotFoundException('Review not found');
        }
        return review;
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map