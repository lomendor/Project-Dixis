# 🎯 Project-Dixis Makefile
# Developer Experience (DX) targets for common operations

BACKEND=backend
FRONTEND=frontend
LOGS=.logs

.PHONY: help qa ci-local report fix clean install test build up down reset logs dev-backend dev-frontend calibrate

# Default target
help:
	@echo "🎯 Project-Dixis Developer Commands"
	@echo ""
	@echo "🧪 Quality Assurance:"
	@echo "  make qa        - Run all quality checks (phpunit + npm run qa:all)"
	@echo "  make ci-local  - Run the same checks as CI pipeline"
	@echo "  make test      - Run all tests (backend + frontend + e2e)"
	@echo ""
	@echo "📚 Documentation:"
	@echo "  make report    - Generate reports (auditor + scribe)"
	@echo "  make calibrate - Calibrate shipping rates from CSV samples"
	@echo ""
	@echo "🔧 Code Fixes:"
	@echo "  make fix       - Auto-fix code style (pint + eslint --fix)"
	@echo ""
	@echo "🏗️  Build & Setup:"
	@echo "  make install   - Install all dependencies"
	@echo "  make build     - Build both backend and frontend"
	@echo "  make clean     - Clean build artifacts and caches"
	@echo ""
	@echo "🚀 Development (Legacy):"
	@echo "  make up        - Start backend development server"
	@echo "  make down      - Stop backend development server"
	@echo "  make reset     - Reset database with fresh migrations"
	@echo "  make logs      - Show backend logs"

# 🧪 Quality Assurance
qa:
	@echo "🧪 Running Quality Assurance checks..."
	@echo "📍 Backend: PHPUnit tests..."
	cd $(BACKEND) && php artisan test
	@echo "📍 Frontend: Quality checks..."
	cd $(FRONTEND) && npm run qa:all
	@echo "✅ Quality assurance complete!"

# 🤖 CI Local - Same as CI pipeline
ci-local:
	@echo "🤖 Running CI pipeline locally..."
	@echo "📍 Backend: PHP tests, linting, and static analysis..."
	cd $(BACKEND) && php artisan test --env=testing
	cd $(BACKEND) && ./vendor/bin/pint --test
	@echo "📍 Frontend: Build, test, and quality checks..."
	cd $(FRONTEND) && npm run qa:all
	cd $(FRONTEND) && npm run build
	@echo "📍 E2E: Smoke tests..."
	cd $(FRONTEND) && npm run e2e:smoke
	@echo "✅ CI local pipeline complete!"

# 📚 Documentation Reports
report:
	@echo "📚 Generating documentation reports..."
	@echo "📍 Running Auditor (static analysis)..."
	./scripts/subagents.sh audit
	@echo "📍 Running Docs Scribe (PR summary)..."
	./scripts/subagents.sh docs
	@echo "✅ Reports generated in backend/docs/reports/$$(date +%Y-%m-%d)/"

# 🔧 Code Fixes
fix:
	@echo "🔧 Auto-fixing code style issues..."
	@echo "📍 Backend: Laravel Pint..."
	cd $(BACKEND) && ./vendor/bin/pint
	@echo "📍 Frontend: ESLint auto-fix..."
	cd $(FRONTEND) && npm run lint:fix
	@echo "📍 Frontend: Prettier formatting..."
	cd $(FRONTEND) && npm run format
	@echo "✅ Code style fixes applied!"

# 🧪 All Tests
test:
	@echo "🧪 Running all test suites..."
	@echo "📍 Backend: PHPUnit..."
	cd $(BACKEND) && php artisan test
	@echo "📍 Frontend: Vitest..."
	cd $(FRONTEND) && npm run test:unit
	@echo "📍 E2E: Playwright..."
	cd $(FRONTEND) && npm run e2e
	@echo "✅ All tests complete!"

# 🏗️ Installation
install:
	@echo "🏗️ Installing all dependencies..."
	@echo "📍 Backend: Composer..."
	cd $(BACKEND) && composer install
	@echo "📍 Frontend: NPM..."
	cd $(FRONTEND) && npm install
	@echo "✅ Dependencies installed!"

# 🏗️ Build
build:
	@echo "🏗️ Building project..."
	@echo "📍 Backend: Laravel optimizations..."
	cd $(BACKEND) && php artisan config:cache || true
	cd $(BACKEND) && php artisan route:cache || true
	@echo "📍 Frontend: Next.js build..."
	cd $(FRONTEND) && npm run build
	@echo "✅ Build complete!"

# 🧹 Clean
clean:
	@echo "🧹 Cleaning build artifacts and caches..."
	@echo "📍 Backend: Laravel caches..."
	cd $(BACKEND) && php artisan config:clear || true
	cd $(BACKEND) && php artisan route:clear || true
	cd $(BACKEND) && php artisan cache:clear || true
	@echo "📍 Frontend: Next.js and node_modules caches..."
	cd $(FRONTEND) && rm -rf .next
	cd $(FRONTEND) && rm -rf node_modules/.cache
	@echo "📍 General: Test results and reports..."
	rm -rf $(BACKEND)/test-results
	rm -rf $(FRONTEND)/test-results
	rm -rf $(FRONTEND)/playwright-report
	@echo "✅ Cleanup complete!"

# 🚀 Development servers (Legacy targets)
up:
	@mkdir -p $(LOGS)
	@lsof -ti :8001 | xargs kill -9 2>/dev/null || true
	@cd $(BACKEND) && php artisan migrate:fresh --seed
	@nohup sh -c "cd $(BACKEND) && php artisan serve --host=127.0.0.1 --port=8001" > $(LOGS)/backend.log 2>&1 &

down:
	@lsof -ti :8001 | xargs kill -9 2>/dev/null || true

reset:
	@cd $(BACKEND) && php artisan migrate:fresh --seed

logs:
	@tail -n 80 $(LOGS)/backend.log || true

# 🚀 Development shortcuts
dev-backend:
	@echo "🚀 Starting backend development server..."
	cd $(BACKEND) && php artisan serve --port=8001

dev-frontend:
	@echo "🚀 Starting frontend development server..."
	cd $(FRONTEND) && npm run dev

# 📊 Shipping Calibration
calibrate:
	@echo "📊 Running shipping calibration..."
	cd $(BACKEND) && php artisan shipping:calibrate docs/samples/orders-20.template.csv
	@echo "✅ Calibration complete!"

prd-map:
	@mkdir -p docs/_mem/logs
	@echo "Running PRD mapper…"
	@./scripts/map_prd_links.sh | tee docs/_mem/logs/$$(date +%Y%m%d-%H%M)-prd-mapping.log
	@echo "Done. Logs in docs/_mem/logs"
