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

export VIRTUAL_ENV ?= $(PROJECT_PATH)/.venv_$(PYTHON)

# Bin.
VENV_ACTIVATE = $(VIRTUAL_ENV)/bin/activate

# Other.
SHELL = /bin/bash  # Using bash as default shell
CHECK_PYTHON = $(shell which $(PYTHON))
CHECK_UV = $(shell which uv)

export PATH := $(VIRTUAL_ENV)/bin:$(HOME)/.local/bin:$(PATH)
export PYTHONPATH = $(BE_PATH)

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

	cd $(BE_PATH) && uv sync --active --all-extras

## ------------------------------------------------ APP ----------------------------------------------------------------

## @App Start the environment.
start: stop
	docker-compose build --pull  && \
	docker-compose up

debug: $(VENV_ACTIVATE) stop
	docker-compose up -d db
	sleep 2
	cd $(BE_PATH) && alembic upgrade head
	uvicorn "week_eat_planner.main:app" --host 0.0.0.0 --port 8000 --reload

## @App Stop the environment.
stop:
	docker-compose kill   && \
	docker-compose down --volumes --remove-orphans

## @App SSH to backend container.
in:
	docker exec -it week-eat-planner-backend-1 bash

## @App Connect to database.
db_shell:
	PGPASSWORD=wep psql -h localhost -U wep -d wep

## ------------------------------------------------ TESTS --------------------------------------------------------------

## @Checks Run linters.
lint: $(VENV_ACTIVATE)
	black --config $(BE_PATH)/pyproject.toml --check --diff --color $(BE_PATH)
	pylint --rcfile $(BE_PATH)/pyproject.toml $(BE_PATH) --output-format=colorized --jobs=2
	mypy --config-file $(BE_PATH)/pyproject.toml $(BE_PATH)

## @Checks Run code formatter.
style: $(VENV_ACTIVATE)
	black --config $(BE_PATH)/pyproject.toml $(BE_PATH)

## @Tests Run be unittests.
be_test: $(VENV_ACTIVATE)
	pytest $(BE_PATH)/tests
	coverage report

## @Tests Run fe unittests.
fe_test:
	# TODO: add tests

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
