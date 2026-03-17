import { StorageService } from './storage.service.js';
declare class GetUploadUrlDto {
    key: string;
    contentType: string;
}
declare class GetDownloadUrlDto {
    key: string;
    filename?: string;
}
export declare class StorageController {
    private readonly storage;
    constructor(storage: StorageService);
    getUploadUrl(dto: GetUploadUrlDto): Promise<{
        uploadUrl: string;
        key: string;
    }>;
    getDownloadUrl(dto: GetDownloadUrlDto): Promise<{
        downloadUrl: string;
        key: string;
    }>;
    status(): {
        configured: boolean;
        message: string;
    };
}
export {};
