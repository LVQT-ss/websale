import { TemplateCategory, TemplateTech } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto.js';
export declare class QueryTemplateDto extends PaginationDto {
    search?: string;
    category?: TemplateCategory;
    tech?: TemplateTech;
    minPrice?: number;
    maxPrice?: number;
    isFeatured?: boolean;
    sortBy?: 'price' | 'newest' | 'popular' | 'rating';
}
