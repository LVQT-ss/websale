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
exports.AdminReviewsController = exports.ReviewsController = exports.TemplateReviewsController = void 0;
const common_1 = require("@nestjs/common");
const reviews_service_js_1 = require("./reviews.service.js");
const create_review_dto_js_1 = require("./dto/create-review.dto.js");
const query_review_dto_js_1 = require("./dto/query-review.dto.js");
const jwt_auth_guard_js_1 = require("../common/guards/jwt-auth.guard.js");
const roles_guard_js_1 = require("../common/guards/roles.guard.js");
const roles_decorator_js_1 = require("../common/decorators/roles.decorator.js");
const current_user_decorator_js_1 = require("../common/decorators/current-user.decorator.js");
let TemplateReviewsController = class TemplateReviewsController {
    reviewsService;
    constructor(reviewsService) {
        this.reviewsService = reviewsService;
    }
    findByTemplate(templateId, query) {
        return this.reviewsService.findByTemplate(templateId, query);
    }
    create(templateId, dto, user) {
        return this.reviewsService.create(user.id, templateId, dto);
    }
};
exports.TemplateReviewsController = TemplateReviewsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('templateId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, query_review_dto_js_1.QueryReviewDto]),
    __metadata("design:returntype", void 0)
], TemplateReviewsController.prototype, "findByTemplate", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard),
    (0, roles_decorator_js_1.Roles)('CUSTOMER'),
    __param(0, (0, common_1.Param)('templateId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_review_dto_js_1.CreateReviewDto, Function]),
    __metadata("design:returntype", void 0)
], TemplateReviewsController.prototype, "create", null);
exports.TemplateReviewsController = TemplateReviewsController = __decorate([
    (0, common_1.Controller)('templates/:templateId/reviews'),
    __metadata("design:paramtypes", [reviews_service_js_1.ReviewsService])
], TemplateReviewsController);
let ReviewsController = class ReviewsController {
    reviewsService;
    constructor(reviewsService) {
        this.reviewsService = reviewsService;
    }
    approve(id) {
        return this.reviewsService.approve(id);
    }
    remove(id) {
        return this.reviewsService.remove(id);
    }
};
exports.ReviewsController = ReviewsController;
__decorate([
    (0, common_1.Patch)(':id/approve'),
    (0, roles_decorator_js_1.Roles)('ADMIN', 'STAFF'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReviewsController.prototype, "approve", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_js_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReviewsController.prototype, "remove", null);
exports.ReviewsController = ReviewsController = __decorate([
    (0, common_1.Controller)('reviews'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, roles_guard_js_1.RolesGuard),
    __metadata("design:paramtypes", [reviews_service_js_1.ReviewsService])
], ReviewsController);
let AdminReviewsController = class AdminReviewsController {
    reviewsService;
    constructor(reviewsService) {
        this.reviewsService = reviewsService;
    }
    findAll(query) {
        return this.reviewsService.findAllAdmin(query);
    }
};
exports.AdminReviewsController = AdminReviewsController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_js_1.Roles)('ADMIN', 'STAFF'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_review_dto_js_1.QueryReviewDto]),
    __metadata("design:returntype", void 0)
], AdminReviewsController.prototype, "findAll", null);
exports.AdminReviewsController = AdminReviewsController = __decorate([
    (0, common_1.Controller)('admin/reviews'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, roles_guard_js_1.RolesGuard),
    __metadata("design:paramtypes", [reviews_service_js_1.ReviewsService])
], AdminReviewsController);
//# sourceMappingURL=reviews.controller.js.map