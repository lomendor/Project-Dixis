import { createHash } from 'crypto';

export type PutResult = { url: string, key?: string };
type Buf = ArrayBuffer | Uint8Array;

function yyyymm(d=new Date()){ const y=d.getFullYear(); const m=String(d.getMonth()+1).padStart(2,'0'); return `${y}${m}`; }
function extFromMime(m: string){ if(m.includes('jpeg')) return 'jpg'; if(m.includes('png')) return 'png'; if(m.includes('webp')) return 'webp'; if(m.includes('pdf')) return 'pdf'; return 'bin'; }
function sha16(b: Uint8Array){ const h=createHash('sha256').update(b).digest('hex'); return h.slice(0,16); }

async function maybeProcess(buf: Uint8Array, mime: string): Promise<Uint8Array>{
  // Skip processing for non-image files (PDFs etc.)
  if (mime.includes('pdf')) return buf;
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
  const { existsSync } = await import('fs');
  const raw = data instanceof Uint8Array ? data : Buffer.from(data as ArrayBuffer);
  const processed = await maybeProcess(raw, mime);
  const hash = sha16(processed);
  const ext = extFromMime(mime);
  const folder = yyyymm();
  const key = `${hash}.${ext}`;

  // FIX-UPLOAD-PERSIST-01: Write to persistent shared directory, NOT public/.
  // Next.js `next start` only serves files from public/ that existed at build time.
  // Files written to public/ after build are invisible AND get wiped on redeploy.
  // In production, UPLOAD_DIR points to /var/www/dixis/shared/uploads (nginx serves directly).
  // In dev, falls back to public/uploads (works because `next dev` serves live).
  const uploadRoot = process.env.UPLOAD_DIR;
  let uploadDir: string;

  if (uploadRoot) {
    // Production: use dedicated persistent directory (served by nginx)
    uploadDir = join(uploadRoot, folder);
  } else {
    // Dev fallback: write to public/uploads (next dev serves these live)
    const cwd = process.cwd();
    if (existsSync(join(cwd, 'public'))) {
      uploadDir = join(cwd, 'public', 'uploads', folder);
    } else if (existsSync(join(cwd, 'frontend', 'public'))) {
      uploadDir = join(cwd, 'frontend', 'public', 'uploads', folder);
    } else {
      uploadDir = join(cwd, 'public', 'uploads', folder);
    }
  }

  await mkdir(uploadDir, { recursive: true });
  await writeFile(join(uploadDir, key), processed);
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
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
  if (!accessKeyId || !secretAccessKey) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY must be set in production');
    }
    // Dev/CI: fall back to local MinIO defaults (only when env vars are missing)
    console.warn('[storage] S3 credentials not set — using dev defaults');
  }
  const client = new S3Client({
    region, endpoint, forcePathStyle,
    credentials: {
      accessKeyId: accessKeyId || 'minioadmin',
      secretAccessKey: secretAccessKey || 'minioadmin'
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
