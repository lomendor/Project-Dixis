import { randomUUID } from 'crypto';

export type UploadResult = { url: string; key: string };

export interface StorageDriver {
  putObject(options: { contentType: string; body: Buffer; ext?: string }): Promise<UploadResult>;
}

function safeExt(ct: string, fallback = 'bin') {
  if (ct === 'image/png') return 'png';
  if (ct === 'image/webp') return 'webp';
  if (ct === 'image/jpeg' || ct === 'image/jpg') return 'jpg';
  return fallback;
}

// FS driver (dev/CI)
class FsDriver implements StorageDriver {
  async putObject({
    contentType,
    body,
    ext,
  }: {
    contentType: string;
    body: Buffer;
    ext?: string;
  }): Promise<UploadResult> {
    const { mkdir, writeFile } = await import('fs/promises');
    const path = (await import('path')).default;
    const name = randomUUID() + '.' + (ext || safeExt(contentType));
    const dir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, name), body);
    return { url: '/uploads/' + name, key: name };
  }
}

// S3/R2 driver (prod)
class S3Driver implements StorageDriver {
  private client: any;
  private bucket: string;
  private publicBase?: string;
  private region?: string;
  private put: (params: any) => Promise<any>;

  constructor() {
    const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
    const endpoint = process.env.S3_ENDPOINT || undefined; // R2/MinIO
    this.bucket = process.env.S3_BUCKET as string;
    this.publicBase = process.env.S3_PUBLIC_URL_BASE || '';
    this.region = process.env.S3_REGION || 'auto';
    const forcePathStyle = process.env.S3_FORCE_PATH_STYLE === 'true';
    this.client = new S3Client({
      region: this.region,
      endpoint,
      forcePathStyle,
      credentials:
        process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY
          ? {
              accessKeyId: process.env.S3_ACCESS_KEY_ID,
              secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
            }
          : undefined,
    });
    this.put = async (params: any) => this.client.send(new PutObjectCommand(params));
  }

  async putObject({
    contentType,
    body,
    ext,
  }: {
    contentType: string;
    body: Buffer;
    ext?: string;
  }): Promise<UploadResult> {
    const key = randomUUID() + '.' + (ext || safeExt(contentType));
    await this.put({
      Bucket: this.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      ACL: 'public-read',
    }).catch((e: any) => {
      throw e;
    });
    let url = '';
    if (this.publicBase) {
      url = this.publicBase.replace(/\/+$/, '') + '/' + key;
    } else if (process.env.S3_ENDPOINT) {
      url = process.env.S3_ENDPOINT.replace(/\/+$/, '') + '/' + this.bucket + '/' + key;
    } else {
      url = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
    }
    return { url, key };
  }
}

export function getStorage(): StorageDriver {
  const driver = (process.env.STORAGE_DRIVER || 'fs').toLowerCase();
  if (driver === 's3') return new S3Driver();
  return new FsDriver();
}
