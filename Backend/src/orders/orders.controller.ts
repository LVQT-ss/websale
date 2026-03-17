import {
  Controller,
  Get,
  Headers,
  Ip,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { QueryOrderDto } from './dto/query-order.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { UserPayload } from '../auth/interfaces/jwt-payload.interface.js';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles('CUSTOMER')
  create(@CurrentUser() user: UserPayload, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: UserPayload, @Query() query: QueryOrderDto) {
    return this.ordersService.findAll(user.id, user.role, query);
  }

  @Get(':id')
  findOne(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    return this.ordersService.findOne(id, user.id, user.role);
  }

  @Get(':id/download/:templateId')
  @Roles('CUSTOMER')
  getDownloadUrl(
    @CurrentUser() user: UserPayload,
    @Param('id') orderId: string,
    @Param('templateId') templateId: string,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.ordersService.getDownloadUrl(
      orderId,
      templateId,
      user.id,
      ip ?? '0.0.0.0',
      userAgent ?? 'unknown',
    );
  }
}
