import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service.js';
import {
  PaymentsController,
  AdminPaymentsController,
} from './payments.controller.js';

@Module({
  controllers: [PaymentsController, AdminPaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
