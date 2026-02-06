# Nginx Configuration — dixis.gr

**Last Updated**: 2026-02-06
**Location on VPS**: `/etc/nginx/sites-enabled/dixis.gr`

---

## Overview

The nginx configuration routes traffic between:
- **Next.js Frontend** (port 3000) - Most routes
- **Laravel Backend** (PHP-FPM socket) - Legacy `/api` routes

---

## Routing Rules (Order Matters!)

| Priority | Path | Destination | Notes |
|----------|------|-------------|-------|
| 1 | `/api/producer/` | Next.js | Producer API |
| 2 | `/api/auth/` | Next.js | OTP authentication |
| 3 | `/api/healthz` | Next.js | Health check |
| 4 | `/api/health` | Next.js | Health check alt |
| 5 | `/api/admin/` | Next.js | **Admin API** (added 2026-02-06) |
| 6 | `/api/categories` | Next.js | Categories API (added 2026-02-06) |
| 7 | `/api` | Laravel | Fallback for Laravel routes |
| 8 | `/storage/` | Static | Laravel public files |
| 9 | `/_next/static/` | Static | Next.js assets (cached 365d) |
| 10 | `/checkout` | Next.js | No-cache (AG-CACHE-01) |
| 11 | `/` | Next.js | Everything else |

---

## How to Modify

### On VPS:
```bash
# Edit config
sudo nano /etc/nginx/sites-enabled/dixis.gr

# Test syntax
sudo nginx -t

# Reload (if test passes)
sudo systemctl reload nginx
```

### Backup:
```bash
# Create backup
cp /etc/nginx/sites-enabled/dixis.gr /var/www/dixis/shared/nginx-dixis.gr.conf.bak
```

---

## Full Config (Reference)

```nginx
# Dixis.gr - Production Config
# Frontend: Next.js (PM2 on port 3000)
# Backend: Laravel (PHP-FPM socket)

server {
    server_name dixis.gr www.dixis.gr;

    # Body size for uploads
    client_max_body_size 10M;
    client_body_buffer_size 128k;

    # For certbot verification
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # === FRONTEND API ROUTES (Next.js) ===
    location ^~ /api/producer/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # === FRONTEND AUTH API (Next.js OTP) ===
    location ^~ /api/auth/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location ^~ /api/healthz {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location ^~ /api/health {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # === ADMIN API ROUTES (Next.js) ===
    # Added 2026-02-06 for admin panel to work
    location ^~ /api/admin/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Cookie $http_cookie;
    }

    # === CATEGORIES API (Next.js) ===
    location ^~ /api/categories {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Cookie $http_cookie;
    }

    # === BACKEND API (Laravel via PHP-FPM) ===
    location /api {
        root /var/www/dixis/current/backend/public;
        client_body_buffer_size 128k;
        fastcgi_pass unix:/run/php/php8.2-fpm-dixis-backend.sock;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME /var/www/dixis/current/backend/public/index.php;
        fastcgi_param REQUEST_URI $request_uri;
        fastcgi_param CONTENT_TYPE $content_type;
        fastcgi_param CONTENT_LENGTH $content_length;
        fastcgi_keep_conn on;
        fastcgi_read_timeout 300;
    }

    # === STORAGE (Laravel public files) ===
    location ^~ /storage/ {
        alias /var/www/dixis/current/backend/storage/app/public/;
        try_files $uri =404;
    }

    # === NEXT.JS STATIC ASSETS ===
    location ^~ /_next/static/ {
        alias /var/www/dixis/current/frontend/.next/static/;
        access_log off;
        expires 365d;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # === CHECKOUT (no-cache) ===
    location ^~ /checkout {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_hide_header Cache-Control;
        add_header Cache-Control "no-store, no-cache, must-revalidate" always;
        add_header Pragma "no-cache" always;
    }

    # === FRONTEND (catch-all) ===
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/dixis.gr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dixis.gr/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

server {
    if ($host = www.dixis.gr) {
        return 301 https://$host$request_uri;
    }
    if ($host = dixis.gr) {
        return 301 https://$host$request_uri;
    }
    listen 80;
    server_name dixis.gr www.dixis.gr;
    return 404;
}
```

---

## Changelog

| Date | Change |
|------|--------|
| 2026-02-06 | Added `/api/admin/` route to Next.js |
| 2026-02-06 | Added `/api/categories` route to Next.js |
| 2026-02-06 | Created this documentation |

---

_Backup also stored at: `/var/www/dixis/shared/nginx-dixis.gr.conf.bak`_
