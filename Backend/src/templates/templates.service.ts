import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import type { PaginatedResult } from '../common/dto/pagination.dto.js';
import { CreateTemplateDto } from './dto/create-template.dto.js';
import { UpdateTemplateDto } from './dto/update-template.dto.js';
import { QueryTemplateDto } from './dto/query-template.dto.js';

@Injectable()
export class TemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryTemplateDto): Promise<PaginatedResult<unknown>> {
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

  async findBySlug(slug: string) {
    const template = await this.prisma.template.findUnique({
      where: { slug, isActive: true },
      include: {
        _count: {
          select: { reviews: true },
        },
      },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    // Increment view count without blocking the response
    this.prisma.template
      .update({
        where: { id: template.id },
        data: { viewCount: { increment: 1 } },
      })
      .catch(() => {
        // Silently ignore view count increment failures
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

  async findAllAdmin(query: QueryTemplateDto): Promise<PaginatedResult<unknown>> {
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

  async create(dto: CreateTemplateDto) {
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

  async update(id: string, dto: UpdateTemplateDto) {
    await this.ensureTemplateExists(id);

    return this.prisma.template.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.ensureTemplateExists(id);

    return this.prisma.template.update({
      where: { id },
      data: { isActive: false },
    });
  }

  private async ensureTemplateExists(id: string): Promise<void> {
    const template = await this.prisma.template.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }
  }

  private buildWhereClause(
    query: QueryTemplateDto,
    publicOnly: boolean,
  ): Prisma.TemplateWhereInput {
    const where: Prisma.TemplateWhereInput = {};

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

  private buildOrderBy(
    sortBy?: string,
  ): Prisma.TemplateOrderByWithRelationInput {
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
}
