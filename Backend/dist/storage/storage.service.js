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
var StorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
let StorageService = StorageService_1 = class StorageService {
    config;
    logger = new common_1.Logger(StorageService_1.name);
    client = null;
    bucket;
    constructor(config) {
        this.config = config;
        const endpoint = this.config.get('S3_ENDPOINT');
        const accessKeyId = this.config.get('S3_ACCESS_KEY');
        const secretAccessKey = this.config.get('S3_SECRET_KEY');
        const region = this.config.get('S3_REGION') ?? 'auto';
        this.bucket = this.config.get('S3_BUCKET') ?? 'flavor-template';
        if (endpoint && accessKeyId && secretAccessKey) {
            this.client = new client_s3_1.S3Client({
                endpoint,
                region,
                credentials: { accessKeyId, secretAccessKey },
                forcePathStyle: true,
            });
            this.logger.log(`S3/R2 configured: ${endpoint} bucket=${this.bucket}`);
        }
        else {
            this.logger.warn('S3/R2 not configured — storage operations will return mock URLs');
        }
    }
    get isConfigured() {
        return this.client !== null;
    }
    async getUploadUrl(options) {
        if (!this.client) {
            this.logger.log(`[DEV] Mock upload URL for key: ${options.key}`);
            return `http://localhost:3001/mock-upload/${options.key}`;
        }
        const command = new client_s3_1.PutObjectCommand({
            Bucket: this.bucket,
            Key: options.key,
            ContentType: options.contentType,
        });
        const url = await (0, s3_request_presigner_1.getSignedUrl)(this.client, command, {
            expiresIn: options.expiresIn ?? 600,
        });
        this.logger.log(`Upload URL generated for key: ${options.key}`);
        return url;
    }
    async getDownloadUrl(options) {
        if (!this.client) {
            this.logger.log(`[DEV] Mock download URL for key: ${options.key}`);
            return `http://localhost:3001/mock-download/${options.key}`;
        }
        const command = new client_s3_1.GetObjectCommand({
            Bucket: this.bucket,
            Key: options.key,
            ...(options.filename && {
                ResponseContentDisposition: `attachment; filename="${options.filename}"`,
            }),
        });
        const url = await (0, s3_request_presigner_1.getSignedUrl)(this.client, command, {
            expiresIn: options.expiresIn ?? 3600,
        });
        this.logger.log(`Download URL generated for key: ${options.key}`);
        return url;
    }
    async deleteObject(key) {
        if (!this.client) {
            this.logger.log(`[DEV] Mock delete for key: ${key}`);
            return;
        }
        const command = new client_s3_1.DeleteObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });
        await this.client.send(command);
        this.logger.log(`Object deleted: ${key}`);
    }
    templateFileKey(templateId, filename) {
        return `templates/${templateId}/${filename}`;
    }
    templateImageKey(templateId, filename) {
        return `templates/${templateId}/images/${filename}`;
    }
    customizeFileKey(requestId, filename) {
        return `customize/${requestId}/${filename}`;
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = StorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StorageService);
//# sourceMappingURL=storage.service.js.map