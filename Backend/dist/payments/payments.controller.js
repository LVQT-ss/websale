"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminPaymentsController = exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const payments_service_js_1 = require("./payments.service.js");
const create_momo_payment_dto_js_1 = require("./dto/create-momo-payment.dto.js");
const create_bank_transfer_dto_js_1 = require("./dto/create-bank-transfer.dto.js");
const confirm_payment_dto_js_1 = require("./dto/confirm-payment.dto.js");
const query_payment_dto_js_1 = require("./dto/query-payment.dto.js");
const jwt_auth_guard_js_1 = require("../common/guards/jwt-auth.guard.js");
const roles_guard_js_1 = require("../common/guards/roles.guard.js");
const roles_decorator_js_1 = require("../common/decorators/roles.decorator.js");
const current_user_decorator_js_1 = require("../common/decorators/current-user.decorator.js");
let PaymentsController = class PaymentsController {
    paymentsService;
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
    }
    createMomoPayment(user, dto) {
        return this.paymentsService.createMomoPayment(user.id, dto);
    }
    handleMomoCallback(body) {
        return this.paymentsService.handleMomoCallback(body);
    }
    createBankTransfer(user, dto) {
        return this.paymentsService.createBankTransfer(user.id, dto);
    }
    confirmPayment(id, user, _dto) {
        return this.paymentsService.confirmPayment(id, user.id);
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)('momo'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard),
    (0, roles_decorator_js_1.Roles)('CUSTOMER'),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, create_momo_payment_dto_js_1.CreateMomoPaymentDto]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "createMomoPayment", null);
__decorate([
    (0, common_1.Post)('momo/callback'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "handleMomoCallback", null);
__decorate([
    (0, common_1.Post)('bank-transfer'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard),
    (0, roles_decorator_js_1.Roles)('CUSTOMER'),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, create_bank_transfer_dto_js_1.CreateBankTransferDto]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "createBankTransfer", null);
__decorate([
    (0, common_1.Patch)(':id/confirm'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, roles_guard_js_1.RolesGuard),
    (0, roles_decorator_js_1.Roles)('ADMIN', 'STAFF'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_js_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Function, confirm_payment_dto_js_1.ConfirmPaymentDto]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "confirmPayment", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [payments_service_js_1.PaymentsService])
], PaymentsController);
let AdminPaymentsController = class AdminPaymentsController {
    paymentsService;
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
    }
    findAll(query) {
        return this.paymentsService.findAll(query);
    }
};
exports.AdminPaymentsController = AdminPaymentsController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_js_1.Roles)('ADMIN', 'STAFF'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_payment_dto_js_1.QueryPaymentDto]),
    __metadata("design:returntype", void 0)
], AdminPaymentsController.prototype, "findAll", null);
exports.AdminPaymentsController = AdminPaymentsController = __decorate([
    (0, common_1.Controller)('admin/payments'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, roles_guard_js_1.RolesGuard),
    __metadata("design:paramtypes", [payments_service_js_1.PaymentsService])
], AdminPaymentsController);
//# sourceMappingURL=payments.controller.js.map