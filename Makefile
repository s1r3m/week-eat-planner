# Check make version.
MAKE_MIN_VERSION := 3.82
MAKE_OK := $(filter $(MAKE_MIN_VERSION),$(firstword $(sort $(MAKE_VERSION) $(MAKE_MIN_VERSION))))
ifeq ($(MAKE_OK),)
	$(error Make version required $(MAKE_MIN_VERSION)+, current version: $(MAKE_VERSION))
endif

# Versions.
PYTHON_VERSION = 3.11
PYTHON = python$(PYTHON_VERSION)
UV_VERSION = 0.6.11

# Paths.
PROJECT_PATH = $(CURDIR)
BE_PATH = $(PROJECT_PATH)/backend
FE_PATH = $(PROJECT_PATH)/frontend
ENV_FILE = $(BE_PATH)/.env
BE_TEST_ENV_FILE = $(BE_PATH)/.env.be_test

export VIRTUAL_ENV = $(PROJECT_PATH)/.venv_$(PYTHON)

# Bin.
VENV_ACTIVATE = $(VIRTUAL_ENV)/bin/activate

# Other.
SHELL = /bin/bash  # Using bash as default shell
CHECK_PYTHON = $(shell which $(PYTHON))
CHECK_UV = $(shell which uv)
COVERAGE_PERCENT = 100

export PATH := $(VIRTUAL_ENV)/bin:$(HOME)/.local/bin:$(PATH)
export PYTHONPATH = $(BE_PATH)

# Check for docker compose v2, fallback to v1 if not found.
DOCKER_COMPOSE := docker compose
ifeq ($(shell docker compose version >/dev/null 2>&1; echo $$?), 0)
	# docker compose v2 is available
else
	# fallback to docker-compose v1
	DOCKER_COMPOSE := docker-compose
endif

all: help

## ------------------------------------------------ SETUP --------------------------------------------------------------

$(VENV_ACTIVATE):
	# Check if uv is installed.
ifeq ($(CHECK_UV), )
	# UV is not installed, installing it...
	curl -LsSf https://astral.sh/uv/$(UV_VERSION)/install.sh | sh
endif
	# Check if correct python is installed.
ifeq ($(CHECK_PYTHON), )
	# $(PYTHON) was not found but needed to continue. Installing it...
	uv python install $(PYTHON_VERSION)
endif
	uv venv $(VIRTUAL_ENV) --python $(PYTHON_VERSION)

## @Setup Prepare environment.
install: $(VENV_ACTIVATE)
	# Check user uid
ifeq ($(UID),0)
	$(error Can not run this command as root user)
endif

	cd $(BE_PATH) && uv sync --all-extras --active --python $(VIRTUAL_ENV)/bin/python

## ------------------------------------------------ APP ----------------------------------------------------------------

## @App Start the DB.
run_db:
	$(DOCKER_COMPOSE) up db -d --wait db

## @Tests Prepare env file for be unittests
$(ENV_FILE):
	cp $(BE_TEST_ENV_FILE) $(ENV_FILE)

## @App Apply migrations to DB.
migrations: $(VENV_ACTIVATE) $(ENV_FILE) run_db
	cd $(BE_PATH) && alembic upgrade head

## @App Start the environment.
start: stop minio migrations
	uvicorn "week_eat_planner.main:app" --host 0.0.0.0 --port 8000 --reload

minio:
	$(DOCKER_COMPOSE) up minio -d --wait
	$(DOCKER_COMPOSE) run --rm minio-init

## @App Show docker logs.
logs:
	$(DOCKER_COMPOSE) logs

## @Tests Prepare test environment (DB + Minio).
test_env: migrations minio

## @App Stop the environment.
stop:
	$(DOCKER_COMPOSE) down --volumes --remove-orphans

## @App Connect to database.
db_shell:
	PGPASSWORD=wep uvx pgcli -h localhost -p 5432 -U wep -d wep

