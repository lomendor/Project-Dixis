# Deployment Guide

This guide covers deploying Project Dixis to production environments.

## Architecture Overview

Project Dixis consists of two main components:
- **Backend**: Laravel 11 API with PostgreSQL database
- **Frontend**: Next.js 15 application consuming the API

## Environment Requirements

### Backend Requirements
- PHP 8.2+
- PostgreSQL 15+
- Composer
- Web server (Nginx/Apache)

### Frontend Requirements  
- Node.js 20+
- npm/yarn

## Local Development Setup

### 1. Backend Setup
```bash
cd backend/
composer install
cp .env.example .env
php artisan key:generate

# Configure database in .env
DB_CONNECTION=pgsql
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=dixis
DB_USERNAME=your_username
DB_PASSWORD=your_password

# Run migrations and seeders
php artisan migrate --seed
php artisan serve
```

### 2. Frontend Setup
```bash
cd backend/frontend/
npm install
npm run build
npm start
```

### 3. Run E2E Tests
```bash
cd backend/frontend/
npm run e2e
```

## Production Deployment Options

### Option 1: Traditional VPS Deployment

#### Backend Deployment
1. **Server Setup**
   ```bash
   # Install PHP 8.2, PostgreSQL, Nginx
   sudo apt update
   sudo apt install php8.2-fpm php8.2-pgsql postgresql nginx
   ```

2. **Deploy Laravel**
   ```bash
   # Clone repository
   git clone https://github.com/lomendor/Project-Dixis.git
   cd Project-Dixis/backend
   
   # Install dependencies
   composer install --optimize-autoloader --no-dev
   
   # Configure environment
   cp .env.example .env
   # Edit .env with production values
   
   # Generate key and run migrations
   php artisan key:generate
   php artisan migrate --force
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

3. **Nginx Configuration**
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;
       root /var/www/Project-Dixis/backend/public;
       
       index index.php;
       
       location / {
           try_files $uri $uri/ /index.php?$query_string;
       }
       
       location ~ \.php$ {
           fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
           fastcgi_index index.php;
           fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
           include fastcgi_params;
       }
   }
   ```

#### Frontend Deployment
1. **Build and Deploy**
   ```bash
   cd backend/frontend
   npm install
   npm run build
   
   # Using PM2 for process management
   npm install -g pm2
   pm2 start npm --name "dixis-frontend" -- start
   pm2 startup
   pm2 save
   ```

2. **Nginx Proxy Configuration**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Option 2: Vercel Deployment (Frontend Only)

For frontend-only deployment to Vercel:

1. **Vercel Configuration** (`vercel.json`):
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "backend/frontend/package.json",
         "use": "@vercel/next"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "backend/frontend/$1"
       }
     ],
     "env": {
       "NEXT_PUBLIC_API_URL": "https://your-api-domain.com"
     }
   }
   ```

2. **Deploy to Vercel**:
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Deploy
   vercel --prod
   ```

### Option 3: Docker Deployment

#### Docker Compose Configuration
```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: dixis_production
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      - DB_HOST=postgres
      - DB_DATABASE=dixis_production
      - DB_USERNAME=postgres
      - DB_PASSWORD=secure_password
    depends_on:
      - postgres
    ports:
      - "8000:8000"

  frontend:
    build:
      context: ./backend/frontend
      dockerfile: Dockerfile
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    depends_on:
      - backend
    ports:
      - "3000:3000"

volumes:
  postgres_data:
```

#### Backend Dockerfile
```dockerfile
# backend/Dockerfile
FROM php:8.2-fpm

# Install dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy application files
COPY . .

# Install PHP dependencies
RUN composer install --optimize-autoloader --no-dev

# Set permissions
RUN chown -R www-data:www-data /var/www

EXPOSE 8000

CMD php artisan serve --host=0.0.0.0 --port=8000
```

#### Frontend Dockerfile  
```dockerfile
# backend/frontend/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Build application
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

## Environment Variables

### Backend (.env)
```env
APP_NAME="Project Dixis"
APP_ENV=production
APP_KEY=base64:your-generated-key
APP_DEBUG=false
APP_URL=https://api.yourdomain.com

DB_CONNECTION=pgsql
DB_HOST=your-db-host
DB_PORT=5432
DB_DATABASE=dixis_production
DB_USERNAME=your-db-user
DB_PASSWORD=your-db-password

SANCTUM_STATEFUL_DOMAINS=yourdomain.com,localhost:3000
SESSION_DOMAIN=.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com,http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

## Security Considerations

1. **HTTPS Setup**: Use SSL certificates (Let's Encrypt recommended)
2. **Database Security**: Use strong passwords and limit access
3. **Environment Variables**: Never commit sensitive values to version control
4. **CORS Configuration**: Properly configure allowed origins
5. **Rate Limiting**: Configure API rate limits for production
6. **Monitoring**: Set up logging and monitoring for production

## Post-Deployment Checklist

- [ ] SSL certificate installed and working
- [ ] Database migrations ran successfully
- [ ] Environment variables configured correctly
- [ ] CORS settings allow frontend domain
- [ ] API health endpoint responding (`/api/health`)
- [ ] Frontend loading and connecting to API
- [ ] User registration and login working
- [ ] Product catalog loading correctly
- [ ] Cart functionality working
- [ ] Order placement and tracking functional
- [ ] Producer dashboard accessible
- [ ] E2E tests passing against production environment

## Monitoring & Maintenance

### Health Checks
- Backend: `GET /api/health`
- Frontend: Standard HTTP 200 response
- Database: Connection test via health endpoint

### Backup Strategy
- Database: Daily automated backups
- Code: Version control with tagged releases
- Files: Regular file system backups if applicable

### Updates
- Use semantic versioning (see CHANGELOG.md)
- Test in staging environment first
- Run E2E tests before production deployment
- Monitor application after updates

## Troubleshooting

### Common Issues
1. **CORS Errors**: Check `SANCTUM_STATEFUL_DOMAINS` and `CORS_ALLOWED_ORIGINS`
2. **Database Connection**: Verify credentials and host connectivity
3. **Missing Dependencies**: Run `composer install` and `npm install`
4. **Permission Issues**: Check file permissions and ownership
5. **API 500 Errors**: Check Laravel logs in `storage/logs/`

### Logs
- Laravel: `storage/logs/laravel.log`
- Nginx: `/var/log/nginx/error.log`
- PM2: `pm2 logs dixis-frontend`

For support, check the GitHub repository issues or create a new issue with deployment details.