BACKEND=backend
LOGS=.logs
.PHONY: up down reset logs
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
