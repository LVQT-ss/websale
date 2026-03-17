import {
  Controller,
  Post,
  Patch,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PaymentsService } from './payments.service.js';
import { CreateMomoPaymentDto } from './dto/create-momo-payment.dto.js';
import { CreateBankTransferDto } from './dto/create-bank-transfer.dto.js';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto.js';
import { QueryPaymentDto } from './dto/query-payment.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { UserPayload } from '../auth/interfaces/jwt-payload.interface.js';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /** Customer initiates MoMo payment */
  @Post('momo')
  @UseGuards(JwtAuthGuard)
  @Roles('CUSTOMER')
  createMomoPayment(
    @CurrentUser() user: UserPayload,
    @Body() dto: CreateMomoPaymentDto,
  ) {
    return this.paymentsService.createMomoPayment(user.id, dto);
  }

  /** MoMo webhook callback — no auth */
  @Post('momo/callback')
  @HttpCode(HttpStatus.OK)
  handleMomoCallback(@Body() body: Record<string, unknown>) {
    return this.paymentsService.handleMomoCallback(body);
  }

  /** Customer initiates bank transfer */
  @Post('bank-transfer')
  @UseGuards(JwtAuthGuard)
  @Roles('CUSTOMER')
  createBankTransfer(
    @CurrentUser() user: UserPayload,
    @Body() dto: CreateBankTransferDto,
  ) {
    return this.paymentsService.createBankTransfer(user.id, dto);
  }

  /** Admin/Staff confirms bank transfer payment */
  @Patch(':id/confirm')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  confirmPayment(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
    @Body() _dto: ConfirmPaymentDto,
  ) {
    return this.paymentsService.confirmPayment(id, user.id);
  }
}

@Controller('admin/payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminPaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /** Admin/Staff lists all payments (paginated) */
  @Get()
  @Roles('ADMIN', 'STAFF')
  findAll(@Query() query: QueryPaymentDto) {
    return this.paymentsService.findAll(query);
  }
}
