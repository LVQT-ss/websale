import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CustomizeService } from './customize.service.js';
import { CreateCustomizeDto } from './dto/create-customize.dto.js';
import { QuoteCustomizeDto } from './dto/quote-customize.dto.js';
import { DeliverCustomizeDto } from './dto/deliver-customize.dto.js';
import { MessageDto } from './dto/message.dto.js';
import { QueryCustomizeDto } from './dto/query-customize.dto.js';
import { RevisionCustomizeDto } from './dto/revision-customize.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { UserPayload } from '../auth/interfaces/jwt-payload.interface.js';

@Controller('customize')
@UseGuards(JwtAuthGuard)
export class CustomizeController {
  constructor(private readonly customizeService: CustomizeService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('CUSTOMER')
  create(@CurrentUser() user: UserPayload, @Body() dto: CreateCustomizeDto) {
    return this.customizeService.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: UserPayload, @Query() query: QueryCustomizeDto) {
    return this.customizeService.findAll(user.id, user.role, query);
  }

  @Get(':id')
  findOne(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    return this.customizeService.findOne(id, user.id, user.role);
  }

  @Patch(':id/quote')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF')
  quote(@Param('id') id: string, @Body() dto: QuoteCustomizeDto) {
    return this.customizeService.quote(id, dto);
  }

  @Patch(':id/accept')
  @UseGuards(RolesGuard)
  @Roles('CUSTOMER')
  accept(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    return this.customizeService.accept(id, user.id);
  }

  @Patch(':id/deliver')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF')
  deliver(@Param('id') id: string, @Body() dto: DeliverCustomizeDto) {
    return this.customizeService.deliver(id, dto);
  }

  @Patch(':id/approve')
  @UseGuards(RolesGuard)
  @Roles('CUSTOMER')
  approve(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    return this.customizeService.approve(id, user.id);
  }

  @Patch(':id/revision')
  @UseGuards(RolesGuard)
  @Roles('CUSTOMER')
  requestRevision(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body() dto: RevisionCustomizeDto,
  ) {
    return this.customizeService.requestRevision(id, user.id, dto.content);
  }

  @Patch(':id/cancel')
  cancel(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    return this.customizeService.cancel(id, user.id, user.role);
  }

  @Post(':id/messages')
  sendMessage(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body() dto: MessageDto,
  ) {
    const senderType = user.role === 'CUSTOMER' ? 'CUSTOMER' : 'STAFF';
    return this.customizeService.sendMessage(id, user.id, senderType, dto);
  }

  @Get(':id/messages')
  getMessages(@Param('id') id: string) {
    return this.customizeService.getMessages(id);
  }
}
