import { PrismaService } from '../prisma/prisma.service.js';
export declare class WishlistService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(userId: string): Promise<({
        template: {
            name: string;
            id: string;
            slug: string;
            category: import("@prisma/client").$Enums.TemplateCategory;
            tech: import("@prisma/client").$Enums.TemplateTech;
            price: import("@prisma/client/runtime/library").Decimal;
            thumbnail: string;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        templateId: string;
    })[]>;
    toggle(userId: string, templateId: string): Promise<{
        added: boolean;
    }>;
    isWishlisted(userId: string, templateId: string): Promise<boolean>;
}