db_dump:
	PGPASSWORD=wep pg_dump -h localhost -p 5432 -U wep -d wep > wep_db.bck.sql

## ----------------------------------------------- BE TESTS ------------------------------------------------------------

## @Checks Run linters.
be_lint: $(VENV_ACTIVATE)
	ruff check $(BE_PATH) --config $(BE_PATH)/pyproject.toml
	ruff format $(BE_PATH) --diff --config $(BE_PATH)/pyproject.toml
	mypy --config-file $(BE_PATH)/pyproject.toml $(BE_PATH)

## @Checks Run code formatter.
be_style: $(VENV_ACTIVATE)
	ruff format $(BE_PATH) --config $(BE_PATH)/pyproject.toml
	ruff check $(BE_PATH) --fix --config $(BE_PATH)/pyproject.toml

clean:
	rm -f $(BE_PATH)/.coverage
	rm -rf $(BE_PATH)/.htmlcov

## @Tests Run be unittests.
be_test: $(VENV_ACTIVATE) clean
	cd $(BE_PATH) && \
		coverage run -m pytest tests && \
		coverage report --fail-under=$(COVERAGE_PERCENT)

## @Tests Create a HTML coverage report.
coverage:
	cd $(BE_PATH) && \
		coverage run -m pytest tests && \
		coverage html


## -------------------------------------------------- FE ---------------------------------------------------------------

# @FE Install requirements
fe_install:
	@echo "🚀 Installing the packages..."
	cd $(FE_PATH) && yarn install

## @FE Start the app
fe_start:
	@echo "🏃 Starting Vue app on port 3000..."
	cd $(FE_PATH) && yarn dev

## @FE Run linters
fe_lint:
	@echo "Run ESlint"
	cd $(FE_PATH) && yarn lint
	cd $(FE_PATH) && yarn format:check


fe_style:
	@echo "Run ESlint"
	cd $(FE_PATH) && yarn format
	cd $(FE_PATH) && yarn lint:fix

## @Tests Run fe unittests.
fe_test:
	cd $(FE_PATH) && yarn test:coverage


## ------------------------------------------------ Build --------------------------------------------------------------

clear:
	rm -rf $(BE_PATH)/build/ $(BE_PATH)/dist/ $(BE_PATH)/*.egg-info/

## @Build build python package
package: $(VENV_ACTIVATE) clear
	uv build --wheel $(BE_PATH)

HELP_TARGET_MAX_CHAR_NUM = 20

.PHONY:
help:
	@echo Usage:
	@echo '  make <target>'
	@echo '  make <target> <VAR>=<value>'
	@echo ''
	@awk '/^[a-zA-Z\-\_0-9\/]+:/ \
		{ \
			helpMessage = match(lastLine, /^## (.*)/); \
			if (helpMessage) { \
				helpCommand = substr($$1, 0, index($$1, ":")-1); \
				helpMessage = substr(lastLine, RSTART + 3, RLENGTH); \
				helpGroup = match(helpMessage, /^@([^ ]*)/); \
				if (helpGroup) { \
					helpGroup = substr(helpMessage, RSTART + 1, index(helpMessage, " ")-2); \
					helpMessage = substr(helpMessage, index(helpMessage, " ")+1); \
				} \
				printf "%s|  %-$(HELP_TARGET_MAX_CHAR_NUM)s %s\n", \
					helpGroup, helpCommand, helpMessage; \
			} \
		} \
		{ lastLine = $$0 }' \
		$(MAKEFILE_LIST) \
	| sort -t'|' -sk1,1 -k2,2 \
	| awk -F '|' ' \
			{ \
			cat = $$1; \
			if (cat != lastCat || lastCat == "") { \
				if ( cat == "0" ) { \
					print "Targets: " \
				} else { \
					gsub("_", " ", cat); \
					printf "\%s:\n", cat; \
				} \
			} \
			print $$2 \
		} \
		{ lastCat = $$1 }'
