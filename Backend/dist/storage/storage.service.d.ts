import { ConfigService } from '@nestjs/config';
export interface UploadSignedUrlOptions {
    key: string;
    contentType: string;
    expiresIn?: number;
}
export interface DownloadSignedUrlOptions {
    key: string;
    expiresIn?: number;
    filename?: string;
}
export declare class StorageService {
    private readonly config;
    private readonly logger;
    private client;
    private readonly bucket;
    constructor(config: ConfigService);
    get isConfigured(): boolean;
    getUploadUrl(options: UploadSignedUrlOptions): Promise<string>;
    getDownloadUrl(options: DownloadSignedUrlOptions): Promise<string>;
    deleteObject(key: string): Promise<void>;
    templateFileKey(templateId: string, filename: string): string;
    templateImageKey(templateId: string, filename: string): string;
    customizeFileKey(requestId: string, filename: string): string;
}
