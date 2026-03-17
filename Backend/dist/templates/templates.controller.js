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
exports.AdminTemplatesController = exports.TemplatesController = void 0;
const common_1 = require("@nestjs/common");
const templates_service_js_1 = require("./templates.service.js");
const create_template_dto_js_1 = require("./dto/create-template.dto.js");
const update_template_dto_js_1 = require("./dto/update-template.dto.js");
const query_template_dto_js_1 = require("./dto/query-template.dto.js");
const jwt_auth_guard_js_1 = require("../common/guards/jwt-auth.guard.js");
const roles_guard_js_1 = require("../common/guards/roles.guard.js");
const roles_decorator_js_1 = require("../common/decorators/roles.decorator.js");
let TemplatesController = class TemplatesController {
    templatesService;
    constructor(templatesService) {
        this.templatesService = templatesService;
    }
    findAll(query) {
        return this.templatesService.findAll(query);
    }
    findFeatured() {
        return this.templatesService.findFeatured();
    }
    findBySlug(slug) {
        return this.templatesService.findBySlug(slug);
    }
};
exports.TemplatesController = TemplatesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_template_dto_js_1.QueryTemplateDto]),
    __metadata("design:returntype", void 0)
], TemplatesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('featured'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TemplatesController.prototype, "findFeatured", null);
__decorate([
    (0, common_1.Get)(':slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TemplatesController.prototype, "findBySlug", null);
exports.TemplatesController = TemplatesController = __decorate([
    (0, common_1.Controller)('templates'),
    __metadata("design:paramtypes", [templates_service_js_1.TemplatesService])
], TemplatesController);
let AdminTemplatesController = class AdminTemplatesController {
    templatesService;
    constructor(templatesService) {
        this.templatesService = templatesService;
    }
    findAll(query) {
        return this.templatesService.findAllAdmin(query);
    }
    create(dto) {
        return this.templatesService.create(dto);
    }
    update(id, dto) {
        return this.templatesService.update(id, dto);
    }
    remove(id) {
        return this.templatesService.remove(id);
    }
};
exports.AdminTemplatesController = AdminTemplatesController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_js_1.Roles)('ADMIN', 'STAFF'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_template_dto_js_1.QueryTemplateDto]),
    __metadata("design:returntype", void 0)
], AdminTemplatesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_js_1.Roles)('ADMIN', 'STAFF'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_template_dto_js_1.CreateTemplateDto]),
    __metadata("design:returntype", void 0)
], AdminTemplatesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_js_1.Roles)('ADMIN', 'STAFF'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_template_dto_js_1.UpdateTemplateDto]),
    __metadata("design:returntype", void 0)
], AdminTemplatesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_js_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminTemplatesController.prototype, "remove", null);
exports.AdminTemplatesController = AdminTemplatesController = __decorate([
    (0, common_1.Controller)('admin/templates'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, roles_guard_js_1.RolesGuard),
    __metadata("design:paramtypes", [templates_service_js_1.TemplatesService])
], AdminTemplatesController);
//# sourceMappingURL=templates.controller.js.map