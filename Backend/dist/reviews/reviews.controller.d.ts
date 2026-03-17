import { ReviewsService } from './reviews.service.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { QueryReviewDto } from './dto/query-review.dto.js';
import type { UserPayload } from '../auth/interfaces/jwt-payload.interface.js';
export declare class TemplateReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    findByTemplate(templateId: string, query: QueryReviewDto): Promise<import("../common/dto/pagination.dto.js").PaginatedResult<unknown>>;
    create(templateId: string, dto: CreateReviewDto, user: UserPayload): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        rating: number;
        templateId: string;
        content: string;
        isApproved: boolean;
    }>;
}
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    approve(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        rating: number;
        templateId: string;
        content: string;
        isApproved: boolean;
    }>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}
export declare class AdminReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    findAll(query: QueryReviewDto): Promise<import("../common/dto/pagination.dto.js").PaginatedResult<unknown>>;
}
