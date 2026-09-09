import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join, normalize, resolve, sep } from 'node:path';
import type { AppConfig } from '../config/configuration';
import { StorageDriver, type StoredObject } from './storage.types';

/** Development driver — writes under STORAGE_LOCAL_DIR, served at /media. */
@Injectable()
export class LocalDiskStorage extends StorageDriver {
  private readonly logger = new Logger(LocalDiskStorage.name);
  private readonly root: string;
  private readonly baseUrl: string;

  constructor(config: ConfigService<AppConfig, true>) {
    super();
    const s = config.get('storage', { infer: true });
    this.root = resolve(process.cwd(), s.localDir);
    this.baseUrl = s.publicBaseUrl.replace(/\/$/, '');
  }

  private resolveKey(key: string): string {
    const target = normalize(join(this.root, key));
    if (target !== this.root && !target.startsWith(this.root + sep)) {
      throw new Error('Invalid storage key');
    }
    return target;
  }

  async put(
    key: string,
    body: Buffer,
    _contentType: string,
  ): Promise<StoredObject> {
    const path = this.resolveKey(key);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, body);
    return { key, url: this.publicUrl(key), sizeBytes: body.byteLength };
  }

  async delete(key: string): Promise<void> {
    try {
      await rm(this.resolveKey(key), { force: true });
    } catch (error) {
      this.logger.warn(
        `Failed to delete ${key}: ${
          error instanceof Error ? error.message : 'unknown'
        }`,
      );
    }
  }

  publicUrl(key: string): string {
    return `${this.baseUrl}/${key.replace(/^\/+/, '')}`;
  }
}
