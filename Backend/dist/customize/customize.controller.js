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
exports.CustomizeController = void 0;
const common_1 = require("@nestjs/common");
const customize_service_js_1 = require("./customize.service.js");
const create_customize_dto_js_1 = require("./dto/create-customize.dto.js");
const quote_customize_dto_js_1 = require("./dto/quote-customize.dto.js");
const deliver_customize_dto_js_1 = require("./dto/deliver-customize.dto.js");
const message_dto_js_1 = require("./dto/message.dto.js");
const query_customize_dto_js_1 = require("./dto/query-customize.dto.js");
const revision_customize_dto_js_1 = require("./dto/revision-customize.dto.js");
const jwt_auth_guard_js_1 = require("../common/guards/jwt-auth.guard.js");
const roles_guard_js_1 = require("../common/guards/roles.guard.js");
const roles_decorator_js_1 = require("../common/decorators/roles.decorator.js");
const current_user_decorator_js_1 = require("../common/decorators/current-user.decorator.js");
let CustomizeController = class CustomizeController {
    customizeService;
    constructor(customizeService) {
        this.customizeService = customizeService;
    }
    create(user, dto) {
        return this.customizeService.create(user.id, dto);
    }
    findAll(user, query) {
        return this.customizeService.findAll(user.id, user.role, query);
    }
    findOne(user, id) {
        return this.customizeService.findOne(id, user.id, user.role);
    }
    quote(id, dto) {
        return this.customizeService.quote(id, dto);
    }
    accept(user, id) {
        return this.customizeService.accept(id, user.id);
    }
    deliver(id, dto) {
        return this.customizeService.deliver(id, dto);
    }
    approve(user, id) {
        return this.customizeService.approve(id, user.id);
    }
    requestRevision(user, id, dto) {
        return this.customizeService.requestRevision(id, user.id, dto.content);
    }
    cancel(user, id) {
        return this.customizeService.cancel(id, user.id, user.role);
    }
    sendMessage(user, id, dto) {
        const senderType = user.role === 'CUSTOMER' ? 'CUSTOMER' : 'STAFF';
        return this.customizeService.sendMessage(id, user.id, senderType, dto);
    }
    getMessages(id) {
        return this.customizeService.getMessages(id);
    }
};
exports.CustomizeController = CustomizeController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(roles_guard_js_1.RolesGuard),
    (0, roles_decorator_js_1.Roles)('CUSTOMER'),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, create_customize_dto_js_1.CreateCustomizeDto]),
    __metadata("design:returntype", void 0)
], CustomizeController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, query_customize_dto_js_1.QueryCustomizeDto]),
    __metadata("design:returntype", void 0)
], CustomizeController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, String]),
    __metadata("design:returntype", void 0)
], CustomizeController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/quote'),
    (0, common_1.UseGuards)(roles_guard_js_1.RolesGuard),
    (0, roles_decorator_js_1.Roles)('ADMIN', 'STAFF'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, quote_customize_dto_js_1.QuoteCustomizeDto]),
    __metadata("design:returntype", void 0)
], CustomizeController.prototype, "quote", null);
__decorate([
    (0, common_1.Patch)(':id/accept'),
    (0, common_1.UseGuards)(roles_guard_js_1.RolesGuard),
    (0, roles_decorator_js_1.Roles)('CUSTOMER'),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, String]),
    __metadata("design:returntype", void 0)
], CustomizeController.prototype, "accept", null);
__decorate([
    (0, common_1.Patch)(':id/deliver'),
    (0, common_1.UseGuards)(roles_guard_js_1.RolesGuard),
    (0, roles_decorator_js_1.Roles)('ADMIN', 'STAFF'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, deliver_customize_dto_js_1.DeliverCustomizeDto]),
    __metadata("design:returntype", void 0)
], CustomizeController.prototype, "deliver", null);
__decorate([
    (0, common_1.Patch)(':id/approve'),
    (0, common_1.UseGuards)(roles_guard_js_1.RolesGuard),
    (0, roles_decorator_js_1.Roles)('CUSTOMER'),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, String]),
    __metadata("design:returntype", void 0)
], CustomizeController.prototype, "approve", null);
__decorate([
    (0, common_1.Patch)(':id/revision'),
    (0, common_1.UseGuards)(roles_guard_js_1.RolesGuard),
    (0, roles_decorator_js_1.Roles)('CUSTOMER'),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, String, revision_customize_dto_js_1.RevisionCustomizeDto]),
    __metadata("design:returntype", void 0)
], CustomizeController.prototype, "requestRevision", null);
__decorate([
    (0, common_1.Patch)(':id/cancel'),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, String]),
    __metadata("design:returntype", void 0)
], CustomizeController.prototype, "cancel", null);
__decorate([
    (0, common_1.Post)(':id/messages'),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, String, message_dto_js_1.MessageDto]),
    __metadata("design:returntype", void 0)
], CustomizeController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Get)(':id/messages'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CustomizeController.prototype, "getMessages", null);
exports.CustomizeController = CustomizeController = __decorate([
    (0, common_1.Controller)('customize'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard),
    __metadata("design:paramtypes", [customize_service_js_1.CustomizeService])
], CustomizeController);
//# sourceMappingURL=customize.controller.js.map