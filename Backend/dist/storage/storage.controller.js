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
exports.StorageController = void 0;
const common_1 = require("@nestjs/common");
const storage_service_js_1 = require("./storage.service.js");
const jwt_auth_guard_js_1 = require("../common/guards/jwt-auth.guard.js");
const roles_guard_js_1 = require("../common/guards/roles.guard.js");
const roles_decorator_js_1 = require("../common/decorators/roles.decorator.js");
class GetUploadUrlDto {
    key;
    contentType;
}
class GetDownloadUrlDto {
    key;
    filename;
}
let StorageController = class StorageController {
    storage;
    constructor(storage) {
        this.storage = storage;
    }
    async getUploadUrl(dto) {
        if (!dto.key || !dto.contentType) {
            throw new common_1.BadRequestException('key and contentType are required');
        }
        const url = await this.storage.getUploadUrl({
            key: dto.key,
            contentType: dto.contentType,
        });
        return { uploadUrl: url, key: dto.key };
    }
    async getDownloadUrl(dto) {
        if (!dto.key) {
            throw new common_1.BadRequestException('key is required');
        }
        const url = await this.storage.getDownloadUrl({
            key: dto.key,
            filename: dto.filename,
        });
        return { downloadUrl: url, key: dto.key };
    }
    status() {
        return {
            configured: this.storage.isConfigured,
            message: this.storage.isConfigured
                ? 'S3/R2 storage is configured and ready'
                : 'S3/R2 storage is not configured — using mock URLs',
        };
    }
};
exports.StorageController = StorageController;
__decorate([
    (0, common_1.Post)('upload-url'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [GetUploadUrlDto]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "getUploadUrl", null);
__decorate([
    (0, common_1.Post)('download-url'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [GetDownloadUrlDto]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "getDownloadUrl", null);
__decorate([
    (0, common_1.Get)('status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StorageController.prototype, "status", null);
exports.StorageController = StorageController = __decorate([
    (0, common_1.Controller)('admin/storage'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, roles_guard_js_1.RolesGuard),
    (0, roles_decorator_js_1.Roles)('ADMIN', 'STAFF'),
    __metadata("design:paramtypes", [storage_service_js_1.StorageService])
], StorageController);
//# sourceMappingURL=storage.controller.js.map