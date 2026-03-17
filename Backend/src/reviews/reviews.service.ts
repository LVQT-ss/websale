import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { PaginatedResult } from '../common/dto/pagination.dto.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { QueryReviewDto } from './dto/query-review.dto.js';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByTemplate(
    templateId: string,
    query: QueryReviewDto,
  ): Promise<PaginatedResult<unknown>> {
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

  async findAllAdmin(query: QueryReviewDto): Promise<PaginatedResult<unknown>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
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
          user: {
            select: { id: true, fullName: true, email: true, avatar: true },
          },
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

  async create(userId: string, templateId: string, dto: CreateReviewDto) {
    // Verify user has a PAID or COMPLETED order containing this template
    const order = await this.prisma.order.findFirst({
      where: {
        userId,
        status: { in: ['PAID', 'COMPLETED'] },
        items: { some: { templateId } },
      },
      select: { id: true },
    });

    if (!order) {
      throw new ForbiddenException(
        'You must purchase this template before leaving a review',
      );
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
    } catch (error) {
      if (
        error instanceof Object &&
        'code' in error &&
        (error as { code: string }).code === 'P2002'
      ) {
        throw new ConflictException('You have already reviewed this template');
      }
      throw error;
    }
  }

  async approve(reviewId: string) {
    const review = await this.ensureReviewExists(reviewId);

    const updated = await this.prisma.templateReview.update({
      where: { id: reviewId },
      data: { isApproved: true },
    });

    await this.recalculateRating(review.templateId);

    return updated;
  }

  async remove(reviewId: string) {
    const review = await this.ensureReviewExists(reviewId);

    await this.prisma.templateReview.delete({
      where: { id: reviewId },
    });

    await this.recalculateRating(review.templateId);

    return { deleted: true };
  }

  private async recalculateRating(templateId: string): Promise<void> {
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

  private async ensureReviewExists(reviewId: string) {
    const review = await this.prisma.templateReview.findUnique({
      where: { id: reviewId },
      select: { id: true, templateId: true },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }
}
