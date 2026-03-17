import { WishlistService } from './wishlist.service.js';
import type { UserPayload } from '../auth/interfaces/jwt-payload.interface.js';
export declare class WishlistController {
    private readonly wishlistService;
    constructor(wishlistService: WishlistService);
    findAll(user: UserPayload): Promise<({
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
    toggle(templateId: string, user: UserPayload): Promise<{
        added: boolean;
    }>;
    isWishlisted(templateId: string, user: UserPayload): Promise<{
        wishlisted: boolean;
    }>;
}
