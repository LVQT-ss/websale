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
exports.TemplatesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
let TemplatesService = class TemplatesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const where = this.buildWhereClause(query, true);
        const orderBy = this.buildOrderBy(query.sortBy);
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.template.findMany({
                where,
                orderBy,
                skip,
                take: limit,
                select: {
                    id: true,
                    slug: true,
                    name: true,
                    shortDesc: true,
                    category: true,
                    tech: true,
                    price: true,
                    originalPrice: true,
                    currency: true,
                    thumbnail: true,
                    demoUrl: true,
                    features: true,
                    pages: true,
                    isFeatured: true,
                    viewCount: true,
                    purchaseCount: true,
                    avgRating: true,
                    createdAt: true,
                },
            }),
            this.prisma.template.count({ where }),
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
    async findBySlug(slug) {
        const template = await this.prisma.template.findUnique({
            where: { slug, isActive: true },
            include: {
                _count: {
                    select: { reviews: true },
                },
            },
        });
        if (!template) {
            throw new common_1.NotFoundException('Template not found');
        }
        this.prisma.template
            .update({
            where: { id: template.id },
            data: { viewCount: { increment: 1 } },
        })
            .catch(() => {
        });
        return template;
    }
    async findFeatured() {
        return this.prisma.template.findMany({
            where: { isActive: true, isFeatured: true },
            orderBy: { sortOrder: 'asc' },
            take: 8,
            select: {
                id: true,
                slug: true,
                name: true,
                shortDesc: true,
                category: true,
                tech: true,
                price: true,
                originalPrice: true,
                currency: true,
                thumbnail: true,
                demoUrl: true,
                isFeatured: true,
                avgRating: true,
                purchaseCount: true,
                createdAt: true,
            },
        });
    }
    async findAllAdmin(query) {
        const where = this.buildWhereClause(query, false);
        const orderBy = this.buildOrderBy(query.sortBy);
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.template.findMany({
                where,
                orderBy,
                skip,
                take: limit,
                include: {
                    _count: {
                        select: { reviews: true, orderItems: true },
                    },
                },
            }),
            this.prisma.template.count({ where }),
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
    async create(dto) {
        return this.prisma.template.create({
            data: {
                slug: dto.slug,
                name: dto.name,
                description: dto.description,
                shortDesc: dto.shortDesc,
                category: dto.category,
                tech: dto.tech,
                price: dto.price,
                originalPrice: dto.originalPrice,
                thumbnail: dto.thumbnail,
                images: dto.images,
                demoUrl: dto.demoUrl,
                fileUrl: dto.fileUrl,
                fileSize: dto.fileSize,
                version: dto.version,
                metaTitle: dto.metaTitle,
                metaDesc: dto.metaDesc,
                features: dto.features,
                pages: dto.pages,
                isActive: dto.isActive,
                isFeatured: dto.isFeatured,
                sortOrder: dto.sortOrder,
            },
        });
    }
    async update(id, dto) {
        await this.ensureTemplateExists(id);
        return this.prisma.template.update({
            where: { id },
            data: dto,
        });
    }
    async remove(id) {
        await this.ensureTemplateExists(id);
        return this.prisma.template.update({
            where: { id },
            data: { isActive: false },
        });
    }
    async ensureTemplateExists(id) {
        const template = await this.prisma.template.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!template) {
            throw new common_1.NotFoundException('Template not found');
        }
    }
    buildWhereClause(query, publicOnly) {
        const where = {};
        if (publicOnly) {
            where.isActive = true;
        }
        if (query.search) {
            where.name = { contains: query.search, mode: 'insensitive' };
        }
        if (query.category) {
            where.category = query.category;
        }
        if (query.tech) {
            where.tech = query.tech;
        }
        if (query.minPrice !== undefined || query.maxPrice !== undefined) {
            where.price = {};
            if (query.minPrice !== undefined) {
                where.price.gte = query.minPrice;
            }
            if (query.maxPrice !== undefined) {
                where.price.lte = query.maxPrice;
            }
        }
        if (query.isFeatured !== undefined) {
            where.isFeatured = query.isFeatured;
        }
        return where;
    }
    buildOrderBy(sortBy) {
        switch (sortBy) {
            case 'price':
                return { price: 'asc' };
            case 'newest':
                return { createdAt: 'desc' };
            case 'popular':
                return { purchaseCount: 'desc' };
            case 'rating':
                return { avgRating: 'desc' };
            default:
                return { createdAt: 'desc' };
        }
    }
};
exports.TemplatesService = TemplatesService;
exports.TemplatesService = TemplatesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService])
], TemplatesService);
//# sourceMappingURL=templates.service.js.map