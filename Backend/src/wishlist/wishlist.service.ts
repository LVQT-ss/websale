import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.wishlist.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            thumbnail: true,
            category: true,
            tech: true,
          },
        },
      },
    });
  }

  async toggle(
    userId: string,
    templateId: string,
  ): Promise<{ added: boolean }> {
    const existing = await this.prisma.wishlist.findUnique({
      where: { userId_templateId: { userId, templateId } },
    });

    if (existing) {
      await this.prisma.wishlist.delete({
        where: { id: existing.id },
      });
      return { added: false };
    }

    await this.prisma.wishlist.create({
      data: { userId, templateId },
    });
    return { added: true };
  }

  async isWishlisted(userId: string, templateId: string): Promise<boolean> {
    const item = await this.prisma.wishlist.findUnique({
      where: { userId_templateId: { userId, templateId } },
      select: { id: true },
    });
    return !!item;
  }
}
