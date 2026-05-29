COMPOSE ?= docker compose

.PHONY: up down logs build smoke resolve-weather resolve-finance

up:
	$(COMPOSE) up --build

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f --tail=200

build:
	$(COMPOSE) build

smoke:
	$(COMPOSE) run --rm resolver-client weather.agent

resolve-weather:
	$(COMPOSE) --profile tools run --rm resolver-client weather.agent

resolve-finance:
	$(COMPOSE) --profile tools run --rm resolver-client finance.agent
