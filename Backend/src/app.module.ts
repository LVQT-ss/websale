import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { TemplatesModule } from './templates/templates.module.js';
import { OrdersModule } from './orders/orders.module.js';
import { PaymentsModule } from './payments/payments.module.js';
import { ReviewsModule } from './reviews/reviews.module.js';
import { WishlistModule } from './wishlist/wishlist.module.js';
import { SettingsModule } from './settings/settings.module.js';
import { StaffModule } from './staff/staff.module.js';
import { CustomizeModule } from './customize/customize.module.js';
import { ReportsModule } from './reports/reports.module.js';
import { EmailModule } from './email/email.module.js';
import { StorageModule } from './storage/storage.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    EmailModule,
    StorageModule,
    AuthModule,
    TemplatesModule,
    OrdersModule,
    PaymentsModule,
    ReviewsModule,
    WishlistModule,
    SettingsModule,
    StaffModule,
    CustomizeModule,
    ReportsModule,
  ],
})
export class AppModule {}
