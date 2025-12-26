#!/usr/bin/env bash
set -euo pipefail
cd backend
# Laravel dev server (no secrets printed)
php artisan serve --host 127.0.0.1 --port 8001
