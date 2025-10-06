# Dixis — Media Storage (Pass 100)

## Overview

The media storage system supports dual drivers for development and production environments:

- **Default driver**: `fs` (filesystem) for dev/CI → files stored under `frontend/public/uploads/` (ignored by git)
- **Production driver**: `s3` (AWS S3, Cloudflare R2, or MinIO compatible)

## API Contract

**Endpoint**: `POST /api/uploads`
**Auth**: BASIC_AUTH via middleware (no client secrets exposed)
**Input**: multipart/form-data with `file` field
**Output**: `{ url: string, key: string }`

### Example

```bash
curl -X POST http://localhost:3000/api/uploads \
  -H "Authorization: Basic $(echo -n 'admin:password' | base64)" \
  -F "file=@producer-image.jpg"

# Response:
# {"url":"/uploads/abc-123-def.jpg","key":"abc-123-def.jpg"}
# OR (with S3):
# {"url":"https://cdn.example.com/abc-123-def.jpg","key":"abc-123-def.jpg"}
```

## Configuration

### Filesystem Driver (dev/CI)

No configuration needed - this is the default. Files are saved to:
- `frontend/public/uploads/`
- Accessible at `/uploads/{filename}`
- **Note**: These files are NOT committed to git (see `.gitignore`)

### S3/R2 Driver (production)

Set the following environment variables:

```bash
# Enable S3 driver
STORAGE_DRIVER=s3

# Required
S3_BUCKET=your-bucket-name
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key

# Optional
S3_REGION=auto  # or specific region like us-east-1
S3_ENDPOINT=https://your-r2-endpoint.com  # for R2/MinIO
S3_FORCE_PATH_STYLE=false  # set to true for MinIO
S3_PUBLIC_URL_BASE=https://cdn.example.com  # if using CDN
```

### Cloud Provider Examples

#### AWS S3

```bash
STORAGE_DRIVER=s3
S3_BUCKET=dixis-media
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=AKIA...
S3_SECRET_ACCESS_KEY=...
```

#### Cloudflare R2

```bash
STORAGE_DRIVER=s3
S3_BUCKET=dixis-media
S3_REGION=auto
S3_ENDPOINT=https://account-id.r2.cloudflarestorage.com
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_PUBLIC_URL_BASE=https://media.yourdomain.com
```

#### MinIO

```bash
STORAGE_DRIVER=s3
S3_BUCKET=dixis-media
S3_REGION=us-east-1
S3_ENDPOINT=http://localhost:9000
S3_FORCE_PATH_STYLE=true
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin
```

## CORS Configuration

For S3/R2, you need to configure CORS to allow uploads from your domain:

```json
{
  "AllowedOrigins": ["https://yourdomain.com", "http://localhost:3000"],
  "AllowedMethods": ["GET", "POST", "PUT"],
  "AllowedHeaders": ["*"],
  "ExposeHeaders": ["ETag"],
  "MaxAgeSeconds": 3000
}
```

## Security

- **Auth**: Protected by middleware using BASIC_AUTH
- **File validation**: Type (jpeg/png/webp) and size (2MB max)
- **UUID filenames**: Prevents collisions and path traversal
- **No client secrets**: All credentials server-side only

## Testing

```bash
# Run upload tests (uses fs driver by default)
cd frontend
BASIC_AUTH="admin:password" pnpm test tests/uploads

# Test with S3 (requires S3 env vars)
STORAGE_DRIVER=s3 S3_BUCKET=... BASIC_AUTH=... pnpm test tests/uploads
```

## Troubleshooting

### "file missing" error
- Ensure multipart form-data is being sent
- Field name must be `file`

### "type not allowed" error
- Only jpeg, png, webp are supported
- Check file MIME type

### "too large" error
- Max file size is 2MB
- Compress or resize image before upload

### S3 errors
- Verify bucket exists and is accessible
- Check IAM permissions (s3:PutObject, s3:PutObjectAcl)
- Ensure CORS is configured correctly
- For R2: Use correct account-id in endpoint

## Architecture

```
Client Upload Request
        ↓
   Middleware (BASIC_AUTH)
        ↓
   /api/uploads route
        ↓
   getStorage() factory
        ↓
  FsDriver | S3Driver
        ↓
   Return {url, key}
        ↓
   Update Producer.imageUrl
```

## Migration Path

To migrate from filesystem to S3:

1. Upload existing files from `public/uploads/` to S3 bucket
2. Update database: `UPDATE producers SET imageUrl = REPLACE(imageUrl, '/uploads/', 'https://cdn.../') WHERE imageUrl LIKE '/uploads/%'`
3. Set `STORAGE_DRIVER=s3` in production environment
4. Deploy

**Note**: Old filesystem URLs will still work if files remain in `public/uploads/`
