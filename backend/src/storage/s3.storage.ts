import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import type { AppConfig } from '../config/configuration';
import { StorageDriver, type StoredObject } from './storage.types';

/** Production driver — AWS S3 or any S3-compatible store (Cloudflare R2). */
@Injectable()
export class S3Storage extends StorageDriver {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly baseUrl: string;

  constructor(config: ConfigService<AppConfig, true>) {
    super();
    const s = config.get('storage', { infer: true }).s3;
    if (!s.bucket || !s.accessKeyId || !s.secretAccessKey) {
      throw new Error(
        'STORAGE_DRIVER=s3 requires S3_BUCKET, S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY',
      );
    }
    this.bucket = s.bucket;
    this.baseUrl = (s.publicBaseUrl || '').replace(/\/$/, '');
    this.client = new S3Client({
      region: s.region,
      endpoint: s.endpoint || undefined,
      forcePathStyle: s.forcePathStyle,
      credentials: {
        accessKeyId: s.accessKeyId,
        secretAccessKey: s.secretAccessKey,
      },
    });
  }

  async put(
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<StoredObject> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    );
    return { key, url: this.publicUrl(key), sizeBytes: body.byteLength };
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }

  publicUrl(key: string): string {
    const clean = key.replace(/^\/+/, '');
    return this.baseUrl
      ? `${this.baseUrl}/${clean}`
      : `https://${this.bucket}.s3.amazonaws.com/${clean}`;
  }
}
