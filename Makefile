COMPOSE ?= docker compose

.PHONY: help up up-build down restart ps logs logs-backend logs-frontend logs-db build migrate-backend backend-shell frontend-shell db-shell rebuild-frontend rebuild-backend

help:
	@printf "Available targets:\n"
	@printf "  make up              # Start the dev infrastructure in detached mode with live reload\n"
	@printf "  make up-build        # Rebuild images and start the dev infrastructure\n"
	@printf "  make down            # Stop and remove containers, network, and defaults\n"
	@printf "  make restart         # Restart the full infrastructure\n"
	@printf "  make ps              # Show running compose services\n"
	@printf "  make logs            # Tail logs from all services\n"
	@printf "  make logs-backend    # Tail backend logs\n"
	@printf "  make logs-frontend   # Tail frontend logs\n"
	@printf "  make logs-db         # Tail database logs\n"
	@printf "  make build           # Build all compose images\n"
	@printf "  make migrate-backend # Run backend database migrations inside compose\n"
	@printf "  make rebuild-frontend# Reinstall frontend dependencies after package changes\n"
	@printf "  make rebuild-backend # Reinstall backend dependencies after package changes\n"
	@printf "  make backend-shell   # Open a shell in the backend container\n"
	@printf "  make frontend-shell  # Open a shell in the frontend container\n"
	@printf "  make db-shell        # Open psql in the database container\n"

up:
	$(COMPOSE) up -d

up-build:
	$(COMPOSE) up -d --build

down:
	$(COMPOSE) down

restart: down up

ps:
	$(COMPOSE) ps

logs:
	$(COMPOSE) logs -f

logs-backend:
	$(COMPOSE) logs -f backend

logs-frontend:
	$(COMPOSE) logs -f frontend

logs-db:
	$(COMPOSE) logs -f db

build:
	$(COMPOSE) build

rebuild-frontend:
	$(COMPOSE) up -d --build frontend

rebuild-backend:
	$(COMPOSE) up -d --build backend

migrate-backend:
	$(COMPOSE) run --rm backend npm run db:migrate

backend-shell:
	$(COMPOSE) exec backend sh

frontend-shell:
	$(COMPOSE) exec frontend sh

db-shell:
	$(COMPOSE) exec db psql -U workcycle -d workcycle