export interface StoredObject {
  key: string;
  url: string;
  sizeBytes: number;
}

export abstract class StorageDriver {
  /** Persist bytes under `key`. Returns the public URL. */
  abstract put(
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<StoredObject>;

  /** Remove an object. Missing objects are not an error. */
  abstract delete(key: string): Promise<void>;

  /** Public URL for an existing key. */
  abstract publicUrl(key: string): string;
}
