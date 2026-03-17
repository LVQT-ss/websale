import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { QueryReviewDto } from './dto/query-review.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { UserPayload } from '../auth/interfaces/jwt-payload.interface.js';

@Controller('templates/:templateId/reviews')
export class TemplateReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  findByTemplate(
    @Param('templateId') templateId: string,
    @Query() query: QueryReviewDto,
  ) {
    return this.reviewsService.findByTemplate(templateId, query);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles('CUSTOMER')
  create(
    @Param('templateId') templateId: string,
    @Body() dto: CreateReviewDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.reviewsService.create(user.id, templateId, dto);
  }
}

@Controller('reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Patch(':id/approve')
  @Roles('ADMIN', 'STAFF')
  approve(@Param('id') id: string) {
    return this.reviewsService.approve(id);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.reviewsService.remove(id);
  }
}

@Controller('admin/reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @Roles('ADMIN', 'STAFF')
  findAll(@Query() query: QueryReviewDto) {
    return this.reviewsService.findAllAdmin(query);
  }
}
