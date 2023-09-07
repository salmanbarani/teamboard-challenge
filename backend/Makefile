.PHONY: test

COMPOSE_RUN= docker compose -f local.yaml

build:
	$(COMPOSE_RUN) up --build -d --remove-orphans

up:
	$(COMPOSE_RUN) up -d

down:
	$(COMPOSE_RUN) down

test:
	$(COMPOSE_RUN) run --rm app npm test