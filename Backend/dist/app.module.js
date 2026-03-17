"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const prisma_module_js_1 = require("./prisma/prisma.module.js");
const auth_module_js_1 = require("./auth/auth.module.js");
const templates_module_js_1 = require("./templates/templates.module.js");
const orders_module_js_1 = require("./orders/orders.module.js");
const payments_module_js_1 = require("./payments/payments.module.js");
const reviews_module_js_1 = require("./reviews/reviews.module.js");
const wishlist_module_js_1 = require("./wishlist/wishlist.module.js");
const settings_module_js_1 = require("./settings/settings.module.js");
const staff_module_js_1 = require("./staff/staff.module.js");
const customize_module_js_1 = require("./customize/customize.module.js");
const reports_module_js_1 = require("./reports/reports.module.js");
const email_module_js_1 = require("./email/email.module.js");
const storage_module_js_1 = require("./storage/storage.module.js");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            throttler_1.ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
            prisma_module_js_1.PrismaModule,
            email_module_js_1.EmailModule,
            storage_module_js_1.StorageModule,
            auth_module_js_1.AuthModule,
            templates_module_js_1.TemplatesModule,
            orders_module_js_1.OrdersModule,
            payments_module_js_1.PaymentsModule,
            reviews_module_js_1.ReviewsModule,
            wishlist_module_js_1.WishlistModule,
            settings_module_js_1.SettingsModule,
            staff_module_js_1.StaffModule,
            customize_module_js_1.CustomizeModule,
            reports_module_js_1.ReportsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map