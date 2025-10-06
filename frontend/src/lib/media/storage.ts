import { createHash } from 'crypto';

export type PutResult = { url: string, key?: string };
type Buf = ArrayBuffer | Uint8Array;

function yyyymm(d=new Date()){ const y=d.getFullYear(); const m=String(d.getMonth()+1).padStart(2,'0'); return `${y}${m}`; }
function extFromMime(m: string){ if(m.includes('jpeg')) return 'jpg'; if(m.includes('png')) return 'png'; if(m.includes('webp')) return 'webp'; return 'bin'; }
function sha16(b: Uint8Array){ const h=createHash('sha256').update(b).digest('hex'); return h.slice(0,16); }

async function maybeProcess(buf: Uint8Array, mime: string): Promise<Uint8Array>{
  if (String(process.env.ENABLE_IMAGE_PROCESSING || '').toLowerCase() !== 'true') return buf;
  try{
    const sharp = (await import('sharp')).default;
    const ext = extFromMime(mime);
    return await sharp(buf)
      .rotate()
      .resize({ width:1200, height:1200, fit:'inside', withoutEnlargement:true })
      .toFormat(ext==='jpg'?'jpeg':ext==='png'?'png':'webp', { quality: 85 })
      .toBuffer();
  }catch{ return buf; }
}

export async function putObjectFs(data: Buf, mime: string): Promise<PutResult>{
  const { writeFile, mkdir } = await import('fs/promises');
  const { join } = await import('path');
  const raw = data instanceof Uint8Array ? data : Buffer.from(data as ArrayBuffer);
  const processed = await maybeProcess(raw, mime);
  const hash = sha16(processed);
  const ext = extFromMime(mime);
  const folder = yyyymm();
  const key = `${hash}.${ext}`;
  const dir = join(process.cwd(), 'frontend', 'public', 'uploads', folder);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, key), processed);
  return { url: `/uploads/${folder}/${key}`, key: `uploads/${folder}/${key}` };
}

export async function putObjectS3(data: Buf, mime: string): Promise<PutResult>{
  const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
  const region = process.env.S3_REGION || 'us-east-1';
  const endpoint = process.env.S3_ENDPOINT || undefined;
  const forcePathStyle = !!endpoint && !endpoint.includes('amazonaws.com');
  const Bucket = process.env.S3_BUCKET || 'dixis-media';
  const base = process.env.S3_PUBLIC_URL_BASE || process.env.S3_PUBLIC_BASE || (endpoint ? endpoint.replace(/\/+$/,'') : '');
  const raw = data instanceof Uint8Array ? data : Buffer.from(data as ArrayBuffer);
  const processed = await maybeProcess(raw, mime);
  const hash = sha16(processed);
  const ext = extFromMime(mime);
  const folder = yyyymm();
  const Key = `uploads/${folder}/${hash}.${ext}`;
  const client = new S3Client({
    region, endpoint, forcePathStyle,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID || 'minioadmin',
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || 'minioadmin'
    }
  });
  await client.send(new PutObjectCommand({ Bucket, Key, Body: processed, ContentType: mime, ACL: 'public-read' } as any));
  const url = base ? `${base.replace(/\/+$/,'')}/${Bucket}/${Key}` : `https://${Bucket}.s3.amazonaws.com/${Key}`;
  return { url, key: Key };
}

export async function putObject(data: Buf, mime: string){
  const driver = (process.env.STORAGE_DRIVER || 'fs').toLowerCase();
  return driver === 's3' ? putObjectS3(data, mime) : putObjectFs(data, mime);
}
