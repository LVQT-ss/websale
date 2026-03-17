import { TemplateCategory, TemplateTech } from '@prisma/client';
export declare class CreateTemplateDto {
    slug: string;
    name: string;
    description: string;
    shortDesc: string;
    category: TemplateCategory;
    tech: TemplateTech;
    price: number;
    originalPrice?: number;
    thumbnail: string;
    images: string[];
    demoUrl: string;
    fileUrl: string;
    fileSize: number;
    version?: string;
    metaTitle?: string;
    metaDesc?: string;
    features: string[];
    pages?: number;
    isActive?: boolean;
    isFeatured?: boolean;
    sortOrder?: number;
}
