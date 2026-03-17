import { PrismaService } from '../prisma/prisma.service.js';
import type { PaginatedResult } from '../common/dto/pagination.dto.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { QueryReviewDto } from './dto/query-review.dto.js';
export declare class ReviewsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByTemplate(templateId: string, query: QueryReviewDto): Promise<PaginatedResult<unknown>>;
    findAllAdmin(query: QueryReviewDto): Promise<PaginatedResult<unknown>>;
    create(userId: string, templateId: string, dto: CreateReviewDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        rating: number;
        templateId: string;
        content: string;
        isApproved: boolean;
    }>;
    approve(reviewId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        rating: number;
        templateId: string;
        content: string;
        isApproved: boolean;
    }>;
    remove(reviewId: string): Promise<{
        deleted: boolean;
    }>;
    private recalculateRating;
    private ensureReviewExists;
}
