import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface UploadSignedUrlOptions {
  key: string;
  contentType: string;
  expiresIn?: number; // seconds, default 600 (10 min)
}

export interface DownloadSignedUrlOptions {
  key: string;
  expiresIn?: number; // seconds, default 3600 (1 hour)
  filename?: string; // Content-Disposition attachment filename
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private client: S3Client | null = null;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    const endpoint = this.config.get<string>('S3_ENDPOINT');
    const accessKeyId = this.config.get<string>('S3_ACCESS_KEY');
    const secretAccessKey = this.config.get<string>('S3_SECRET_KEY');
    const region = this.config.get<string>('S3_REGION') ?? 'auto';

    this.bucket = this.config.get<string>('S3_BUCKET') ?? 'flavor-template';

    if (endpoint && accessKeyId && secretAccessKey) {
      this.client = new S3Client({
        endpoint,
        region,
        credentials: { accessKeyId, secretAccessKey },
        forcePathStyle: true, // Required for R2 and MinIO
      });
      this.logger.log(`S3/R2 configured: ${endpoint} bucket=${this.bucket}`);
    } else {
      this.logger.warn(
        'S3/R2 not configured — storage operations will return mock URLs',
      );
    }
  }

  /** Whether the S3/R2 storage client is configured */
  get isConfigured(): boolean {
    return this.client !== null;
  }

  /**
   * Generate a pre-signed PUT URL for client-side uploads.
   * The frontend uses this URL to upload directly to S3/R2.
   */
  async getUploadUrl(options: UploadSignedUrlOptions): Promise<string> {
    if (!this.client) {
      this.logger.log(`[DEV] Mock upload URL for key: ${options.key}`);
      return `http://localhost:3001/mock-upload/${options.key}`;
    }

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: options.key,
      ContentType: options.contentType,
    });

    const url = await getSignedUrl(this.client, command, {
      expiresIn: options.expiresIn ?? 600,
    });

    this.logger.log(`Upload URL generated for key: ${options.key}`);
    return url;
  }

  /**
   * Generate a pre-signed GET URL for secure downloads.
   * Used for purchased template file downloads.
   */
  async getDownloadUrl(options: DownloadSignedUrlOptions): Promise<string> {
    if (!this.client) {
      this.logger.log(`[DEV] Mock download URL for key: ${options.key}`);
      return `http://localhost:3001/mock-download/${options.key}`;
    }

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: options.key,
      ...(options.filename && {
        ResponseContentDisposition: `attachment; filename="${options.filename}"`,
      }),
    });

    const url = await getSignedUrl(this.client, command, {
      expiresIn: options.expiresIn ?? 3600,
    });

    this.logger.log(`Download URL generated for key: ${options.key}`);
    return url;
  }

  /**
   * Delete an object from S3/R2.
   */
  async deleteObject(key: string): Promise<void> {
    if (!this.client) {
      this.logger.log(`[DEV] Mock delete for key: ${key}`);
      return;
    }

    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.client.send(command);
    this.logger.log(`Object deleted: ${key}`);
  }

  /**
   * Build the storage key for template files.
   * Convention: templates/{templateId}/{filename}
   */
  templateFileKey(templateId: string, filename: string): string {
    return `templates/${templateId}/${filename}`;
  }

  /**
   * Build the storage key for template thumbnails / images.
   * Convention: templates/{templateId}/images/{filename}
   */
  templateImageKey(templateId: string, filename: string): string {
    return `templates/${templateId}/images/${filename}`;
  }

  /**
   * Build the storage key for customize request deliverables.
   * Convention: customize/{requestId}/{filename}
   */
  customizeFileKey(requestId: string, filename: string): string {
    return `customize/${requestId}/${filename}`;
  }
}
