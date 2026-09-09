import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../config/configuration';
import { StorageDriver } from './storage.types';
import { LocalDiskStorage } from './local-disk.storage';
import { S3Storage } from './s3.storage';

@Global()
@Module({
  providers: [
    {
      provide: StorageDriver,
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>): StorageDriver => {
        const driver = config.get('storage', { infer: true }).driver;
        return driver === 's3'
          ? new S3Storage(config)
          : new LocalDiskStorage(config);
      },
    },
  ],
  exports: [StorageDriver],
})
export class StorageModule {}
