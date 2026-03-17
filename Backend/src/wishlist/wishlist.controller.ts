import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { UserPayload } from '../auth/interfaces/jwt-payload.interface.js';

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
@Roles('CUSTOMER')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  findAll(@CurrentUser() user: UserPayload) {
    return this.wishlistService.findAll(user.id);
  }

  @Post(':templateId')
  toggle(
    @Param('templateId') templateId: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.wishlistService.toggle(user.id, templateId);
  }

  @Get('check/:templateId')
  async isWishlisted(
    @Param('templateId') templateId: string,
    @CurrentUser() user: UserPayload,
  ) {
    const wishlisted = await this.wishlistService.isWishlisted(
      user.id,
      templateId,
    );
    return { wishlisted };
  }
}
